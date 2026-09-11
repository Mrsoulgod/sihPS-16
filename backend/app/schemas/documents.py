import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class DocumentVersionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version: int
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    uploaded_by_user_id: uuid.UUID
    uploaded_by_name: Optional[str] = None
    uploaded_by_role: Optional[str] = None
    version_notes: Optional[str] = None
    verification_status: str
    created_at: datetime
    is_current_version: bool


class DocumentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: Optional[str] = None
    entity_type: str
    entity_id: uuid.UUID
    document_type: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    uploaded_by_user_id: uuid.UUID
    uploaded_by_name: Optional[str] = None
    verification_status: str
    version: int
    version_notes: Optional[str] = None
    is_current_version: bool
    created_at: datetime
    updated_at: datetime
    version_count: int = 1


class DocumentDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    document: DocumentItem
    version_history: List[DocumentVersionItem]
    hash_verified: bool
    tamper_proof_status: str


class DocumentUploadVersionRequest(BaseModel):
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    version_notes: str = Field(..., description="Reason / statutory basis for new version upload")


class DocumentCreateRequest(BaseModel):
    title: Optional[str] = None
    entity_type: str = "PROJECT"  # PROJECT, PARCEL, AWARD, POSSESSION, RANDR
    entity_id: uuid.UUID
    document_type: str  # DPR, PROJECT_PROPOSAL, ALIGNMENT_KML, LAND_REQUIREMENT_STATEMENT, TECHNICAL_REPORT, ADMINISTRATIVE_APPROVAL, SUPPORTING_DOC
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    version_notes: Optional[str] = "Initial statutory submission"


class DocumentHashVerificationResponse(BaseModel):
    document_id: uuid.UUID
    file_name: str
    version: int
    stored_sha256_hash: str
    computed_sha256_hash: str
    is_valid: bool
    verification_timestamp: str
    status_message: str
