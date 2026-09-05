import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.schemas.randr import (
    RAndRSchemeCreate,
    RAndRSchemeStatusUpdate,
    RAndRAllotmentCreate,
)
from app.services.randr_service import RandRService

router = APIRouter()


@router.get("", response_model=dict, summary="List R&R schemes")
async def list_schemes(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project ID"),
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, APPROVED, ACTIVE, etc.)"),
    scheme_type: Optional[str] = Query(None, description="Filter by scheme type"),
    search: Optional[str] = Query(None, description="Search by title, reference, site, or project"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of R&R Schemes with jurisdiction scoping and family progress counts."""
    res = await RandRService.list_schemes(
        db=db,
        current_user=current_user,
        project_id=project_id,
        state_id=state_id,
        district_id=district_id,
        status_filter=status,
        scheme_type=scheme_type,
        search=search,
        page=page,
        page_size=page_size,
    )
    return {
        "success": True,
        "data": res["items"],
        "metadata": {"pagination": res["pagination"]},
        "message": "R&R schemes retrieved successfully.",
    }


@router.get("/{scheme_id}", summary="Get R&R scheme 360° detail")
async def get_scheme_detail(
    scheme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve comprehensive detail for an R&R scheme including progress KPIs, covered families, and allotments."""
    detail = await RandRService.get_scheme_detail(
        db=db,
        scheme_id=scheme_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "R&R scheme details retrieved successfully.",
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create R&R scheme")
async def create_scheme(
    payload: RAndRSchemeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value])),
):
    """Create a new Rehabilitation & Resettlement scheme under an acquisition project."""
    scheme = await RandRService.create_scheme(
        db=db,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "id": scheme.id,
            "scheme_reference": scheme.scheme_reference,
            "scheme_title": scheme.scheme_title,
            "status": scheme.status,
            "resettlement_site_name": scheme.resettlement_site_name,
        },
        "message": f"R&R Scheme '{scheme.scheme_title}' registered successfully.",
    }


@router.patch("/{scheme_id}/status", summary="Update R&R scheme status")
async def update_scheme_status(
    scheme_id: uuid.UUID,
    payload: RAndRSchemeStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.STATE_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Update R&R scheme lifecycle status."""
    scheme = await RandRService.update_scheme_status(
        db=db,
        scheme_id=scheme_id,
        payload=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {"id": scheme.id, "status": scheme.status},
        "message": f"R&R Scheme status updated to '{scheme.status}'.",
    }


@router.post("/{scheme_id}/allotments", status_code=status.HTTP_201_CREATED, summary="Record R&R allotment")
async def create_scheme_allotment(
    scheme_id: uuid.UUID,
    payload: RAndRAllotmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Record a new plot/grant allotment under this scheme."""
    payload.scheme_id = scheme_id
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
        "message": f"R&R allotment '{allotment.allotment_reference}' recorded successfully.",
    }
