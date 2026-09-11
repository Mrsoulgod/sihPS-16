import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.field import FieldDashboardSummary
from app.schemas.randr_social import SocialDashboardSummary


class DashboardKpiSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    # 11 Canonical National / 12 State Control / 14 District Control KPIs
    total_projects: int
    districts_with_active_acquisition: int = 0
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

    # Phase 11D: District Statutory KPIs
    active_projects: int = 0
    parcels_pending_verification: int = 0
    objections_pending: int = 0
    compensation_pending_cr: float = 0.0
    compensation_pending_cases: int = 0
    awards_pending: int = 0
    disbursement_pending_cr: float = 0.0
    disbursement_pending_cases: int = 0
    possession_pending_acres: float = 0.0
    possession_pending_cases: int = 0
    high_risk_projects: int = 0
    high_critical_risk_projects: int = 0

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
    randr_pending_cases: int = 0


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


class DistrictPerformanceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    district_id: str
    district_name: str
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    project_count: int
    land_proposed_acres: float
    land_acquired_acres: float
    acquisition_percent: float
    compensation_assessed_cr: float
    compensation_awarded_cr: float = 0.0
    compensation_disbursed_cr: float
    disbursement_percent: float = 0.0
    possession_percent: float
    randr_completion_percent: float
    pending_tasks_count: int = 0
    overdue_tasks_count: int = 0
    risk_level: str = "LOW"  # CRITICAL, HIGH, MODERATE, LOW
    status: str = "ON_TRACK"  # ON_TRACK, AT_RISK, DELAYED


class DistrictEscalationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    escalation_id: str
    district_id: Optional[str] = None
    district_name: str
    project_title: str
    project_id: Optional[uuid.UUID] = None
    issue_type: str  # WORKFLOW_DELAY, LAND_VERIFICATION_DELAY, OBJECTION_PENDING, COMPENSATION_REVIEW_DELAY, AWARD_DELAY, PAYMENT_DISBURSEMENT_ISSUE, POSSESSION_ISSUE, RANDR_DELAY, HIGH_RISK
    priority: str  # CRITICAL, HIGH, MODERATE
    reason: str
    current_owner: str
    age_days: int
    status: str = "OPEN"


class StateAttentionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_id: str
    priority: str  # CRITICAL, HIGH, MODERATE
    category: str  # DISTRICT_SLA_BREACH, MULTIPLE_OVERDUE_TASKS, HIGH_RISK_DISTRICT, CRITICAL_PROJECT, COMPENSATION_BACKLOG, POSSESSION_BOTTLENECK, RANDR_BACKLOG, DISTRICT_ESCALATION
    district_name: Optional[str] = None
    project_title: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    description: str
    action_required: str
    sla_days_overdue: int = 0


class StateCompensationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_assessed_cr: float
    awards_issued_count: int
    total_awarded_cr: float
    total_disbursed_cr: float
    pending_disbursement_cr: float
    projects_with_financial_backlog: int
    district_disbursements: List[Dict[str, Any]] = []


class StatePossessionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    land_requiring_possession_acres: float
    possession_completed_acres: float
    possession_pending_acres: float
    possession_progress_percent: float
    projects_with_possession_delays: int
    district_possessions: List[Dict[str, Any]] = []


class StateRAndRSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    affected_families: int
    eligible_families: int
    plot_allotments: int
    schemes_count: int
    completed_cases: int
    pending_cases: int
    district_randr: List[Dict[str, Any]] = []


# ============================================================================
# Phase 11D: District Acquisition Control Center Schemas
# ============================================================================

