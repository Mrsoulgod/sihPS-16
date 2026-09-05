import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class DashboardKpiSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_projects: int
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    total_possession_acres: float
    overall_acquisition_percent: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    overall_disbursement_percent: float
    affected_families: int
    displaced_families: int
    total_paf_count: int
    total_pdf_count: int
    avg_randr_completion_percent: float
    eligible_families: int = 0
    families_assisted: int = 0
    families_completed: int = 0
    pending_rr_cases: int = 0


class RAndRProgressStage(BaseModel):
    stage: str
    count: int
    percentage: float


class RAndROverview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_affected_families: int
    eligible_families: int
    families_approved: int
    families_assisted: int
    families_completed: int
    pending_cases: int
    completion_percent: float
    progress_stages: List[RAndRProgressStage]


class AcquisitionOverview(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    land_proposed_acres: float
    land_acquired_acres: float
    land_remaining_acres: float
    acquisition_percent: float
    possession_acres: float
    possession_percent: float


class ProjectStatusCounts(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    on_track: int
    at_risk: int
    delayed: int
    completed: int
    total: int


class StateProgressItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    state_id: str
    state_name: str
    project_count: int
    land_proposed_acres: float
    land_acquired_acres: float
    acquisition_percent: float
    compensation_disbursed_cr: float
    randr_completion_percent: float
    performance_category: str  # STRONG, MODERATE, POOR


class AttentionProjectItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    current_stage: str
    acquisition_progress_percent: float
    status: str  # AT_RISK, DELAYED, ON_TRACK
    reason: str
    risk_score: int


class RecentActivityItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    entity_name: str
    entity_id: str
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime


class QuickActionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    description: str
    target_route: str
    badge: Optional[str] = None
    icon: str


class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scope_level: str  # NATIONAL, STATE, DISTRICT, AGENCY, FIELD
    jurisdiction_name: str
    kpis: DashboardKpiSummary
    acquisition_overview: AcquisitionOverview
    status_breakdown: ProjectStatusCounts
    state_progress: List[StateProgressItem]
    attention_projects: List[AttentionProjectItem]
    recent_activity: List[RecentActivityItem]
    quick_actions: List[QuickActionItem]
    randr_overview: Optional[RAndROverview] = None

