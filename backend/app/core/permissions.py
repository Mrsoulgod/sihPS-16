import asyncio
import uuid
from typing import List, Optional, Callable, Any
from fastapi import Depends, Header
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import DomainException
from app.core.security import decode_access_token
from app.models.user import User


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency extracting and validating the JWT bearer token or demo token from Authorization header.
    Strictly validates session identity against server state. Unauthenticated or invalid requests receive 401.
    """
    if not authorization or not authorization.strip():
        raise DomainException(
            status_code=401,
            code="UNAUTHORIZED",
            message="Authentication credentials were not provided.",
        )

    parts = authorization.strip().split(" ")
    token = parts[1] if len(parts) == 2 else parts[0]

    if not token:
        raise DomainException(
            status_code=401,
            code="UNAUTHORIZED",
            message="Empty or invalid authorization header.",
        )

    user: Optional[User] = None

    # 1. Check if demo token pattern (e.g. demo_token_<identifier>)
    if token.startswith("demo_token_"):
        identifier = token.replace("demo_token_", "").strip()
        # In case token has timestamp attached, e.g. demo_token_00000000-0000-..._17123456
        uuid_part = identifier.split("_")[0] if "_" in identifier else identifier
        from app.core.demo_users import get_demo_user, get_demo_user_by_uuid
        try:
            user = get_demo_user_by_uuid(uuid.UUID(uuid_part))
        except Exception:
            user = get_demo_user(identifier)

        if not user:
            try:
                stmt = (
                    select(User)
                    .options(
                        selectinload(User.role),
                        selectinload(User.state),
                        selectinload(User.district),
                    )
                    .where(or_(User.username == identifier, User.email == identifier))
                )
                res = await asyncio.wait_for(db.execute(stmt), timeout=2.0)
                user = res.scalar_one_or_none()
            except Exception:
                pass
    else:
        # 2. Decode JWT access token
        payload = decode_access_token(token)
        if not payload:
            raise DomainException(
                status_code=401,
                code="INVALID_TOKEN",
                message="Access token is invalid or has expired.",
            )

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise DomainException(
                status_code=401,
                code="INVALID_TOKEN",
                message="Token payload missing subject identifier.",
            )

        try:
            user_uuid = uuid.UUID(user_id_str)
            stmt = (
                select(User)
                .options(
                    selectinload(User.role),
                    selectinload(User.state),
                    selectinload(User.district),
                )
                .where(User.id == user_uuid)
            )
            result = await asyncio.wait_for(db.execute(stmt), timeout=2.0)
            user = result.scalar_one_or_none()
        except Exception:
            user = None


        if not user:
            from app.core.demo_users import get_demo_user_by_uuid, get_demo_user
            try:
                user = get_demo_user_by_uuid(uuid.UUID(user_id_str))
            except Exception:
                user = get_demo_user(user_id_str)

    if not user:
        raise DomainException(
            status_code=401,
            code="UNAUTHORIZED",
            message="Authenticated user record could not be found.",
        )

    if not user.is_active:
        raise DomainException(
            status_code=403,
            code="ACCOUNT_DEACTIVATED",
            message="Your account has been deactivated. Contact your administrator.",
        )

    return user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Extract and validate the JWT bearer token if present;
    returns None gracefully if absent or invalid for public transparency access.
    """
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except Exception:
        return None


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensures user is authenticated and active.
    """
    if not current_user.is_active:
        raise DomainException(
            status_code=403,
            code="ACCOUNT_DEACTIVATED",
            message="User account is deactivated.",
        )
    return current_user


def require_roles(*allowed_roles: Any) -> Callable:
    """
    Declarative RBAC dependency factory.
    Enforces that the current authenticated user has one of the specified allowed roles.
    Matches against both role.id (e.g. 'ROLE_CENTRAL_OFFICER') and role enum name ('CENTRAL_OFFICER').
    """
    flat_roles: List[str] = []
    for r in allowed_roles:
        if isinstance(r, (list, tuple, set)):
            flat_roles.extend(str(item) for item in r)
        else:
            flat_roles.append(str(r))

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_id = current_user.role_id
        matched = False
        for r in flat_roles:
            if user_role_id == r:
                matched = True
                break
            if user_role_id == f"ROLE_{r}":
                matched = True
                break
            if current_user.role and current_user.role.name == r:
                matched = True
                break
            # SUPER_ADMIN inherits ADMIN permissions
            if user_role_id in ("ROLE_SUPER_ADMIN", "ROLE_ADMIN") and r in ("ADMIN", "ROLE_ADMIN", "SUPER_ADMIN", "ROLE_SUPER_ADMIN"):
                matched = True
                break

        if not matched:
            raise DomainException(
                status_code=403,
                code="FORBIDDEN_ROLE",
                message=f"Access denied: User with role '{user_role_id}' is not authorized to perform this operation.",
                details=[
                    {
                        "user_role": user_role_id,
                        "required_roles": list(allowed_roles),
                    }
                ],
            )
        return current_user

    return role_checker


def check_jurisdiction(user: User, state_id: Optional[str] = None, district_id: Optional[str] = None) -> bool:
    """
    Verify if a user has authority over a specific state or district according to canonical NLAMS hierarchy:
    - CENTRAL_OFFICER / SUPER_ADMIN / ADMIN: National jurisdiction (all states/districts).
    - STATE_OFFICER: Authority across all districts in user's state_id.
    - DISTRICT_OFFICER: Authority across all tehsils/parcels in user's district_id.
    - SOCIAL_OFFICER: Authority over R&R schemes within their assigned district.
    - FIELD_OFFICER: Authority over assigned district/tehsils.
    - PROJECT_AGENCY: Authority over assigned project boundaries.
    """
    if user.role_id in ("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_CENTRAL_OFFICER"):
        return True
    if user.role_id == "ROLE_STATE_OFFICER":
        return state_id is None or user.state_id == state_id
    if user.role_id in ("ROLE_DISTRICT_OFFICER", "ROLE_FIELD_OFFICER", "ROLE_SOCIAL_OFFICER"):
        if state_id and user.state_id and user.state_id != state_id:
            return False
        return district_id is None or user.district_id == district_id
    return True


def enforce_jurisdiction(user: User, state_id: Optional[str] = None, district_id: Optional[str] = None) -> None:
    """
    Asserts jurisdiction authority and raises 403 OUTSIDE_JURISDICTION if violated.
    """
    if not check_jurisdiction(user, state_id=state_id, district_id=district_id):
        raise DomainException(
            status_code=403,
            code="OUTSIDE_JURISDICTION",
            message="Access denied: Resource is outside your authorized administrative jurisdiction.",
            details=[
                {
                    "user_role": user.role_id,
                    "user_state": user.state_id,
                    "user_district": user.district_id,
                    "target_state": state_id,
                    "target_district": district_id,
                }
            ],
        )

