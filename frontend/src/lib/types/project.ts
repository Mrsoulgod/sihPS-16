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
  total_parcels_count?: number;
  verified_parcels_count?: number;
  assessed_parcels_count?: number;
  awards_count?: number;
  disbursed_parcels_count?: number;
  possession_parcels_count?: number;
  total_assessed_compensation_cr?: number;
  total_awarded_cr?: number;
  total_disbursed_compensation_cr?: number;
  outstanding_compensation_cr?: number;
  created_at?: string;
  alignment_geojson?: any;
  status?: string;
  proposal_status?: string;
  rework_remarks?: string;
}

export interface ProjectProposalCreate {
  title: string;
  project_code: string;
  project_type: string;
  project_category: string;
  description: string;
  objective?: string;
  sponsoring_ministry: string;
  estimated_project_cost_cr: number;
  priority?: string;
  proposed_start_date?: string;
  target_completion_date?: string;
  state_id: string;
  primary_district_id: string;
  tehsil_name?: string;
  villages?: string[];
  start_location?: string;
  end_location?: string;
  project_length_km?: number;
  total_land_required_acres: number;
  land_unit?: string;
  government_land_acres?: number;
  private_land_acres?: number;
  other_land_acres?: number;
  expected_parcel_count?: number;
  affected_villages_count?: number;
  proposed_land_remarks?: string;
  alignment_geojson?: any;
  preliminary_coordinates?: Array<[number, number]>;
  document_ids?: string[];
  is_draft?: boolean;
}

export interface ProjectDraftUpdate {
  title?: string;
  project_type?: string;
  project_category?: string;
  description?: string;
  objective?: string;
  sponsoring_ministry?: string;
  estimated_project_cost_cr?: number;
  priority?: string;
  proposed_start_date?: string;
  target_completion_date?: string;
  state_id?: string;
  primary_district_id?: string;
  tehsil_name?: string;
  villages?: string[];
  start_location?: string;
  end_location?: string;
  project_length_km?: number;
  total_land_required_acres?: number;
  land_unit?: string;
  government_land_acres?: number;
  private_land_acres?: number;
  other_land_acres?: number;
  expected_parcel_count?: number;
  affected_villages_count?: number;
  proposed_land_remarks?: string;
  alignment_geojson?: any;
  preliminary_coordinates?: Array<[number, number]>;
  document_ids?: string[];
}

export interface ProjectSubmitRequest {
  submission_remarks?: string;
}

export interface ProjectResubmitRequest {
  response_remarks: string;
  corrections_summary: string;
  document_ids?: string[];
}

export interface SurveyRequestCreate {
  survey_type: 'LAND_SURVEY' | 'FIELD_VERIFICATION' | 'BOUNDARY_CLARIFICATION' | 'SITE_VERIFICATION' | 'ADDITIONAL_FIELD_INFO';
  title: string;
  justification: string;
  target_district_id: string;
  target_tehsil?: string;
  target_villages?: string[];
  khasra_numbers?: string[];
  coordinates_geojson?: any;
}

