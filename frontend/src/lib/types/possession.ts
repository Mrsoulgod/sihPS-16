export interface ComplianceCheckItem {
  check_name: string;
  is_satisfied: boolean;
  status_label: string;
  details: string;
}

export interface PossessionListItem {
  id: string;
  possession_reference: string;
  project_id: string;
  project_title: string;
  project_code: string;
  parcel_id: string;
  khasra_number: string;
  village_name: string;
  district_name: string;
  possession_date: string;
  possession_type: string;
  status: string;
  is_encumbrance_free: boolean;
  taken_by_officer_name: string;
  handed_over_by_officer_name: string;
  created_at: string;
}

export interface PossessionDetail {
  id: string;
  possession_reference: string;
  status: string;
  project_id: string;
  project_title: string;
  project_code: string;
  district_name: string;
  state_name: string;
  parcel_id: string;
  khasra_number: string;
  khata_number: string;
  village_name: string;
  acquired_area_sqm: number | string;
  area_acres: number | string;
  land_type: string;
  award_id?: string | null;
  award_number?: string | null;
  possession_date: string;
  possession_type: string;
  is_encumbrance_free: boolean;
  possession_certificate_doc_id?: string | null;
  certificate_number?: string | null;
  taken_by_agency_officer_id: string;
  taken_by_officer_name: string;
  taken_by_organization?: string | null;
  handed_over_by_cala_id: string;
  handed_over_by_officer_name: string;
  handed_over_by_designation?: string | null;
  remarks?: string | null;
  prerequisite_checks: ComplianceCheckItem[];
  created_at: string;
  updated_at: string;
}

export interface PossessionFilterParams {
  project_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
