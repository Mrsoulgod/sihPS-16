import asyncio
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import DomainException
from app.core.security import verify_password, create_access_token
from app.core.permissions import get_current_user
from app.core.demo_users import get_permissions_for_role, get_canonical_demo_data, create_demo_user_model
from app.models.user import User
from app.models.role import Role
from app.models.audit import AuditLog
from app.schemas.auth import LoginRequest, TokenResponse, UserSummaryResponse, JurisdictionSummary

router = APIRouter()



def build_jurisdiction_summary(user: User) -> JurisdictionSummary:
    """Derives canonical jurisdiction hierarchy and scope display for the authenticated user."""
    role_id = user.role_id or ""
    state_id = user.state_id
    state_name = user.state.name if user.state else ("Rajasthan" if state_id == "IN-RJ" else None)
    district_id = user.district_id
    district_name = user.district.name if user.district else ("Jaipur" if district_id == "DST-JAI" else None)

    # Check demo metadata if available
    demo_data = get_canonical_demo_data(user.username) or {}

    if role_id in ("ROLE_CENTRAL_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"):
        level = "CENTRAL"
        scope_display = "All India (National Mandate)"
    elif role_id == "ROLE_STATE_OFFICER":
        level = "STATE"
        scope_display = f"{state_name or 'State'} (State Mandate)"
    elif role_id == "ROLE_DISTRICT_OFFICER":
        level = "DISTRICT"
        scope_display = f"{district_name or 'District'}, {state_name or ''}"
    elif role_id == "ROLE_PROJECT_AGENCY":
        level = "PROJECT"
        scope_display = demo_data.get("scope_display") or f"{user.organization} (Project Scope)"
    elif role_id == "ROLE_FIELD_OFFICER":
        level = "FIELD"
        scope_display = demo_data.get("scope_display") or f"Tehsil Field Unit, {district_name or ''}"
    elif role_id == "ROLE_SOCIAL_OFFICER":
        level = "SOCIAL"
        scope_display = demo_data.get("scope_display") or f"{district_name or 'District'} R&R Schemes"
    else:
        level = "OPERATIONAL"
        scope_display = user.organization or "Authorized Mandate"

    return JurisdictionSummary(
        level=level,
        state_id=state_id,
        state_name=state_name,
        district_id=district_id,
        district_name=district_name,
        tehsil_id=demo_data.get("tehsil_id"),
        project_id=demo_data.get("project_id"),
        scope_display=scope_display,
    )


def build_user_summary(user: User) -> UserSummaryResponse:
    """Helper to convert User model into rich UserSummaryResponse schema."""
    role_name = user.role.name if user.role else user.role_id
    state_name = user.state.name if user.state else ("Rajasthan" if user.state_id == "IN-RJ" else None)
    district_name = user.district.name if user.district else ("Jaipur" if user.district_id == "DST-JAI" else None)

    return UserSummaryResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        display_name=f"{user.full_name} ({user.designation})",
        designation=user.designation,
        organization=user.organization,
        role_id=user.role_id,
        role_name=role_name,
        state_id=user.state_id,
        state_name=state_name,
        district_id=user.district_id,
        district_name=district_name,
        jurisdiction=build_jurisdiction_summary(user),
        permissions=get_permissions_for_role(user.role_id),
        is_active=user.is_active,
        last_login_at=user.last_login_at,
    )


@router.post("/login")
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user by username or official email and password.
    Returns signed JWT access token and user metadata.
    """
    user = None
    try:
        stmt = (
            select(User)
            .options(
                selectinload(User.role),
                selectinload(User.state),
                selectinload(User.district),
            )
            .where(
                or_(
                    User.username == payload.username_or_email.strip(),
                    User.email == payload.username_or_email.strip().lower(),
                )
            )
        )
        result = await asyncio.wait_for(db.execute(stmt), timeout=2.0)
        user = result.scalar_one_or_none()
    except Exception:
        user = None

    if not user:
        demo_data = get_canonical_demo_data(payload.username_or_email)
        if demo_data:
            if payload.password not in ["Password@123", "DemoPass@123", settings.DEMO_USER_PASSWORD]:
                raise DomainException(
                    status_code=401,
                    code="INVALID_CREDENTIALS",
                    message="Invalid username/email or password.",
                )
            user = create_demo_user_model(demo_data)
        else:
            raise DomainException(
                status_code=401,
                code="INVALID_CREDENTIALS",
                message="Invalid username/email or password.",
            )
    else:
        if not verify_password(payload.password, user.hashed_password):
            # Also allow standard demo passwords for demo accounts
            demo_data = get_canonical_demo_data(payload.username_or_email)
            if not demo_data or payload.password not in ["Password@123", "DemoPass@123", settings.DEMO_USER_PASSWORD]:
                raise DomainException(
                    status_code=401,
                    code="INVALID_CREDENTIALS",
                    message="Invalid username/email or password.",
                )


    if not user.is_active:
        raise DomainException(
            status_code=403,
            code="ACCOUNT_DEACTIVATED",
            message="Account is deactivated. Please contact an administrator.",
        )

    # Attempt to update last login timestamp and audit log if DB is accessible
    try:
        user.last_login_at = datetime.now(timezone.utc)
        audit_entry = AuditLog(
            user_id=user.id,
            action="AUTH_LOGIN_SUCCESS",
            entity_name="User",
            entity_id=str(user.id),
            new_values={"role_id": user.role_id, "username": user.username},
        )
        db.add(audit_entry)
        await db.commit()
        await db.refresh(user)
    except Exception:
        pass

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={
            "role": user.role_id,
            "username": user.username,
            "email": user.email,
            "state_id": user.state_id,
            "district_id": user.district_id,
        },
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in_seconds": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": build_user_summary(user).model_dump(),
        },
        "message": f"Welcome, {user.full_name}. Login successful.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve authenticated user's profile, jurisdiction hierarchy, and active permissions.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": build_user_summary(current_user).model_dump(),
        "message": "User profile retrieved successfully.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-{uuid.uuid4().hex[:8]}",
        },
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Log out active user session and record audit event.
    """
    try:
        audit_entry = AuditLog(
            user_id=current_user.id,
            action="AUTH_LOGOUT",
            entity_name="User",
            entity_id=str(current_user.id),
        )
        db.add(audit_entry)
        await db.commit()
    except Exception:
        pass

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": None,
        "message": "User session closed successfully.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-{uuid.uuid4().hex[:8]}",
        },
    }

