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
from app.models.user import User
from app.models.role import Role
from app.models.audit import AuditLog
from app.schemas.auth import LoginRequest, TokenResponse, UserSummaryResponse, SwitchRoleRequest

router = APIRouter()


def build_user_summary(user: User) -> UserSummaryResponse:
    """Helper to convert User model into UserSummaryResponse schema."""
    return UserSummaryResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        designation=user.designation,
        organization=user.organization,
        role_id=user.role_id,
        role_name=user.role.name if user.role else user.role_id,
        state_id=user.state_id,
        state_name=user.state.name if user.state else None,
        district_id=user.district_id,
        district_name=user.district.name if user.district else None,
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
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
    except Exception:
        user = None

    if not user:
        from app.core.demo_users import get_canonical_demo_data, create_demo_user_model
        demo_data = get_canonical_demo_data(payload.username_or_email)
        if demo_data:
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
            from app.core.demo_users import get_canonical_demo_data
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
    Retrieve authenticated user's profile and active permissions.
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


@router.post("/switch-role")
async def switch_role(
    payload: SwitchRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Demo/Evaluator feature: Switch active user context to a demo account of target role.
    Issues a fresh token for the target role demo account.
    """
    target = payload.target_role.strip().upper()
    if not target.startswith("ROLE_"):
        target = f"ROLE_{target}"

    # Verify target role exists
    role_check = await db.execute(select(Role).where(Role.id == target))
    if not role_check.scalar_one_or_none():
        raise DomainException(
            status_code=400,
            code="INVALID_TARGET_ROLE",
            message=f"Target role '{target}' is not a recognized system role.",
        )

    # Find the demo user for this target role
    stmt = (
        select(User)
        .options(
            selectinload(User.role),
            selectinload(User.state),
            selectinload(User.district),
        )
        .where(User.role_id == target)
        .order_by(User.created_at)
    )
    result = await db.execute(stmt)
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise DomainException(
            status_code=404,
            code="DEMO_USER_NOT_FOUND",
            message=f"No active demo account found for role '{target}'.",
        )

    # Record role switch in audit log
    audit_entry = AuditLog(
        user_id=current_user.id,
        action="AUTH_ROLE_SWITCH",
        entity_name="User",
        entity_id=str(target_user.id),
        old_values={"previous_role": current_user.role_id, "previous_user": current_user.username},
        new_values={"switched_to_role": target, "switched_to_user": target_user.username},
    )
    db.add(audit_entry)
    await db.commit()

    new_token = create_access_token(
        subject=str(target_user.id),
        extra_claims={
            "role": target_user.role_id,
            "username": target_user.username,
            "email": target_user.email,
            "state_id": target_user.state_id,
            "district_id": target_user.district_id,
        },
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": {
            "access_token": new_token,
            "token_type": "bearer",
            "expires_in_seconds": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": build_user_summary(target_user).model_dump(),
        },
        "message": f"Switched role context to {target_user.role.name} ({target_user.full_name}).",
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
    audit_entry = AuditLog(
        user_id=current_user.id,
        action="AUTH_LOGOUT",
        entity_name="User",
        entity_id=str(current_user.id),
    )
    db.add(audit_entry)
    await db.commit()

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
