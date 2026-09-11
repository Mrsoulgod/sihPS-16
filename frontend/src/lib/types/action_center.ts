export interface AvailableActionOption {
  action: string;
  label: string;
  description: string;
  permission: string;
  target_status?: string;
  requires_remarks: boolean;
  requires_rejection_reason: boolean;
  requires_document: boolean;
  requires_confirmation: boolean;
  is_primary: boolean;
  badge_variant: "default" | "primary" | "danger" | "warning" | "outline";
  target_authority_options?: { role: string; label: string }[];
}

export interface ActionItemResponse {
  id: string;
  action_type: string;
  title: string;
  description?: string;
  project_id?: string;
  project_code?: string;
  project_title?: string;
  record_type: string;
  record_reference: string;
  workflow_stage: string;
  workflow_stage_name: string;
  status: "PENDING" | "IN_PROGRESS" | "REWORK_REQUIRED" | "FORWARDED" | "COMPLETED" | "SUBMITTED" | "REJECTED";
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  due_date?: string;
  sla_days_remaining?: number;
  is_overdue: boolean;
  assigned_role: string;
  assigned_role_name: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  required_action_summary: string;
  created_at: string;
  updated_at?: string;
  rework_reason?: string;
  forwarded_to_role?: string;
  forwarded_to_user_name?: string;
  primary_action?: AvailableActionOption;
}

export interface ActionCenterKpis {
  requires_action: number;
  due_soon: number;
  overdue: number;
  high_priority: number;
  in_progress: number;
  returned_rework: number;
  forwarded: number;
  completed: number;
}

export interface ActionCenterSummaryResponse {
  kpis: ActionCenterKpis;
  my_actions: ActionItemResponse[];
  in_progress: ActionItemResponse[];
  returned_rework: ActionItemResponse[];
  forwarded: ActionItemResponse[];
  completed: ActionItemResponse[];
  recent_activity: {
    id: string;
    action: string;
    title: string;
    project: string;
    user: string;
    role: string;
    timestamp: string;
    details: string;
  }[];
}

export interface RequiredActionDetail {
  what_needs_to_be_done: string;
  why_it_is_required: string;
  information_or_documents_needed: string[];
  what_happens_after_completion: string;
  statutory_reference?: string;
}

export interface RecordInformationSection {
  record_type: string;
  record_reference: string;
  title: string;
  key_attributes: Record<string, any>;
  financial_details?: Record<string, any>;
  geographic_details?: Record<string, any>;
  beneficiary_details?: Record<string, any>;
}

export interface ActionDocumentItem {
  id: string;
  document_name: string;
  category: string;
  version_number: number;
  is_current: boolean;
  uploaded_by: string;
  uploaded_at: string;
  file_size_bytes?: number;
  verification_status: "PENDING" | "ACCEPTED" | "REJECTED" | "REWORK";
  file_url?: string;
  sha256_hash?: string;
}

export interface ActionRemarkItem {
  id: string;
  author_name: string;
  author_role: string;
  action: string;
  remarks: string;
  timestamp: string;
}

export interface ActionTimelineEvent {
  stage_name: string;
  decision: string;
  officer_name: string;
  officer_role: string;
  remarks?: string;
  timestamp: string;
}

export interface ActionWorkspaceResponse {
  action_item: ActionItemResponse;
  case_summary: Record<string, any>;
  required_action: RequiredActionDetail;
  record_information: RecordInformationSection;
  available_actions: AvailableActionOption[];
  remarks_history: ActionRemarkItem[];
  documents: ActionDocumentItem[];
  workflow_timeline: ActionTimelineEvent[];
  audit_history: {
    action: string;
    user: string;
    role: string;
    timestamp: string;
    details: string;
  }[];
}

export interface ActionExecuteRequest {
  action: string;
  remarks?: string;
  rejection_reason?: string;
  rework_reason?: string;
  rework_items?: string[];
  target_authority_role?: string;
  target_user_id?: string;
  due_date?: string;
  document_ids?: string[];
  extra_payload?: Record<string, any>;
}

export interface ActionAssignRequest {
  action_id: string;
  target_role: string;
  target_user_id?: string;
  instructions: string;
  priority?: string;
  due_date?: string;
}

export interface ActionForwardRequest {
  target_role: string;
  target_user_id?: string;
  forwarding_remarks: string;
  supporting_document_ids?: string[];
}

export interface ActionReworkRequest {
  rework_reason: string;
  rework_items?: string[];
  due_date?: string;
  remarks?: string;
}
