export interface SchemeProgressKpis {
  total_affected_families: number;
  eligible_families: number;
  approved_families: number;
  allocated_families: number;
  completed_families: number;
  completion_percent: number;
}

export interface RAndRSchemeListItem {
  id: string;
  scheme_reference: string;
  scheme_title: string;
  scheme_type: string;
  project_id: string;
  project_title: string;
  project_code: string;
  sanctioned_budget_cr: number | string;
  spent_budget_cr: number | string;
  status: string;
  target_completion_date?: string | null;
  total_families_count: number;
  eligible_families_count: number;
  assisted_families_count: number;
  progress_percent: number;
  created_at: string;
}

export interface RAndRSchemeDetail extends RAndRSchemeListItem {
  state_name?: string | null;
  district_name?: string | null;
  approval_date?: string | null;
  approved_by_name?: string | null;
  remarks?: string | null;
  kpis: SchemeProgressKpis;
  families: AffectedFamilyListItem[];
  allotments: RAndRAllotmentItem[];
  updated_at?: string | null;
}

export interface AcquisitionTraceLinkage {
  project_id: string;
  project_code: string;
  project_title: string;
  parcel_id?: string | null;
  khasra_number?: string | null;
  khata_number?: string | null;
  parcel_area_sqm?: number | string | null;
  parcel_status?: string | null;
  owner_id?: string | null;
  owner_name?: string | null;
  compensation_id?: string | null;
  compensation_reference?: string | null;
  compensation_total_inr?: number | string | null;
  compensation_status?: string | null;
  award_id?: string | null;
  award_number?: string | null;
  award_status?: string | null;
  disbursement_id?: string | null;
  disbursement_reference?: string | null;
  disbursement_status?: string | null;
  disbursement_paid_amount?: number | string | null;
  possession_id?: string | null;
  possession_reference?: string | null;
  possession_status?: string | null;
  possession_date?: string | null;
  scheme_id?: string | null;
  scheme_title?: string | null;
  scheme_reference?: string | null;
}

export interface AffectedFamilyListItem {
  id: string;
  family_reference_id: string;
  head_of_family_name: string;
  family_type: string;
  displacement_category: string;
  social_category: string;
  village_name?: string | null;
  khasra_number?: string | null;
  parcel_id?: string | null;
  project_id?: string | null;
  project_code?: string | null;
  project_title?: string | null;
  scheme_id?: string | null;
  scheme_title?: string | null;
  scheme_reference?: string | null;
  eligibility_status: string;
  eligibility_category?: string | null;
  rehabilitation_status: string;
  allotted_plot_number?: string | null;
  subsistence_grant_inr?: number | string | null;
  is_grant_disbursed: boolean;
  allotments_count: number;
  created_at: string;
}

export interface AffectedFamilyDetail extends AffectedFamilyListItem {
  contact_masked?: string | null;
  family_members_count: number;
  entitled_plot_sqyd?: number | string | null;
  transportation_allowance_inr?: number | string | null;
  one_time_resettlement_allowance_inr?: number | string | null;
  eligibility_assessment_date?: string | null;
  assessing_authority?: string | null;
  eligibility_basis?: string | null;
  eligibility_remarks?: string | null;
  acquisition_trace?: AcquisitionTraceLinkage | null;
  allotments: RAndRAllotmentItem[];
  updated_at?: string | null;
}

export interface RAndRAllotmentItem {
  id: string;
  family_id: string;
  family_reference_id?: string | null;
  head_of_family_name?: string | null;
  scheme_id?: string | null;
  scheme_title?: string | null;
  allotment_reference: string;
  entitlement_category: string;
  allotment_type: string;
  asset_identifier?: string | null;
  allotment_order_no?: string | null;
  allotment_date?: string | null;
  delivery_date?: string | null;
  allocated_value_inr?: number | string | null;
  status: string;
  responsible_authority?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface RAndRSchemeFilterParams {
  project_id?: string;
  status?: string;
  scheme_type?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AffectedFamilyFilterParams {
  project_id?: string;
  scheme_id?: string;
  district_id?: string;
  eligibility_status?: string;
  rehabilitation_status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface EligibilityAssessmentPayload {
  eligibility_status: "PENDING" | "UNDER_REVIEW" | "ELIGIBLE" | "INELIGIBLE" | "DISPUTED" | "APPROVED";
  eligibility_category?: string;
  assessing_authority?: string;
  eligibility_basis?: string;
  eligibility_remarks?: string;
}

export interface RAndRAllotmentPayload {
  family_id: string;
  scheme_id?: string;
  entitlement_category: string;
  allotment_type: "PLOT" | "HOUSING_UNIT" | "CASH_GRANT" | "ANNUITY" | "LIVELIHOOD_ASSET" | "TRAINING_SEAT" | "OTHER";
  asset_identifier?: string;
  allotment_order_no?: string;
  allotment_date?: string;
  delivery_date?: string;
  allocated_value_inr?: number | string;
  status?: string;
  responsible_authority?: string;
  remarks?: string;
}
