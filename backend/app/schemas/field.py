import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class FieldAssignedParcelItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    parcel_id: uuid.UUID
    khasra_number: str
    project_code: str
    project_title: str
    village_name: str
    tehsil_name: str
    district_name: str
    area_acres: float
    land_type: str
    primary_owner_name: str
    verification_status: str
    dispute_status: str
    has_structures: bool = False
    has_trees: bool = False
    assigned_at: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class FieldChecklistSubmissionRequest(BaseModel):
    boundary_verified: bool = Field(..., description="Physical boundaries matched against Cadastral Map")
    occupancy_and_crop_surveyed: bool = Field(..., description="On-ground occupancy and crop status inspected")
    title_holder_kyc_verified: bool = Field(..., description="Owner identity / Aadhaar matched")
    non_land_assets_enumerated: bool = Field(..., description="Standing structures, borewells, trees enumerated")
    survey_remarks: str = Field(..., description="Ground inspection observations")
    gps_coordinates: Optional[str] = Field(None, description="Lat/Long captured during survey")
    trees_count: int = Field(0, ge=0)
    structure_details: Optional[str] = None
    is_draft: bool = Field(False, description="Save as draft or submit final verification to CALA")


class FieldVerificationSubmissionResponse(BaseModel):
    parcel_id: uuid.UUID
    khasra_number: str
    verification_status: str
    is_draft: bool
    submitted_at: str
    field_officer_name: str
    message: str
