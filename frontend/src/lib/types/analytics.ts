export interface AnalyticsKpiSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_land_proposed_acres: number | string;
  total_land_acquired_acres: number | string;
  acquisition_progress_percent: number | string;
  total_compensation_assessed_cr: number | string;
  total_compensation_awarded_cr: number | string;
  total_compensation_disbursed_cr: number | string;
  outstanding_compensation_cr: number | string;
  disbursement_progress_percent: number | string;
  total_possession_acres: number | string;
  possession_progress_percent: number | string;
  total_affected_families: number;
  total_displaced_families: number;
  randr_completed_families: number;
  randr_completion_percent: number | string;
}

export interface AcquisitionFunnelStage {
  stage_id: string;
  stage_name: string;
  metric_label: string;
  unit: string;
  value: number | string;
  formatted_value: string;
  conversion_rate_pct: number | string;
  status: string;
}

export interface AcquisitionFunnelResponse {
  stages: AcquisitionFunnelStage[];
  baseline_project_count: number;
  baseline_proposed_acres: number | string;
}

export interface StateAnalyticsItem {
  state_id: string;
  state_name: string;
  project_count: number;
  land_proposed_acres: number | string;
  land_acquired_acres: number | string;
  acquisition_percent: number | string;
  compensation_assessed_cr: number | string;
  compensation_disbursed_cr: number | string;
  disbursement_percent: number | string;
  possession_acres: number | string;
  possession_percent: number | string;
  affected_families_count: number;
  randr_completed_count: number;
  randr_completion_percent: number | string;
  performance_category: 'STRONG' | 'MODERATE' | 'POOR';
}

export interface DistrictAnalyticsItem {
  district_id: string;
  district_name: string;
  state_name: string;
  project_count: number;
  land_proposed_acres: number | string;
  land_acquired_acres: number | string;
  acquisition_percent: number | string;
  compensation_assessed_cr: number | string;
  compensation_disbursed_cr: number | string;
  disbursement_percent: number | string;
  possession_acres: number | string;
  affected_families_count: number;
  randr_completion_percent: number | string;
}

export interface TimeSeriesDataPoint {
  period_label: string;
  date_iso: string;
  projects_initiated: number;
  land_acquired_acres_cumulative: number | string;
  compensation_disbursed_cr_cumulative: number | string;
  possession_acres_cumulative: number | string;
  randr_settled_cumulative: number;
}

export interface TimeSeriesResponse {
  data_points: TimeSeriesDataPoint[];
  time_horizon_note: string;
  source_database_status: string;
}

export interface BottleneckItem {
  project_id: string;
  project_code: string;
  title: string;
  state_name?: string | null;
  district_name?: string | null;
  current_stage: string;
  severity: 'CRITICAL' | 'AT_RISK' | 'WATCH' | 'ON_TRACK';
  primary_reason: string;
  overdue_tasks_count: number;
  outstanding_compensation_cr: number | string;
  disputed_parcels_count: number;
  pending_rr_families_count: number;
  risk_score: number;
}

export interface DataQualityCheckItem {
  check_id: string;
  check_name: string;
  status: 'PASSED' | 'WARNING' | 'FLAGGED';
  rule_description: string;
  tested_value: string;
  reference_value: string;
  is_compliant: boolean;
  notes?: string | null;
}

export interface DataQualityResponse {
  overall_status: 'COMPLIANT' | 'ATTENTION_REQUIRED';
  total_checks_count: number;
  passed_checks_count: number;
  warnings_count: number;
  checks: DataQualityCheckItem[];
  reconciliation_timestamp: string;
}

export interface NationalAnalyticsOverviewResponse {
  scope_level: string;
  jurisdiction_name: string;
  kpis: AnalyticsKpiSummary;
  funnel: AcquisitionFunnelResponse;
  data_quality_summary: DataQualityResponse;
}

export interface RiskFactorItem {
  factor_id: string;
  factor_name: string;
  weight_percent: number;
  score: number;
  weighted_contribution: number;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  explanation: string;
  key_indicators: string[];
}

export interface ProjectRiskDetail {
  project_id: string;
  project_code: string;
  title: string;
  state_name?: string | null;
  district_name?: string | null;
  current_stage: string;
  overall_risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: RiskFactorItem[];
  top_risk_drivers: string[];
  decision_support_recommendations: string[];
  assessment_timestamp: string;
  methodology_version: string;
}

export interface RiskDistributionCount {
  low_count: number;
  moderate_count: number;
  high_count: number;
  critical_count: number;
  total_projects: number;
}

export interface HighRiskProjectLeaderboardItem {
  project_id: string;
  project_code: string;
  title: string;
  state_name?: string | null;
  district_name?: string | null;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primary_driver: string;
  recommended_action: string;
}

export interface RiskOverviewResponse {
  scope_level: string;
  jurisdiction_name: string;
  distribution: RiskDistributionCount;
  top_high_risk_projects: HighRiskProjectLeaderboardItem[];
  factor_benchmarks: {
    factor_id: string;
    name: string;
    weight: string;
    description: string;
  }[];
  methodology_note: string;
}

export interface ReportTypeInfo {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  supported_filters: string[];
  supported_formats: string[];
}

export interface ReportSummaryKpi {
  label: string;
  value: string;
  subtitle?: string | null;
}

export interface ReportTableColumn {
  key: string;
  label: string;
  align: 'left' | 'right' | 'center';
  is_numeric: boolean;
}

export interface ReportPreviewResponse {
  report_id: string;
  report_title: string;
  report_code: string;
  scope_jurisdiction: string;
  generated_at: string;
  filter_summary: Record<string, any>;
  summary_kpis: ReportSummaryKpi[];
  columns: ReportTableColumn[];
  rows: Record<string, any>[];
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ReportFilterRequest {
  report_type: string;
  state_id?: string;
  district_id?: string;
  project_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}
