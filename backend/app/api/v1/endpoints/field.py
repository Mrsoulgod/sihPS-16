import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.field import (
    FieldAssignedParcelItem,
    FieldChecklistSubmissionRequest,
    FieldVerificationSubmissionResponse,
)
from app.services.field_service import FieldService

router = APIRouter()


@router.get("/assigned-parcels", response_model=List[FieldAssignedParcelItem])
async def get_assigned_parcels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get mobile survey parcel queue assigned to the active Field Officer / Inspector.
    """
    return await FieldService.get_assigned_parcels(db, current_user)


@router.post("/parcels/{parcel_id}/verify", response_model=FieldVerificationSubmissionResponse)
async def submit_field_verification(
    parcel_id: uuid.UUID,
    req: FieldChecklistSubmissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit 4-point field checklist verification or save draft observations.
    """
    try:
        return await FieldService.submit_verification(db, parcel_id, req, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
