export interface DashboardKpiSummary {
  // 11 National / 12 State Control KPIs
  total_projects: number;
  districts_with_active_acquisition?: number;
  total_land_proposed_acres: number;
  total_land_acquired_acres: number;
  total_land_pending_acres?: number;
  compensation_assessed_cr: number;
  compensation_awarded_cr?: number;
  compensation_disbursed_cr: number;
  total_possession_acres: number;
  affected_families: number;
  projects_at_risk?: number;
  overdue_tasks?: number;

  // Auxiliary / legacy fields
  overall_acquisition_percent?: number;
  overall_disbursement_percent?: number;
  possession_progress_percent?: number;
  displaced_families?: number;
  total_paf_count?: number;
  total_pdf_count?: number;
  avg_randr_completion_percent?: number;
  eligible_families?: number;
  families_assisted?: number;
  families_completed?: number;
  pending_rr_cases?: number;

  // Phase 11D District Officer 14 Statutory KPIs
  parcels_pending_verification?: number;
  objections_pending?: number;
  compensation_pending_cases?: number;
  awards_pending?: number;
  disbursement_pending_cases?: number;
  possession_pending_cases?: number;
  randr_pending_cases?: number;
  high_critical_risk_projects?: number;
}

export interface AcquisitionOverview {
  land_proposed_acres: number;
  land_acquired_acres: number;
  land_remaining_acres: number;
  acquisition_percent: number;
  possession_acres: number;
  possession_percent: number;
}

export interface ProjectStatusCounts {
  on_track: number;
  at_risk: number;
  delayed: number;
  completed: number;
  total: number;
}

export interface StateProgressItem {
  state_id: string;
  state_name: string;
  project_count: number;
  land_proposed_acres: number;
  land_acquired_acres: number;
  acquisition_percent: number;
  compensation_assessed_cr?: number;
  compensation_awarded_cr?: number;
  compensation_disbursed_cr: number;
  disbursement_percent?: number;
  possession_percent?: number;
  randr_completion_percent: number;
  delayed_tasks_count?: number;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  performance_category: 'STRONG' | 'MODERATE' | 'POOR';
}

export interface AttentionProjectItem {
  id: string;
  project_code: string;
  title: string;
  state_name?: string;
  district_name?: string;
  current_stage: string;
  acquisition_progress_percent: number;
  status: 'AT_RISK' | 'DELAYED' | 'ON_TRACK' | 'COMPLETED';
  reason: string;
  risk_score: number;
  main_bottleneck?: string;
  pending_action?: string;
}

export interface CriticalProjectItem {
  id: string;
  project_code: string;
  title: string;
  state_id?: string;
  state_name?: string;
  district_id?: string;
  district_name?: string;
  current_stage: string;
  progress_percent: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  risk_score: number;
  main_bottleneck: string;
  pending_action: string;
  financial_exposure_cr?: number;
  pending_land_acres?: number;
  target_sla_days?: number;
}

