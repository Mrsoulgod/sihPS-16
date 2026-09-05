import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.schemas.possession import (
    PossessionCreate,
    PossessionStatusUpdate,
)
from app.services.possession_service import PossessionService

router = APIRouter()


@router.get("", response_model=dict, summary="List Section 38 Possession records")
async def list_possessions(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by acquisition project ID"),
    status: Optional[str] = Query(None, description="Filter by status (PENDING, SCHEDULED, TAKEN, DISPUTED, CANCELLED)"),
    search: Optional[str] = Query(None, description="Search by reference, khasra, or project"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of Section 38 Possession Handover records with prerequisite checks."""
    res = await PossessionService.list_possessions(
        db=db,
        current_user=current_user,
        project_id=project_id,
        status=status,
        search=search,
        page=page,
        page_size=page_size,
    )
    return {
        "success": True,
        "data": res["items"],
        "metadata": {"pagination": res["pagination"]},
        "message": "Possession records retrieved successfully.",
    }


@router.get("/{possession_id}", summary="Get Section 38 Possession detail")
async def get_possession_detail(
    possession_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve 360° detail for a Section 38 Possession record including prerequisite compliance checks."""
    detail = await PossessionService.get_possession_detail(
        db=db,
        possession_id=possession_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "Possession details retrieved successfully.",
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Record Section 38 Handover or Section 40 Urgency")
async def record_possession(
    payload: PossessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value])),
):
    """
    Record Section 38 Land Handover.
    Section 40 Urgency Clause is supported only as an exceptional statutory pathway with documented justification.
    """
    possession = await PossessionService.create_possession(
        db=db,
        data=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": possession.id,
            "possession_reference": possession.possession_reference,
            "possession_type": possession.possession_type,
            "status": possession.status,
            "possession_date": possession.possession_date,
        },
        "message": f"Land possession successfully recorded under {possession.possession_type}.",
    }


@router.patch("/{possession_id}/status", summary="Update possession status")
async def update_possession_status(
    possession_id: uuid.UUID,
    payload: PossessionStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value])),
):
    """Update possession status (e.g. SCHEDULED -> TAKEN or DISPUTED)."""
    possession = await PossessionService.update_possession_status(
        db=db,
        possession_id=possession_id,
        update_data=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {"id": possession.id, "status": possession.status},
        "message": f"Possession status updated to '{payload.status}'.",
    }
