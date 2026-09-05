export interface DashboardKpiSummary {
  total_projects: number;
  total_land_proposed_acres: number;
  total_land_acquired_acres: number;
  total_possession_acres: number;
  overall_acquisition_percent: number;
  compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  overall_disbursement_percent: number;
  affected_families: number;
  displaced_families: number;
  total_paf_count: number;
  total_pdf_count: number;
  avg_randr_completion_percent: number;
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
  compensation_disbursed_cr: number;
  randr_completion_percent: number;
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
}
