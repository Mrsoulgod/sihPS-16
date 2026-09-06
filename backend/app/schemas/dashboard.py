import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class DashboardKpiSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    # 11 Canonical National Command KPIs
    total_projects: int
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    total_land_pending_acres: float = 0.0
    compensation_assessed_cr: float
    compensation_awarded_cr: float = 0.0
    compensation_disbursed_cr: float
    total_possession_acres: float
    affected_families: int
    projects_at_risk: int = 0
    overdue_tasks: int = 0

    # Supporting / legacy metric fields
    overall_acquisition_percent: float = 0.0
    overall_disbursement_percent: float = 0.0
    possession_progress_percent: float = 0.0
    displaced_families: int = 0
    total_paf_count: int = 0
    total_pdf_count: int = 0
    avg_randr_completion_percent: float = 0.0
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
    compensation_assessed_cr: float = 0.0
    compensation_awarded_cr: float = 0.0
    compensation_disbursed_cr: float
    disbursement_percent: float = 0.0
    possession_percent: float = 0.0
    randr_completion_percent: float
    delayed_tasks_count: int = 0
    risk_level: str = "LOW"  # CRITICAL, HIGH, MODERATE, LOW
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
    main_bottleneck: Optional[str] = None
    pending_action: Optional[str] = None


class CriticalProjectItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    current_stage: str
    progress_percent: float
    risk_level: str  # CRITICAL, HIGH, MODERATE, LOW
    risk_score: int
    main_bottleneck: str
    pending_action: str
    financial_exposure_cr: float = 0.0
    pending_land_acres: float = 0.0
    target_sla_days: int = 0


class NationalFunnelStageItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stage_order: int
    stage_id: str
    stage_name: str
    description: str
    project_count: int
    land_acres: float = 0.0
    amount_cr: float = 0.0
    is_bottleneck: bool = False
    bottleneck_reason: Optional[str] = None
    status: str = "ON_TRACK"  # ON_TRACK, AT_RISK, DELAYED, COMPLETED


class CentralAttentionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    issue_id: str
    priority: str  # CRITICAL, HIGH, MODERATE
    issue_type: str  # STATE_ESCALATION, WORKFLOW_DELAY, COMPENSATION_BACKLOG, POSSESSION_DELAY, RANDR_DELAY, OBJECTION_SLA_BREACH
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    project_title: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    reason: str
    current_authority: str
    age_days: int
    status: str = "OPEN"


class NationalRiskSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    critical_count: int = 0
    high_count: int = 0
    moderate_count: int = 0
    low_count: int = 0
    highest_risk_states: List[Dict[str, Any]] = []
    highest_risk_districts: List[Dict[str, Any]] = []
    major_risk_factors: List[Dict[str, Any]] = []


class NationalTrendsSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    acquisition_progression: List[Dict[str, Any]] = []
    disbursement_progression: List[Dict[str, Any]] = []
    possession_progression: List[Dict[str, Any]] = []
    randr_progression: List[Dict[str, Any]] = []
    stage_distribution: List[Dict[str, Any]] = []


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

    # National Command extensions for Central Officer
    funnel: Optional[List[NationalFunnelStageItem]] = None
    critical_projects: Optional[List[CriticalProjectItem]] = None
    central_attention: Optional[List[CentralAttentionItem]] = None
    risk_summary: Optional[NationalRiskSummary] = None
    trends: Optional[NationalTrendsSummary] = None
