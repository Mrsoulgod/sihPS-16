import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ComplianceCheckItem(BaseModel):
    check_name: str
    is_satisfied: bool
    status_label: str
    details: str


class PossessionCreate(BaseModel):
    project_id: uuid.UUID
    parcel_id: uuid.UUID
    award_id: Optional[uuid.UUID] = None
    possession_date: date
    possession_type: str = Field(default="SECTION_38_REGULAR", description="SECTION_38_REGULAR or SECTION_40_URGENCY_CLAUSE")
    is_encumbrance_free: bool = True
    urgency_justification: Optional[str] = Field(default=None, description="Mandatory if Section 40 urgency clause is invoked")
    remarks: Optional[str] = None


class PossessionStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: SCHEDULED, TAKEN, DISPUTED, CANCELLED")
    remarks: Optional[str] = None


class PossessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    possession_reference: str
    project_id: uuid.UUID
    project_title: str
    project_code: str
    parcel_id: uuid.UUID
    khasra_number: str
    village_name: str
    district_name: str
    possession_date: date
    possession_type: str
    status: str
    is_encumbrance_free: bool
    taken_by_officer_name: str
    handed_over_by_officer_name: str
    created_at: datetime


class PossessionDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    possession_reference: str
    status: str
    project_id: uuid.UUID
    project_title: str
    project_code: str
    district_name: str
    state_name: str
    parcel_id: uuid.UUID
    khasra_number: str
    khata_number: str
    village_name: str
    acquired_area_sqm: Decimal
    area_acres: Decimal
    land_type: str
    award_id: Optional[uuid.UUID] = None
    award_number: Optional[str] = None
    possession_date: date
    possession_type: str
    is_encumbrance_free: bool
    possession_certificate_doc_id: Optional[uuid.UUID] = None
    certificate_number: Optional[str] = None
    taken_by_agency_officer_id: uuid.UUID
    taken_by_officer_name: str
    taken_by_organization: Optional[str] = None
    handed_over_by_cala_id: uuid.UUID
    handed_over_by_officer_name: str
    handed_over_by_designation: Optional[str] = None
    remarks: Optional[str] = None
    prerequisite_checks: List[ComplianceCheckItem] = []
    created_at: datetime
    updated_at: datetime