export interface NationalFunnelStageItem {
  stage_order: number;
  stage_id: string;
  stage_name: string;
  description: string;
  project_count: number;
  land_acres: number;
  amount_cr: number;
  is_bottleneck: boolean;
  bottleneck_reason?: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CentralAttentionItem {
  issue_id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  issue_type: string;
  state_name?: string;
  district_name?: string;
  project_title?: string;
  project_id?: string;
  reason: string;
  current_authority: string;
  age_days: number;
  status: string;
}

export interface NationalRiskSummary {
  critical_count: number;
  high_count: number;
  moderate_count: number;
  low_count: number;
  highest_risk_states: Array<{
    state_id: string;
    state_name: string;
    risk_level: string;
    delayed_tasks: number;
  }>;
  highest_risk_districts: Array<{
    district_name: string;
    state_name: string;
    risk_score: number;
    key_issue: string;
  }>;
  major_risk_factors: Array<{
    factor: string;
    weight: string;
    impact: string;
    affected_projects: number;
  }>;
}

export interface NationalTrendsSummary {
  acquisition_progression: Array<{
    month: string;
    proposed: number;
    acquired: number;
    possession: number;
  }>;
  disbursement_progression: Array<{
    month: string;
    assessed: number;
    awarded: number;
    disbursed: number;
  }>;
  possession_progression: Array<{
    month: string;
    target_acres: number;
    handed_over: number;
  }>;
  randr_progression: Array<{
    month: string;
    eligible: number;
    settled: number;
  }>;
  stage_distribution: Array<{
    stage: string;
    projects: number;
  }>;
}

export interface RecentActivityItem {
  id: number;
  action: string;
  entity_name: string;
  entity_id: string;
  actor_name?: string;
  actor_role?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  target_route: string;
  badge?: string;
  icon: string;
}

export interface RAndRProgressStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface RAndROverview {
  total_affected_families: number;
  eligible_families: number;
  families_approved: number;
  families_assisted: number;
  families_completed: number;
  pending_cases: number;
  completion_percent: number;
  progress_stages: RAndRProgressStage[];
}

export interface DistrictPerformanceItem {
  district_id: string;
  district_name: string;
  state_id?: string;
  state_name?: string;
  project_count: number;
  land_proposed_acres: number;
  land_acquired_acres: number;
  acquisition_percent: number;
  compensation_assessed_cr: number;
  compensation_awarded_cr?: number;
  compensation_disbursed_cr: number;
  disbursement_percent?: number;
  possession_percent: number;
  randr_completion_percent: number;
  pending_tasks_count?: number;
  overdue_tasks_count?: number;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
}

export interface DistrictEscalationItem {
  escalation_id: string;
  district_id?: string;
  district_name: string;
  project_title: string;
  project_id?: string;
  issue_type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  reason: string;
  current_owner: string;
  age_days: number;
  status: string;
}

export interface StateAttentionItem {
  item_id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  category: string;
  district_name?: string;
  project_title?: string;
  project_id?: string;
  description: string;
  action_required: string;
  sla_days_overdue?: number;
}

export interface StateCompensationSummary {
  total_assessed_cr: number;
  awards_issued_count: number;
  total_awarded_cr: number;
  total_disbursed_cr: number;
  pending_disbursement_cr: number;
  projects_with_financial_backlog: number;
  district_disbursements: Array<{
    district_name: string;
    assessed_cr: number;
    awarded_cr: number;
    disbursed_cr: number;
    pending_cr: number;
    disbursement_percent: number;
  }>;
}

export interface StatePossessionSummary {
  land_requiring_possession_acres: number;
  possession_completed_acres: number;
  possession_pending_acres: number;
  possession_progress_percent: number;
  projects_with_possession_delays: number;
  district_possessions: Array<{
    district_name: string;
    proposed_acres: number;
    acquired_acres: number;
    possession_percent: number;
    pending_acres: number;
  }>;
}

export interface StateRAndRSummary {
  affected_families: number;
  eligible_families: number;
  plot_allotments: number;
  schemes_count: number;
  completed_cases: number;
  pending_cases: number;
  district_randr: Array<{
    district_name: string;
    affected_families: number;
    eligible_families: number;
    settled_families: number;
    completion_percent: number;
  }>;
}

// Phase 11D District Officer / CALA Interfaces
export interface DistrictActionItem {
  id?: string;
  task_id?: string;
  task_name?: string;
  task_title?: string;
  project_id: string;
  project_title: string;
  project_code?: string;
  stage?: string;
  stage_name?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  created_at?: string;
  due_date?: string;
  sla_status?: 'OVERDUE' | 'DUE_SOON' | 'NORMAL' | string;
  sla_days_remaining?: number;
  status?: string;
  target_route?: string;
  action_url?: string;
  action_type?: string;
  assigned_role?: string;
  tehsil_name?: string;
  description?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface DistrictProjectSummaryItem {
  id?: string;
  project_id?: string;
  project_code: string;
  title: string;
  implementing_agency?: string;
  project_agency_name?: string;
  current_stage: string;
  progress_percent: number;
  land_proposed_acres?: number;
  land_acquired_acres?: number;
  land_pending_acres?: number;
  compensation_status?: string;
  compensation_assessed_cr?: number;
  compensation_disbursed_cr?: number;
  possession_status?: string;
  possession_acres?: number;
  possession_percent?: number;
  randr_completion_percent?: number;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | string;
  pending_action?: string;
  status?: string;
  tehsil_name?: string;
  days_delayed?: number;
}

export interface DistrictFieldVerificationSummary {
  total_assigned: number;
  in_progress: number;
  submitted_for_review: number;
  approved: number;
  rework_required: number;
  overdue: number;
  recent_submissions: Array<{
    verification_id: string;
    parcel_id: string;
    khasra_number: string;
    village_name: string;
    field_officer_name: string;
    submitted_at: string;
    gps_coordinates?: string;
    trees_enumerated: number;
    structures_found: number;
    evidence_count: number;
    status: string;
  }>;
}

export interface DistrictObjectionsSummary {
  total_objections: number;
  pending_review: number;
  hearings_scheduled: number;
  resolved: number;
  escalated: number;
  items: Array<{
    objection_id: string;
    reference_number: string;
    project_id: string;
    project_title: string;
    parcel_khasra: string;
    claimant_reference: string;
    objection_type: string;
    filing_date: string;
    hearing_date?: string;
    status: string;
    hearing_status: string;
    assigned_officer: string;
    next_action: string;
  }>;
}

export interface DistrictCompensationSummary {
  assessments_pending_review: number;
  assessments_approved: number;
  awards_pending: number;
  awards_issued: number;
  disbursement_pending_cr: number;
  disbursement_completed_cr: number;
  financial_issues_count: number;
  recent_cases: Array<{
    assessment_id: string;
    project_id: string;
    project_title: string;
    parcel_khasra: string;
    owner_name: string;
    market_value_cr: number;
    solatium_cr: number;
    total_amount_cr: number;
    status: string;
    next_step: string;
  }>;
}

export interface DistrictAwardsSummary {
  total_awards: number;
  awards_drafted: number;
  awards_approved: number;
  awards_published: number;
  awards_pending_action: number;
  items: Array<{
    award_id: string;
    award_number: string;
    project_id: string;
    project_title: string;
    parcel_khasra: string;
    assessed_amount_cr: number;
    award_amount_cr: number;
    award_date?: string;
    status: string;
    pending_action: string;
  }>;
}

export interface DistrictDisbursementSummary {
  total_awards_count: number;
  pending_payment_count: number;
  processing_count: number;
  disbursed_count: number;
  total_disbursed_cr: number;
  pending_amount_cr: number;
  items: Array<{
    disbursement_id: string;
    project_id: string;
    project_title: string;
    award_number: string;
    beneficiary_name: string;
    amount_cr: number;
    pfms_status: string;
    disbursement_status: string;
    pending_reason?: string;
    updated_at: string;
  }>;
}

export interface DistrictPossessionSummary {
  ready_for_possession_acres: number;
  pending_acres: number;
  scheduled_acres: number;
  possession_taken_acres: number;
  blocked_acres: number;
  items: Array<{
    possession_id: string;
    project_id: string;
    project_title: string;
    parcel_khasra: string;
    area_acres: number;
    compensation_cleared: boolean;
    randr_cleared: boolean;
    possession_status: string;
    scheduled_date?: string;
    blocker_reason?: string;
  }>;
}

export interface DistrictRAndRSummary {
  total_affected_families: number;
  eligible_families: number;
  entitlements_defined: number;
  allotments_completed: number;
  active_schemes_count: number;
  pending_cases: number;
  completion_percent: number;
  items: Array<{
    scheme_id: string;
    scheme_name: string;
    project_title: string;
    total_families: number;
    settled_families: number;
    progress_percent: number;
    status: string;
  }>;
}

export interface DistrictEscalationToStateItem {
  escalation_id: string;
  issue_title: string;
  project_id: string;
  project_title: string;
  stage_name: string;
  reason: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  current_owner: string;
  escalated_at: string;
  status: string;
  remarks?: string;
}

export interface DashboardSummaryData {
  scope_level: 'NATIONAL' | 'STATE' | 'DISTRICT' | 'AGENCY' | 'FIELD' | 'SYSTEM';
  jurisdiction_name: string;
  state_id?: string;
  state_name?: string;
  district_id?: string;
  district_name?: string;
  kpis: DashboardKpiSummary;
  acquisition_overview: AcquisitionOverview;
  randr_overview?: RAndROverview;
  status_breakdown: ProjectStatusCounts;
  state_progress: StateProgressItem[];
  attention_projects: AttentionProjectItem[];
  recent_activity: RecentActivityItem[];
  quick_actions: QuickActionItem[];

