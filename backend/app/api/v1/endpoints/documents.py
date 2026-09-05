import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.documents import (
    DocumentItem,
    DocumentDetailResponse,
    DocumentUploadVersionRequest,
    DocumentHashVerificationResponse,
)
from app.services.document_service import DocumentService

router = APIRouter()


@router.get("", response_model=List[DocumentItem])
async def list_documents(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (PROJECT, PARCEL, AWARD)"),
    entity_id: Optional[uuid.UUID] = Query(None, description="Filter by entity UUID"),
    document_type: Optional[str] = Query(None, description="Filter by document type (SECTION_11_GAZETTE, AWARD_COPY, etc.)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all active current documents in the repository with version count.
    """
    return await DocumentService.list_documents(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
        document_type=document_type,
        current_user=current_user,
    )


@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document_detail(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get 360-degree document details with complete version history chain.
    """
    detail = await DocumentService.get_document_detail(db, document_id, current_user)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return detail


@router.post("/{document_id}/versions", response_model=DocumentDetailResponse)
async def upload_new_version(
    document_id: uuid.UUID,
    req: DocumentUploadVersionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a new version of an existing document, archiving previous version.
    """
    try:
        return await DocumentService.upload_new_version(db, document_id, req, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{document_id}/verify-hash", response_model=DocumentHashVerificationResponse)
async def verify_document_hash(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compute and verify real-time SHA-256 cryptographic hash against stored hash.
    """
    try:
        return await DocumentService.verify_document_hash(db, document_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