class DistrictActionItem(BaseModel):
    """An operational action / task assigned to the District / CALA Officer."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_name: str
    project_id: uuid.UUID
    project_title: str
    project_code: str
    stage: str
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    created_at: datetime
    due_date: Optional[datetime] = None
    sla_status: str  # OVERDUE, DUE_SOON, NORMAL
    sla_days_remaining: int = 0
    status: str  # PENDING, IN_PROGRESS, REWORK_REQUIRED
    target_route: str
    action_type: str  # PROPOSAL_SCRUTINY, FIELD_VERIFICATION, OBJECTION_HEARING, COMPENSATION_APPROVAL, AWARD_SIGNING, POSSESSION_HANDOVER, RANDR_REVIEW
    assigned_role: str = "ROLE_DISTRICT_OFFICER"
    tehsil_name: Optional[str] = None
    description: Optional[str] = None


class DistrictProjectSummaryItem(BaseModel):
    """Operational project summary within the authenticated district."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    implementing_agency: str
    tehsil_name: Optional[str] = None
    current_stage: str
    progress_percent: float
    land_proposed_acres: float
    land_acquired_acres: float
    land_pending_acres: float = 0.0
    compensation_status: str  # PENDING, ASSESSED, AWARDED, DISBURSED
    possession_status: str  # NOT_STARTED, IN_PROGRESS, READY, COMPLETED, BLOCKED
    randr_status: str  # NOT_APPLICABLE, SURVEY_DONE, ALLOTMENT_IN_PROGRESS, SETTLED
    risk_level: str  # CRITICAL, HIGH, MODERATE, LOW
    risk_score: int
    pending_action: str
    status: str  # ON_TRACK, AT_RISK, DELAYED, COMPLETED


class DistrictFieldVerificationSummary(BaseModel):
    """Field ground-truthing and boundary survey supervision."""
    model_config = ConfigDict(from_attributes=True)

    assigned_count: int = 0
    in_progress_count: int = 0
    submitted_count: int = 0
    approved_count: int = 0
    rework_count: int = 0
    overdue_count: int = 0
    total_parcels_count: int = 0
    items: List[Dict[str, Any]] = []


class DistrictObjectionsSummary(BaseModel):
    """Section 15 statutory objections, hearing schedules, and judicial decisions."""
    model_config = ConfigDict(from_attributes=True)

    total_count: int = 0
    pending_hearing_count: int = 0
    hearings_completed_count: int = 0
    speaking_orders_issued: int = 0
    disposed_count: int = 0
    items: List[Dict[str, Any]] = []


class DistrictCompensationSummary(BaseModel):
    """District compensation assessment, valuation approval, and escrow monitoring."""
    model_config = ConfigDict(from_attributes=True)

    pending_assessment_count: int = 0
    assessments_pending_review_cr: float = 0.0
    assessments_approved_cr: float = 0.0
    awards_pending_count: int = 0
    awards_issued_cr: float = 0.0
    disbursement_pending_cr: float = 0.0
    disbursement_completed_cr: float = 0.0
    items: List[Dict[str, Any]] = []


class DistrictAwardsSummary(BaseModel):
    """Section 23/30 statutory awards issued by Competent Authority CALA."""
    model_config = ConfigDict(from_attributes=True)

    total_count: int = 0
    total_awards_count: int = 0
    pending_approval_count: int = 0
    published_count: int = 0
    total_awarded_cr: float = 0.0
    items: List[Dict[str, Any]] = []


class DistrictDisbursementSummary(BaseModel):
    """PFMS Direct Benefit Transfer payment status for affected landholders."""
    model_config = ConfigDict(from_attributes=True)

    total_disbursed_cr: float = 0.0
    pending_disbursed_cr: float = 0.0
    pending_payment_count: int = 0
    pfms_success_count: int = 0
    pfms_failed_count: int = 0
    revalidation_queue_count: int = 0
    items: List[Dict[str, Any]] = []


class DistrictPossessionSummary(BaseModel):
    """Section 38 encumbrance-free physical handover management."""
    model_config = ConfigDict(from_attributes=True)

    ready_for_possession_acres: float = 0.0
    possession_scheduled_acres: float = 0.0
    possession_completed_acres: float = 0.0
    possession_blocked_acres: float = 0.0
    possession_progress_percent: float = 0.0
    pending_parcels_count: int = 0
    items: List[Dict[str, Any]] = []