  // Phase 11B Central Command additions
  funnel?: NationalFunnelStageItem[];
  critical_projects?: CriticalProjectItem[];
  central_attention?: CentralAttentionItem[];
  risk_summary?: NationalRiskSummary;
  trends?: NationalTrendsSummary;

  // Phase 11C State Control additions
  district_performance?: DistrictPerformanceItem[];
  district_escalations?: DistrictEscalationItem[];
  state_attention?: StateAttentionItem[];
  state_compensation?: StateCompensationSummary;
  state_possession?: StatePossessionSummary;
  state_randr?: StateRAndRSummary;

  // Phase 11D District / CALA Control additions
  district_my_tasks?: DistrictActionItem[];
  district_projects?: DistrictProjectSummaryItem[];
  district_field_verification?: DistrictFieldVerificationSummary;
  district_objections?: DistrictObjectionsSummary;
  district_compensation?: DistrictCompensationSummary;
  district_awards?: DistrictAwardsSummary;
  district_disbursement?: DistrictDisbursementSummary;
  district_possession?: DistrictPossessionSummary;
  district_randr?: DistrictRAndRSummary;
  district_escalations_to_state?: DistrictEscalationToStateItem[];

  // Phase 11E Project Agency Control additions
  agency_control?: AgencyControlSummary;
  agency_actions?: AgencyActionItem[];
  agency_projects?: AgencyProjectsSummary;
  agency_land?: AgencyLandSummary;
  agency_compensation?: AgencyCompensationSummary;
  agency_possession?: AgencyPossessionSummary;
  agency_randr?: AgencyRAndRSummary;
  agency_risk?: AgencyRiskSummary;
}

// ============================================================================
// Phase 11E: Project Agency Control Center Types
// ============================================================================

export interface AgencyActionItem {
  id: string;
  task_type: string;
  category: 'PENDING_SUBMISSION' | 'REWORK_REQUEST' | 'DOCUMENT_REQUEST' | 'CLARIFICATION_REQUIRED' | 'SURVEY_REQUEST' | 'OTHER';
  title: string;
  description?: string;
  project_id: string;
  project_code: string;
  project_title: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REWORK_REQUIRED';
  due_date?: string;
  sla_status: 'OVERDUE' | 'DUE_SOON' | 'NORMAL';
  target_route: string;
  created_at: string;
  requested_by?: string;
  required_correction?: string;
}

export interface AgencyProjectItem {
  id: string;
  project_code: string;
  title: string;
  state_name?: string;
  district_name?: string;
  current_stage: string;
  current_stage_name: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_SCRUTINY' | 'REWORK_REQUESTED' | 'RESUBMITTED' | 'APPROVED' | 'ACQUISITION_IN_PROGRESS' | 'COMPLETED';
  land_proposed_acres: number;
  land_acquired_acres: number;
  land_pending_acres: number;
  acquisition_percent: number;
  compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  possession_acres: number;
  possession_percent: number;
  randr_completion_percent: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  risk_score: number;
  pending_action?: string;
}

export interface AgencyProjectsSummary {
  total_projects: number;
  draft_count: number;
  submitted_count: number;
  under_scrutiny_count: number;
  approved_count: number;
  in_progress_count: number;
  completed_count: number;
  items: AgencyProjectItem[];
}

export interface AgencyLandSummary {
  land_proposed_acres: number;
  land_identified_acres: number;
  land_verified_acres: number;
  land_acquired_acres: number;
  land_pending_acres: number;
  acquisition_percent: number;
  parcels_proposed_count: number;
  parcels_verified_count: number;
  parcels_acquired_count: number;
}

export interface AgencyCompensationSummary {
  assessed_cr: number;
  awarded_cr: number;
  disbursed_cr: number;
  pending_cr: number;
  disbursement_percent: number;
}

export interface AgencyPossessionSummary {
  ready_acres: number;
  pending_acres: number;
  completed_acres: number;
  possession_percent: number;
  blockers_count: number;
  action_required_count: number;
  items: Array<{
    project_code: string;
    package: string;
    ready_acres: number;
    status: string;
    action_required?: string;
  }>;
}

export interface AgencyRAndRSummary {
  affected_families: number;
  eligible_families: number;
  plot_allotments: number;
  completed_cases: number;
  pending_cases: number;
  completion_percent: number;
}

export interface AgencyRiskSummary {
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  risk_score: number;
  major_bottlenecks: string[];
  delayed_stages: string[];
  at_risk_projects_count: number;
}

export interface AgencyControlSummary {
  actions: AgencyActionItem[];
  projects_summary: AgencyProjectsSummary;
  land_acquisition: AgencyLandSummary;
  compensation: AgencyCompensationSummary;
  possession: AgencyPossessionSummary;
  randr: AgencyRAndRSummary;
  risk: AgencyRiskSummary;
}

