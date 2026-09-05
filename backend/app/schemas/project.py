import uuid
from decimal import Decimal
from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    description: str
    sponsoring_ministry: str
    implementing_agency: str
    current_stage: str
    current_stage_name: str
    primary_district_name: Optional[str] = None
    state_name: Optional[str] = None
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    acquisition_progress_percent: float
    total_possession_acres: float
    estimated_budget_inr_cr: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    total_paf_count: int
    total_pdf_count: int
    randr_completion_percent: float
    risk_score: int
    parcels_count: int = 0


class ProjectDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    description: str
    sponsoring_ministry: str
    implementing_agency: str
    current_stage: str
    current_stage_name: str
    primary_district_id: Optional[str] = None
    primary_district_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    total_possession_acres: float
    acquisition_progress_percent: float
    possession_percent: float
    estimated_budget_inr_cr: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    total_paf_count: int
    total_pdf_count: int
    randr_completion_percent: float
    risk_score: int
    parcels_count: int
    verified_parcels_count: int = 0
    assessed_parcels_count: int = 0
    awards_count: int = 0
    disbursed_parcels_count: int = 0
    possession_parcels_count: int = 0
    parcels_pending_possession_count: int = 0
    total_awarded_cr: float = 0.0
    outstanding_compensation_cr: float = 0.0
    randr_schemes_count: int = 0
    eligible_families_count: int = 0
    assisted_families_count: int = 0
    pending_families_count: int = 0
    created_at: Optional[datetime] = None
    alignment_geojson: Optional[Any] = None

