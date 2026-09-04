export interface StageDefinition {
  stage_code: string;
  stage_name: string;
  sequence_order: number;
  sla_days: number;
  statutory_reference: string;
  primary_role: string;
  description: string;
  can_reject: boolean;
  rejection_target?: string;
  required_documents: string[];
}

export interface ProjectStageItem {
  id: string;
  project_id: string;
  stage_code: string;
  stage_name: string;
  sequence_order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'REJECTED';
  compliance_status: 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
  sla_deadline_days: number;
  started_at?: string;
  due_date?: string;
  completed_at?: string;
  days_remaining?: number;
  is_overdue: boolean;
  assigned_role?: string;
  assigned_role_name?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  comments?: string;
  rejection_reason?: string;
  required_documents?: string[];
}

export interface TransitionHistoryItem {
  id: string;
  from_stage: string;
  to_stage: string;
  decision: 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  remarks?: string;
  triggered_by_user_id: string;
  triggered_by_name?: string;
  triggered_by_role?: string;
  created_at: string;
}

export interface AllowedAction {
  action: 'APPROVED' | 'REJECTED';
  label: string;
  target_stage?: string;
}

export interface ProjectWorkflowTimelineResponse {
  project_id: string;
  project_code: string;
  project_title: string;
  current_stage: string;
  overall_progress_percent: number;
  is_current_stage_overdue: boolean;
  stages: ProjectStageItem[];
  transition_history: TransitionHistoryItem[];
  can_current_user_transition: boolean;
  allowed_transitions: AllowedAction[];
}

export interface StageTransitionRequest {
  decision: 'APPROVED' | 'REJECTED';
  target_stage?: string;
  remarks?: string;
  rejection_reason?: string;
}

export interface WorkflowTaskItem {
  id: string;
  project_id: string;
  project_code?: string;
  project_title?: string;
  parcel_id?: string;
  khasra_number?: string;
  task_type: string;
  title: string;
  description?: string;
  assigned_role: string;
  assigned_role_name?: string;
  assigned_user_id?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  due_date?: string;
  is_overdue: boolean;
  action_url?: string;
  created_at: string;
}
