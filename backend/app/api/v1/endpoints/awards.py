import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.schemas.award import (
    AwardCreate,
    AwardStatusUpdate,
    AwardSignRequest,
)
from app.services.award_service import AwardService

router = APIRouter()


@router.get("", response_model=dict, summary="List Section 23/30 Awards")
async def list_awards(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by acquisition project ID"),
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, UNDER_REVIEW, APPROVED, ISSUED, CHALLENGED, CLOSED)"),
    search: Optional[str] = Query(None, description="Search by award number or project title"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of declared and drafted Section 23/30 land acquisition awards."""
    res = await AwardService.list_awards(
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
        "message": "Awards retrieved successfully.",
    }


@router.get("/{award_id}", summary="Get 360° detail for an award")
async def get_award_detail(
    award_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve full 360° detail for an award including parcel allocations and Demo e-Sign / Approval Stamp."""
    detail = await AwardService.get_award_detail(
        db=db,
        award_id=award_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "Award details retrieved successfully.",
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a Section 23/30 Award")
async def create_award(
    payload: AwardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Declare a statutory Section 23/30 Land Acquisition Award for verified compensation assessments."""
    award = await AwardService.create_award(
        db=db,
        data=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": award.id,
            "award_number": award.award_number,
            "total_award_amount_inr": award.total_award_amount_inr,
            "total_parcels_count": award.total_parcels_count,
            "status": award.status,
            "approval_stamp": "Demo e-Sign / Approval Stamp (Simulation)",
        },
        "message": "Section 23/30 Award declared successfully.",
    }


@router.patch("/{award_id}/status", summary="Update award status")
async def update_award_status(
    award_id: uuid.UUID,
    payload: AwardStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Transition statutory award status."""
    award = await AwardService.update_award_status(
        db=db,
        award_id=award_id,
        status_update=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {"id": award.id, "status": award.status},
        "message": f"Award status updated to '{payload.status}'.",
    }


@router.post("/{award_id}/sign", summary="Apply Demo e-Sign / Approval Stamp to award")
async def sign_award(
    award_id: uuid.UUID,
    payload: AwardSignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Apply simulated Demo e-Sign / Approval Stamp to formally issue the award."""
    award = await AwardService.apply_demo_esign(
        db=db,
        award_id=award_id,
        current_user=current_user,
        remarks=payload.remarks,
    )
    return {
        "success": True,
        "data": {
            "id": award.id,
            "digital_sign_hash": award.digital_sign_hash,
            "status": award.status,
            "approval_stamp": "Demo e-Sign / Approval Stamp (Simulation)",
        },
        "message": "Demo e-Sign / Approval Stamp applied successfully.",
    }
