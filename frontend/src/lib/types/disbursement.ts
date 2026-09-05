export interface DisbursementListItem {
  id: string;
  disbursement_reference: string;
  pfms_batch_reference: string;
  award_id: string;
  award_number: string;
  project_id: string;
  project_title: string;
  parcel_id: string;
  khasra_number: string;
  owner_id: string;
  owner_name: string;
  masked_bank_account: string;
  masked_ifsc: string;
  amount_inr: number | string;
  payment_method: string;
  payment_status: string;
  bank_utr_number?: string | null;
  disbursed_at?: string | null;
  created_at: string;
}

export interface DisbursementDetail {
  id: string;
  disbursement_reference: string;
  pfms_batch_reference: string;
  payment_workflow_label: string;
  award_id: string;
  award_number: string;
  award_amount_inr: number | string;
  project_id: string;
  project_title: string;
  project_code: string;
  district_name: string;
  state_name: string;
  parcel_id: string;
  khasra_number: string;
  owner_id: string;
  owner_name: string;
  relative_name?: string | null;
  masked_bank_account: string;
  masked_ifsc: string;
  bank_name: string;
  social_category: string;
  is_kyc_verified: boolean;
  amount_inr: number | string;
  payment_method: string;
  payment_status: string;
  bank_utr_number?: string | null;
  disbursed_at?: string | null;
  failure_reason?: string | null;
  remarks?: string | null;
  processed_by_user_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialReconciliationSummary {
  reference_id: string;
  reference_title: string;
  total_assessed_inr: number;
  total_awarded_inr: number;
  total_disbursed_inr: number;
  outstanding_inr: number;
  disbursement_percent: number;
  total_beneficiaries_count: number;
  disbursed_beneficiaries_count: number;
  pending_beneficiaries_count: number;
  reconciliation_status: string;
}

export interface DisbursementFilterParams {
  project_id?: string;
  award_id?: string;
  payment_status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
