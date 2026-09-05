export interface StatutoryComponentDetail {
  component_name: string;
  statutory_basis: string;
  amount_inr: number | string;
  percentage_or_rate?: number | string | null;
  formula_description: string;
}

export interface CompensationCalculationBreakdown {
  area_sqm: number | string;
  circle_rate_per_sqm: number | string;
  base_land_value_inr: number | string;
  multiplier_factor: number | string;
  market_value_land_inr: number | string;
  assets_value_inr: number | string;
  solatium_rate_percent: number | string;
  solatium_inr: number | string;
  statutory_additional_rate_percent: number | string;
  statutory_period_days: number;
  additional_market_value_inr: number | string;
  total_compensation_inr: number | string;
  components: StatutoryComponentDetail[];
  calculation_summary: string;
}

export interface AssetValuationItem {
  id: string;
  assessment_id: string;
  asset_category: string;
  description: string;
  quantity: number | string;
  unit: string;
  unit_rate_inr: number | string;
  total_asset_value_inr: number | string;
  depreciation_inr: number | string;
  net_asset_value_inr: number | string;
}

export interface MaskedOwnerItem {
  id: string;
  full_name: string;
  relative_name?: string | null;
  ownership_share_percent: number;
  masked_bank_account: string;
  masked_bank_ifsc: string;
  is_kyc_verified: boolean;
}

export interface CompensationAssessmentListItem {
  id: string;
  assessment_reference: string;
  project_id: string;
  project_title: string;
  parcel_id: string;
  khasra_number: string;
  village_name: string;
  district_name: string;
  state_name: string;
  owner_names: string[];
  acquired_area_sqm: number | string;
  total_compensation_inr: number | string;
  status: string;
  is_approved_by_cala: boolean;
  approval_date?: string | null;
  assessing_officer_name?: string | null;
  created_at: string;
}

export interface CompensationAssessmentDetail {
  id: string;
  assessment_reference: string;
  status: string;
  project_id: string;
  project_code: string;
  project_title: string;
  parcel_id: string;
  khasra_number: string;
  khata_number: string;
  village_name: string;
  tehsil_name?: string | null;
  district_name: string;
  state_name: string;
  land_type: string;
  acquired_area_sqm: number | string;
  circle_rate_per_sqm: number | string;
  multiplier_factor: number | string;
  base_land_value_inr: number | string;
  market_value_land_inr: number | string;
  assets_value_inr: number | string;
  solatium_inr: number | string;
  additional_market_value_inr: number | string;
  total_compensation_inr: number | string;
  breakdown: CompensationCalculationBreakdown;
  asset_valuations: AssetValuationItem[];
  owners: MaskedOwnerItem[];
  is_approved_by_cala: boolean;
  approval_date?: string | null;
  assessing_officer_name?: string | null;
  award_id?: string | null;
  award_number?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompensationFilterParams {
  project_id?: string;
  status?: string;
  state_id?: string;
  district_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
