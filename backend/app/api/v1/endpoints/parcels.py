import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.parcel import (
    ParcelListResponse,
    ParcelDetailResponse,
    FieldVerificationItem,
    FieldVerificationCreateRequest,
)
from app.services.parcel_service import ParcelService

router = APIRouter()


@router.get("", response_model=ParcelListResponse)
async def list_parcels(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project ID"),
    village_id: Optional[str] = Query(None, description="Filter by village ID"),
    status: Optional[str] = Query(None, description="Filter by acquisition status"),
    is_disputed: Optional[bool] = Query(None, description="Filter disputed parcels"),
    search: Optional[str] = Query(None, description="Search Khasra or Khata number"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve cadastral land parcels with jurisdiction scoping and filters."""
    return await ParcelService.list_parcels(
        db=db,
        current_user=current_user,
        project_id=project_id,
        village_id=village_id,
        status_filter=status,
        is_disputed=is_disputed,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get("/{parcel_id}", response_model=ParcelDetailResponse)
async def get_parcel_detail(
    parcel_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve 360° detail for a cadastral parcel with masked landowner PII."""
    return await ParcelService.get_parcel_detail(
        db=db,
        parcel_id=parcel_id,
        current_user=current_user,
    )


@router.post("/{parcel_id}/verify", response_model=FieldVerificationItem)
async def record_field_verification(
    parcel_id: uuid.UUID,
    request: FieldVerificationCreateRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record ground survey field verification report and tree/structure asset counts."""
    return await ParcelService.record_field_verification(
        db=db,
        parcel_id=parcel_id,
        current_user=current_user,
        data=request,
    )
