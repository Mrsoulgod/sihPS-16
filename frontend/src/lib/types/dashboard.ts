export interface DashboardKpiSummary {
  // 11 National Command KPIs
  total_projects: number;
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

export interface DashboardSummaryData {
  scope_level: 'NATIONAL' | 'STATE' | 'DISTRICT' | 'AGENCY' | 'FIELD' | 'SYSTEM';
  jurisdiction_name: string;
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
}
