import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class FieldAssignedParcelItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    parcel_id: uuid.UUID
    khasra_number: str
    project_id: Optional[uuid.UUID] = None
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
    task_id: Optional[uuid.UUID] = None
    task_status: Optional[str] = "ASSIGNED"
    due_date: Optional[str] = None
    assigned_at: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class FieldTaskItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    task_type: str
    title: str
    description: Optional[str] = None
    status: str  # ASSIGNED, IN_PROGRESS, SUBMITTED, REWORK_REQUIRED, COMPLETED, OVERDUE
    priority: str  # NORMAL, HIGH, CRITICAL
    due_date: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    submitted_at: Optional[str] = None
    is_overdue: bool = False

    # Related Project info
    project_id: uuid.UUID
    project_code: str
    project_title: str

    # Related Parcel info
    parcel_id: Optional[uuid.UUID] = None
    khasra_number: Optional[str] = None
    village_name: Optional[str] = None
    tehsil_name: Optional[str] = None
    district_name: Optional[str] = None
    area_acres: Optional[float] = None
    land_type: Optional[str] = None
    owner_name: Optional[str] = None

    # Rework notes if returned from CALA
    rework_reason: Optional[str] = None
    rework_requested_by: Optional[str] = None
    rework_requested_at: Optional[str] = None

    # UI action routing
    action_url: Optional[str] = None
    can_start: bool = False
    can_verify: bool = False
    can_resubmit: bool = False


class FieldPhotoItem(BaseModel):
    id: Optional[uuid.UUID] = None
    category: str  # PARCEL, BOUNDARY, STRUCTURE, TREE, SITE_ADDITIONAL
    file_name: str
    file_path: str
    caption: Optional[str] = None
    mime_type: Optional[str] = "image/jpeg"
    uploaded_at: Optional[str] = None
    uploaded_by: Optional[str] = None


class FieldLocationData(BaseModel):
    latitude: float = Field(..., description="Device GPS Latitude")
    longitude: float = Field(..., description="Device GPS Longitude")
    accuracy_meters: Optional[float] = Field(None, description="GPS Accuracy in meters")
    captured_at: Optional[str] = None
    notes: Optional[str] = None


class FieldParcelCheckData(BaseModel):
    parcel_identifiable: bool = Field(True, description="Physical parcel identified on ground")
    boundary_identifiable: bool = Field(True, description="Physical boundaries identifiable")
    location_corresponds: bool = Field(True, description="Location corresponds with revenue map")
    site_accessible: bool = Field(True, description="Site is accessible for field inspection")


class FieldLandUseData(BaseModel):
    observed_land_use: str = Field("Agricultural", description="Field-observed land use")
    remarks: Optional[str] = None


class FieldStructuresData(BaseModel):
    has_structures: bool = Field(False, description="Whether standing structures are present")
    structure_type: Optional[str] = Field(None, description="House, Shop, Shed, Boundary Wall, Other")
    structure_count: int = Field(0, ge=0)
    structure_condition: Optional[str] = Field(None, description="Good, Average, Dilapidated")
    remarks: Optional[str] = None


class FieldTreesAssetsData(BaseModel):
    has_trees: bool = Field(False, description="Whether trees are present on parcel")
    trees_count: int = Field(0, ge=0)
    tree_category: Optional[str] = Field(None, description="Fruit-bearing, Timber, Mixed, Shrub")
    other_assets: Optional[str] = Field(None, description="Borewell, Well, Pump House, etc.")
    remarks: Optional[str] = None


class FieldVerificationRequest(BaseModel):
    """8-step comprehensive field verification request payload."""
    location: Optional[FieldLocationData] = None
    parcel_check: Optional[FieldParcelCheckData] = None
    land_use: Optional[FieldLandUseData] = None
    structures: Optional[FieldStructuresData] = None
    trees_assets: Optional[FieldTreesAssetsData] = None
    photos: Optional[List[FieldPhotoItem]] = Field(default_factory=list)
    field_remarks: str = Field(..., description="Field officer observation remarks")
    is_draft: bool = Field(False, description="Save draft observations (True) or submit final verification (False)")


class FieldVerificationDetail(BaseModel):
    task_id: uuid.UUID
    task_status: str
    parcel_id: uuid.UUID
    khasra_number: str
    khata_number: Optional[str] = None
    village_name: str
    tehsil_name: str
    district_name: str
    project_id: uuid.UUID
    project_code: str
    project_title: str
    official_area_acres: float
    official_land_type: str
    primary_owner_name: str
    centroid_lat: float
    centroid_lng: float
    geojson_polygon: Optional[Dict[str, Any]] = None

    # Step Data (if already drafted or submitted)
    location: Optional[FieldLocationData] = None
    parcel_check: Optional[FieldParcelCheckData] = None
    land_use: Optional[FieldLandUseData] = None
    structures: Optional[FieldStructuresData] = None
    trees_assets: Optional[FieldTreesAssetsData] = None
    photos: List[FieldPhotoItem] = Field(default_factory=list)
    field_remarks: Optional[str] = None

    # Rework context
    rework_reason: Optional[str] = None
    rework_requested_by: Optional[str] = None
    rework_requested_at: Optional[str] = None

    # Submission metadata
    is_draft: bool = True
    verified_by_name: Optional[str] = None
    submitted_at: Optional[str] = None
    started_at: Optional[str] = None


class FieldDashboardSummary(BaseModel):
    assigned_today_count: int
    pending_count: int
    in_progress_count: int
    submitted_count: int
    overdue_count: int
    rework_count: int
    total_assigned_parcels: int

    priority_tasks: List[FieldTaskItem] = Field(default_factory=list)
    urgent_tasks: List[FieldTaskItem] = Field(default_factory=list)
    rework_tasks: List[FieldTaskItem] = Field(default_factory=list)
    recent_submissions: List[FieldTaskItem] = Field(default_factory=list)
    assigned_parcels: List[FieldAssignedParcelItem] = Field(default_factory=list)
    notifications: List[Dict[str, Any]] = Field(default_factory=list)


# Backward compatibility schemas
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
