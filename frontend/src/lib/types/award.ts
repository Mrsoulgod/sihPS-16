export interface AwardParcelSummary {
  parcel_id: string;
  khasra_number: string;
  village_name: string;
  acquired_area_sqm: number | string;
  compensation_assessment_id: string;
  assessment_reference?: string | null;
  assessed_amount_inr: number | string;
  owner_names: string[];
}

export interface AwardListItem {
  id: string;
  award_number: string;
  project_id: string;
  project_title: string;
  project_code: string;
  award_date: string;
  total_parcels_count: number;
  total_area_acres: number | string;
  total_award_amount_inr: number | string;
  cala_user_name: string;
  status: string;
  has_demo_esign: boolean;
  created_at: string;
}

export interface AwardDetail {
  id: string;
  award_number: string;
  project_id: string;
  project_title: string;
  project_code: string;
  district_name: string;
  state_name: string;
  award_date: string;
  total_parcels_count: number;
  total_area_acres: number | string;
  total_award_amount_inr: number | string;
  status: string;
  cala_user_id: string;
  cala_user_name: string;
  cala_designation?: string | null;
  digital_sign_hash?: string | null;
  approval_stamp_label: string;
  approved_by_user_name?: string | null;
  approval_date?: string | null;
  remarks?: string | null;
  parcels: AwardParcelSummary[];
  total_disbursed_inr: number | string;
  remaining_inr: number | string;
  disbursement_percent: number | string;
  created_at: string;
  updated_at: string;
}

export interface AwardFilterParams {
  project_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
