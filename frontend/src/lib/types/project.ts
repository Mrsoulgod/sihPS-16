export interface ProjectListItem {
  id: string;
  project_code: string;
  title: string;
  description: string;
  sponsoring_ministry: string;
  implementing_agency: string;
  current_stage: string;
  current_stage_name: string;
  primary_district_name?: string;
  state_name?: string;
  total_land_proposed_acres: number;
  total_land_acquired_acres: number;
  acquisition_progress_percent: number;
  total_possession_acres: number;
  estimated_budget_inr_cr: number;
  compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  disbursement_percent: number;
  total_paf_count: number;
  total_pdf_count: number;
  randr_completion_percent: number;
  risk_score: number;
  parcels_count: number;
}

export interface ProjectDetailResponse {
  id: string;
  project_code: string;
  title: string;
  description: string;
  sponsoring_ministry: string;
  implementing_agency: string;
  current_stage: string;
  current_stage_name: string;
  primary_district_id?: string;
  primary_district_name?: string;
  state_id?: string;
  state_name?: string;
  total_land_proposed_acres: number;
  total_land_acquired_acres: number;
  total_possession_acres: number;
  acquisition_progress_percent: number;
  possession_percent: number;
  estimated_budget_inr_cr: number;
  compensation_assessed_cr: number;
  compensation_disbursed_cr: number;
  disbursement_percent: number;
  total_paf_count: number;
  total_pdf_count: number;
  randr_completion_percent: number;
  risk_score: number;
  parcels_count: number;
  created_at?: string;
  alignment_geojson?: any;
}
