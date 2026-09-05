import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.schemas.randr import (
    AffectedFamilyCreate,
    EligibilityAssessmentUpdate,
    RehabilitationStatusUpdate,
    RAndRAllotmentCreate,
)
from app.services.randr_service import RandRService

router = APIRouter()


@router.get("", response_model=dict, summary="List affected families")
async def list_affected_families(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project ID"),
    scheme_id: Optional[uuid.UUID] = Query(None, description="Filter by scheme ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    eligibility_status: Optional[str] = Query(None, description="Filter by eligibility status"),
    rehabilitation_status: Optional[str] = Query(None, description="Filter by rehabilitation status"),
    search: Optional[str] = Query(None, description="Search by head of family, reference, or village"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of Project Affected Families with masked PII and eligibility status."""
    res = await RandRService.list_affected_families(
        db=db,
        current_user=current_user,
        project_id=project_id,
        scheme_id=scheme_id,
        district_id=district_id,
        eligibility_status=eligibility_status,
        rehabilitation_status=rehabilitation_status,
        search=search,
        page=page,
        page_size=page_size,
    )
    return {
        "success": True,
        "data": res["items"],
        "metadata": {"pagination": res["pagination"]},
        "message": "Affected families retrieved successfully.",
    }


@router.get("/{family_id}", summary="Get affected family 360° detail")
async def get_affected_family_detail(
    family_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Retrieve comprehensive 360° detail for an affected family including complete acquisition trace:
    Family -> Project -> Land Parcel -> Ownership -> Compensation -> Award -> Disbursement -> Possession -> R&R Scheme.
    """
    detail = await RandRService.get_affected_family_detail(
        db=db,
        family_id=family_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "Affected family details retrieved successfully.",
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Enumerate affected family")
async def create_affected_family(
    payload: AffectedFamilyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Enumerate and register an affected family under an R&R scheme."""
    family = await RandRService.create_affected_family(
        db=db,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": family.id,
            "family_reference_id": family.family_reference_id,
            "head_of_family_name": family.head_of_family_name,
            "eligibility_status": family.eligibility_status,
        },
        "message": f"Affected family '{family.family_reference_id}' enumerated successfully.",
    }


@router.patch("/{family_id}/eligibility", summary="Update Configurable R&R Eligibility Assessment")
async def update_family_eligibility(
    family_id: uuid.UUID,
    payload: EligibilityAssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """
    Record or update the Configurable R&R Eligibility Assessment decision for an affected family.
    Generates immutable audit logs and triggers notifications for disputed or approved decisions.
    """
    family = await RandRService.update_eligibility(
        db=db,
        family_id=family_id,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": family.id,
            "family_reference_id": family.family_reference_id,
            "eligibility_status": family.eligibility_status,
            "eligibility_category": family.eligibility_category,
            "rehabilitation_status": family.rehabilitation_status,
        },
        "message": f"R&R eligibility updated to '{family.eligibility_status}'.",
    }


@router.patch("/{family_id}/status", summary="Update rehabilitation status")
async def update_rehabilitation_status(
    family_id: uuid.UUID,
    payload: RehabilitationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Update rehabilitation lifecycle status (e.g. SETTLED)."""
    family = await RandRService.update_rehabilitation_status(
        db=db,
        family_id=family_id,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {"id": family.id, "rehabilitation_status": family.rehabilitation_status},
        "message": f"Rehabilitation status updated to '{family.rehabilitation_status}'.",
    }


@router.post("/{family_id}/allotments", status_code=status.HTTP_201_CREATED, summary="Record allotment for family")
async def create_family_allotment(
    family_id: uuid.UUID,
    payload: RAndRAllotmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Record a new plot/grant allotment directly for an affected family."""
    payload.family_id = family_id
    allotment = await RandRService.create_allotment(
        db=db,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": allotment.id,
            "allotment_reference": allotment.allotment_reference,
            "allotment_type": allotment.allotment_type,
            "status": allotment.status,
        },
        "message": f"Allotment '{allotment.allotment_reference}' recorded successfully.",
    }
