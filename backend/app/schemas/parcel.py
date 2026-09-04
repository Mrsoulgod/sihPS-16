import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class LandownerSummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    relative_name: Optional[str] = None
    social_category: str
    is_kyc_verified: bool
    masked_aadhaar: str
    masked_bank_account: str
    bank_name: str
    ownership_share_percent: float
    extent_area_acres: float
    is_primary_contact: bool


class FieldVerificationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    verification_date: date
    verified_by_name: str
    verified_by_role: str
    ground_survey_notes: Optional[str] = None
    trees_count: int
    structures_count: int
    wells_count: int
    verification_status: str


class ParcelListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    project_code: str
    project_title: str
    village_id: str
    village_name: str
    district_name: str
    state_name: str
    khasra_number: str
    khata_number: str
    total_area_acres: float
    acquired_area_acres: float
    land_type: str
    acquisition_status: str
    verification_status: str
    is_disputed: bool
    owner_count: int
    primary_owner_name: Optional[str] = None
    possession_status: str
    centroid: List[float]


class ParcelDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    project_code: str
    project_title: str
    sponsoring_ministry: str
    implementing_agency: str
    village_id: str
    village_name: str
    tehsil_name: str
    district_name: str
    state_name: str
    khasra_number: str
    khata_number: str
    total_area_acres: float
    acquired_area_acres: float
    land_type: str
    circle_rate_per_sqm: float
    market_multiplier: float
    acquisition_status: str
    verification_status: str
    current_workflow_stage: str
    is_disputed: bool
    centroid_latitude: float
    centroid_longitude: float
    geojson_polygon: Any
    owners: List[LandownerSummaryItem]
    field_verifications: List[FieldVerificationItem]
    recent_activity: List[Dict[str, Any]]
    can_verify: bool = False


class FieldVerificationCreateRequest(BaseModel):
    ground_survey_notes: Optional[str] = None
    trees_count: int = 0
    structures_count: int = 0
    wells_count: int = 0
    verification_status: str = "VERIFIED"  # VERIFIED, DISPUTED, REQUIRES_REINVESTIGATION


class ParcelListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[ParcelListItem]
    total_records: int
    page: int
    page_size: int
    total_pages: int
