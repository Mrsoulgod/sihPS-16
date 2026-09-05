import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AwardParcelSummary(BaseModel):
    parcel_id: uuid.UUID
    khasra_number: str
    village_name: str
    acquired_area_sqm: Decimal
    compensation_assessment_id: uuid.UUID
    assessment_reference: Optional[str] = None
    assessed_amount_inr: Decimal
    owner_names: List[str] = []


class AwardCreate(BaseModel):
    project_id: uuid.UUID
    award_number: Optional[str] = None
    award_date: Optional[date] = None
    parcel_ids: List[uuid.UUID] = Field(..., min_length=1, description="Parcels with finalized compensation assessments to include in the award")
    remarks: Optional[str] = None


class AwardStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: UNDER_REVIEW, APPROVED, ISSUED, CHALLENGED, CLOSED")
    remarks: Optional[str] = None


class AwardSignRequest(BaseModel):
    """CALA Demo e-Sign / Approval Stamp request."""
    remarks: Optional[str] = "Demo statutory declaration and CALA approval applied."


class AwardListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    award_number: str
    project_id: uuid.UUID
    project_title: str
    project_code: str
    award_date: date
    total_parcels_count: int
    total_area_acres: Decimal
    total_award_amount_inr: Decimal
    cala_user_name: str
    status: str
    has_demo_esign: bool
    created_at: datetime


class AwardDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    award_number: str
    project_id: uuid.UUID
    project_title: str
    project_code: str
    district_name: str
    state_name: str
    award_date: date
    total_parcels_count: int
    total_area_acres: Decimal
    total_award_amount_inr: Decimal
    status: str
    cala_user_id: uuid.UUID
    cala_user_name: str
    cala_designation: Optional[str] = None
    digital_sign_hash: Optional[str] = None
    approval_stamp_label: str = "Demo e-Sign / Approval Stamp (Simulation)"
    approved_by_user_name: Optional[str] = None
    approval_date: Optional[datetime] = None
    remarks: Optional[str] = None
    parcels: List[AwardParcelSummary] = []
    total_disbursed_inr: Decimal = Decimal("0.0")
    remaining_inr: Decimal = Decimal("0.0")
    disbursement_percent: Decimal = Decimal("0.0")
    created_at: datetime
    updated_at: datetime
