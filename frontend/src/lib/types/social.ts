/**
 * Phase 11G: Social / R&R Officer Types
 */

export interface SocialRAndRKpiSummary {
  affected_families_count: number;
  survey_pending_count: number;
  eligibility_pending_count: number;
  entitlement_pending_count: number;
  approval_pending_count: number;
  allotment_pending_count: number;
  implementation_pending_count: number;
  verification_pending_count: number;
  completed_count: number;
  overdue_cases_count: number;
  high_risk_projects_count: number;
  active_schemes_count: number;
}

export interface SocialRAndRActionItem {
  id: string;
  family_id?: string;
  family_reference_id: string;
  head_of_family_name: string;
  project_id?: string;
  project_title: string;
  project_code: string;
  village_name: string;
  tehsil_name: string;
  case_stage: string;
  action_type: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  status: string;
  due_date?: string;
  is_overdue: boolean;
  sla_status: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
  required_action: string;
  target_route: string;
}

export interface AffectedFamilyCaseItem {
  id: string;
  family_reference_id: string;
  head_of_family_name: string;
  project_id?: string;
  project_title: string;
  project_code: string;
  village_name: string;
  tehsil_name: string;
  parcel_id?: string;
  khasra_number: string;
  displacement_status: string;
  family_type: string;
  social_category: string;
  family_members_count: number;
  contact_masked?: string;
  eligibility_status: string;
  eligibility_category?: string;
  entitlement_status: string;
  entitled_plot_sqyd: number;
  subsistence_grant_inr: number;
  allotment_status: string;
  allotted_plot_number?: string;
  implementation_status: string;
  case_status: string;
  pending_action: string;
  is_overdue: boolean;
  due_date?: string;
  scheme_id?: string;
  scheme_title?: string;
}

export interface CaseSummarySection {
  family_reference_id: string;
  head_of_family_name: string;
  project_id?: string;
  project_title: string;
  project_code: string;
  parcel_id?: string;
  khasra_number: string;
  village_name: string;
  tehsil_name: string;
  district_name: string;
  displacement_status: string;
  family_type: string;
  social_category: string;
  family_members_count: number;
  contact_masked?: string;
  case_status: string;
  current_stage: string;
  sla_due_date?: string;
  blocking_possession: boolean;
}

export interface CaseEligibilitySection {
  eligibility_status: string;
  eligibility_category?: string;
  eligibility_basis?: string;
  assessing_authority?: string;
  assessment_date?: string;
  verification_status: string;
  remarks?: string;
  can_edit_eligibility: boolean;
}

export interface CaseEntitlementsSection {
  entitlement_status: string;
  entitlement_category: string;
  entitled_plot_sqyd: number;
  subsistence_grant_inr: number;
  transportation_allowance_inr: number;
  one_time_resettlement_allowance_inr: number;
  total_assistance_inr: number;
  source_parameter: string;
  is_grant_disbursed: boolean;
  remarks?: string;
}

export interface AllotmentItem {
  id: string;
  allotment_reference: string;
  entitlement_category: string;
  allotment_type: string;
  asset_identifier: string;
  allotment_order_no: string;
  allotment_date: string;
  delivery_date?: string;
  allocated_value_inr: number;
  responsible_authority?: string;
  status: string;
  remarks?: string;
}

export interface CaseAllotmentsSection {
  allotment_status: string;
  scheme_id?: string;
  scheme_title?: string;
  resettlement_site_name?: string;
  allotted_plot_number?: string;
  items: AllotmentItem[];
}

export interface CaseDocumentItem {
  id: string;
  document_type: string;
  title: string;
  file_name: string;
  file_path?: string;
  version: number;
  file_hash?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  is_verified: boolean;
}

export interface CaseDocumentsSection {
  required_documents: string[];
  submitted_documents: CaseDocumentItem[];
  verification_status: string;
}

export interface CaseImplementationSection {
  current_status: string;
  progress_percent: number;
  pending_action: string;
  physical_possession_handed_over: boolean;
  grant_transferred: boolean;
  milestones: Array<{ name: string; completed: boolean; date?: string }>;
}

export interface CaseVerificationSection {
  verification_status: string;
  verification_date?: string;
  verifying_officer_name?: string;
  verifying_officer_designation?: string;
  observations?: string;
  rework_reason?: string;
}

export interface CaseTimelineEvent {
  stage: string;
  title: string;
  description: string;
  actor_name: string;
  actor_role: string;
  timestamp: string;
  status: string;
}

export interface FamilyCaseDetailResponse {
  family_id: string;
  summary: CaseSummarySection;
  eligibility: CaseEligibilitySection;
  entitlements: CaseEntitlementsSection;
  allotments: CaseAllotmentsSection;
  documents: CaseDocumentsSection;
  implementation: CaseImplementationSection;
  verification: CaseVerificationSection;
  timeline: CaseTimelineEvent[];
  audit_history: Array<Record<string, any>>;
}

export interface ProjectRAndRSummaryItem {
  project_id: string;
  project_code: string;
  project_title: string;
  district_name: string;
  total_affected_families: number;
  eligible_families: number;
  entitlements_assessed: number;
  allotments_completed: number;
  physically_settled_families: number;
  verification_completed: number;
  randr_completion_percent: number;
  pending_cases_count: number;
  overdue_cases_count: number;
  randr_risk_level: string;
  has_blocking_possession_dependency: boolean;
  blocking_dependency_description?: string;
  target_action: string;
}

export interface SocialDashboardSummary {
  kpis: SocialRAndRKpiSummary;
  my_actions: SocialRAndRActionItem[];
  overdue_cases: AffectedFamilyCaseItem[];
  eligibility_pending_cases: AffectedFamilyCaseItem[];
  entitlement_pending_cases: AffectedFamilyCaseItem[];
  allotment_pending_cases: AffectedFamilyCaseItem[];
  verification_pending_cases: AffectedFamilyCaseItem[];
  active_schemes_summary: Array<Record<string, any>>;
  projects_progress: ProjectRAndRSummaryItem[];
  risk_summary: Record<string, any>;
  notifications: Array<Record<string, any>>;
}

export interface FamilySurveyPayload {
  displacement_category: string;
  family_type: string;
  social_category: string;
  family_members_count: number;
  existing_housing_type?: string;
  livelihood_source?: string;
  survey_remarks: string;
  supporting_document_ids?: string[];
}

export interface EligibilityReviewPayload {
  eligibility_status: string;
  eligibility_category?: string;
  eligibility_basis: string;
  eligibility_remarks?: string;
  request_documents?: string[];
}

export interface EntitlementAssessmentPayload {
  entitled_plot_sqyd: number;
  subsistence_grant_inr: number;
  transportation_allowance_inr: number;
  one_time_resettlement_allowance_inr: number;
  entitlement_remarks?: string;
}

export interface AllotmentActionPayload {
  scheme_id?: string;
  allotment_type: string;
  asset_identifier: string;
  allotment_order_no: string;
  allocated_value_inr: number;
  status: string;
  remarks?: string;
}

export interface VerificationActionPayload {
  verification_status: string;
  physical_relocation_confirmed: boolean;
  grant_receipt_confirmed: boolean;
  remarks: string;
  rework_reason?: string;
}