class DistrictRAndRSummary(BaseModel):
    """Second Schedule rehabilitation and resettlement welfare coordination."""
    model_config = ConfigDict(from_attributes=True)

    total_pafs: int = 0
    eligible_pafs: int = 0
    allotments_issued: int = 0
    rehabilitation_completed: int = 0
    pending_cases: int = 0
    resettlement_colonies_count: int = 0
    items: List[Dict[str, Any]] = []


class DistrictEscalationToStateItem(BaseModel):
    """Escalation submitted by District Officer to State Supervisory Authority."""
    model_config = ConfigDict(from_attributes=True)

    escalation_id: str
    project_id: uuid.UUID
    project_title: str
    stage: str
    issue_type: str  # FOREST_NOC_DELAY, PFMS_GATEWAY_MISMATCH, SECTION_15_HIGH_VOLUME, LAW_AND_ORDER, MUNICIPAL_UTILITY_CLEARANCE
    priority: str  # CRITICAL, HIGH, MEDIUM
    reason: str
    remarks: str
    current_owner: str
    created_at: datetime
    escalated_to: str = "State Revenue Officer / Principal Secretary"
    status: str = "PENDING_STATE_REVIEW"  # PENDING_STATE_REVIEW, STATE_DIRECTIVE_ISSUED, RESOLVED


# ============================================================================
# Phase 11E: Project Agency Control Center Schemas
# ============================================================================

class AgencyActionItem(BaseModel):
    """An operational action / task assigned to or initiated by the Project Agency."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_type: str  # SUBMISSION, REWORK, DOCUMENT, CLARIFICATION, SURVEY, POSSESSION, OTHER
    category: str   # PENDING_SUBMISSION, REWORK_REQUEST, DOCUMENT_REQUEST, CLARIFICATION_REQUIRED, SURVEY_REQUEST, OTHER
    title: str
    description: Optional[str] = None
    project_id: uuid.UUID
    project_code: str
    project_title: str
    priority: str = "HIGH"  # CRITICAL, HIGH, NORMAL, LOW
    status: str = "PENDING"  # PENDING, IN_PROGRESS, COMPLETED, REWORK_REQUIRED
    due_date: Optional[datetime] = None
    sla_status: str = "NORMAL"  # OVERDUE, DUE_SOON, NORMAL
    target_route: str
    created_at: datetime
    requested_by: Optional[str] = None
    required_correction: Optional[str] = None


class AgencyProjectItem(BaseModel):
    """Project record scoped to the authenticated agency."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    current_stage: str
    current_stage_name: str
    status: str  # DRAFT, SUBMITTED, UNDER_SCRUTINY, REWORK_REQUESTED, APPROVED, ACQUISITION_IN_PROGRESS, COMPLETED
    land_proposed_acres: float
    land_acquired_acres: float
    land_pending_acres: float
    acquisition_percent: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    possession_acres: float
    possession_percent: float
    randr_completion_percent: float
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_score: int
    pending_action: Optional[str] = None


class AgencyProjectsSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_projects: int = 0
    draft_count: int = 0
    submitted_count: int = 0
    under_scrutiny_count: int = 0
    approved_count: int = 0
    in_progress_count: int = 0
    completed_count: int = 0
    items: List[AgencyProjectItem] = []


class AgencyLandSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    land_proposed_acres: float = 0.0
    land_identified_acres: float = 0.0
    land_verified_acres: float = 0.0
    land_acquired_acres: float = 0.0
    land_pending_acres: float = 0.0
    acquisition_percent: float = 0.0
    parcels_proposed_count: int = 0
    parcels_verified_count: int = 0
    parcels_acquired_count: int = 0


class AgencyCompensationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assessed_cr: float = 0.0
    awarded_cr: float = 0.0
    disbursed_cr: float = 0.0
    pending_cr: float = 0.0
    disbursement_percent: float = 0.0


class AgencyPossessionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ready_acres: float = 0.0
    pending_acres: float = 0.0
    completed_acres: float = 0.0
    possession_percent: float = 0.0
    blockers_count: int = 0
    action_required_count: int = 0
    items: List[Dict[str, Any]] = []


class AgencyRAndRSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    affected_families: int = 0
    eligible_families: int = 0
    plot_allotments: int = 0
    completed_cases: int = 0
    pending_cases: int = 0
    completion_percent: float = 0.0


class AgencyRiskSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    risk_level: str = "LOW"
    risk_score: int = 0
    major_bottlenecks: List[str] = []
    delayed_stages: List[str] = []
    at_risk_projects_count: int = 0


class AgencyControlSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    actions: List[AgencyActionItem] = []
    projects_summary: AgencyProjectsSummary
    land_acquisition: AgencyLandSummary
    compensation: AgencyCompensationSummary
    possession: AgencyPossessionSummary
    randr: AgencyRAndRSummary
    risk: AgencyRiskSummary


class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scope_level: str  # NATIONAL, STATE, DISTRICT, AGENCY, FIELD
    jurisdiction_name: str
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
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

    # State Acquisition Control extensions for State Officer (Phase 11C)
    district_performance: Optional[List[DistrictPerformanceItem]] = None
    district_escalations: Optional[List[DistrictEscalationItem]] = None
    state_attention: Optional[List[StateAttentionItem]] = None
    state_compensation: Optional[StateCompensationSummary] = None
    state_possession: Optional[StatePossessionSummary] = None
    state_randr: Optional[StateRAndRSummary] = None

    # District Acquisition Control extensions for District / CALA Officer (Phase 11D)
    my_tasks: Optional[List[DistrictActionItem]] = None
    district_my_tasks: Optional[List[DistrictActionItem]] = None
    projects: Optional[List[DistrictProjectSummaryItem]] = None
    district_projects: Optional[List[DistrictProjectSummaryItem]] = None
    field_verification: Optional[DistrictFieldVerificationSummary] = None
    district_field_verification: Optional[DistrictFieldVerificationSummary] = None
    objections: Optional[DistrictObjectionsSummary] = None
    district_objections: Optional[DistrictObjectionsSummary] = None
    compensation: Optional[DistrictCompensationSummary] = None
    district_compensation: Optional[DistrictCompensationSummary] = None
    awards: Optional[DistrictAwardsSummary] = None
    district_awards: Optional[DistrictAwardsSummary] = None
    disbursement: Optional[DistrictDisbursementSummary] = None
    district_disbursement: Optional[DistrictDisbursementSummary] = None
    possession: Optional[DistrictPossessionSummary] = None
    district_possession: Optional[DistrictPossessionSummary] = None
    randr: Optional[DistrictRAndRSummary] = None
    district_randr: Optional[DistrictRAndRSummary] = None
    escalations: Optional[List[DistrictEscalationToStateItem]] = None
    district_escalations_to_state: Optional[List[DistrictEscalationToStateItem]] = None

    # Project Agency Control extensions (Phase 11E)
    agency_control: Optional[AgencyControlSummary] = None
    agency_actions: Optional[List[AgencyActionItem]] = None
    agency_projects: Optional[AgencyProjectsSummary] = None
    agency_land: Optional[AgencyLandSummary] = None
    agency_compensation: Optional[AgencyCompensationSummary] = None
    agency_possession: Optional[AgencyPossessionSummary] = None
    agency_randr: Optional[AgencyRAndRSummary] = None
    agency_risk: Optional[AgencyRiskSummary] = None

    # Field Officer extensions (Phase 11F)
    field_work: Optional[FieldDashboardSummary] = None

    # Social / R&R Officer extensions (Phase 11G)
    randr_case_management: Optional[SocialDashboardSummary] = None

