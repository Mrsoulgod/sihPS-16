import uuid
from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class AvailableActionOption(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action: str  # APPROVE, REJECT, REQUEST_REWORK, FORWARD, ASSIGN, VERIFY, SUBMIT, RECORD_POSSESSION, PROCESS, REVIEW_PAYMENT, UPDATE_CASE, COMPLETE, RESPOND_REWORK
    label: str
    description: str
    permission: str
    target_status: Optional[str] = None
    requires_remarks: bool = False
    requires_rejection_reason: bool = False
    requires_document: bool = False
    requires_confirmation: bool = True
    is_primary: bool = False
    badge_variant: str = "default"  # default, primary, danger, warning, outline
    target_authority_options: Optional[List[Dict[str, str]]] = None


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str  # task UUID or synthetic ID
    action_type: str  # PROJECT_SCRUTINY, FIELD_VERIFICATION, OBJECTION_REVIEW, COMPENSATION_ASSESSMENT, AWARD_ACTION, POSSESSION_EXECUTION, RANDR_REVIEW, ESCALATION, DOCUMENT_REVIEW, CLARIFICATION
    title: str
    description: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    project_code: Optional[str] = None
    project_title: Optional[str] = None
    record_type: str  # Project, LandParcel, FieldVerification, AffectedFamily, CompensationAssessment, Award, Possession, Document, Escalation
    record_reference: str  # e.g., NH-48-EXP-2024, KH-104/2, AF-2024-JPR-001, DOC-DPR-01
    workflow_stage: str
    workflow_stage_name: str
    status: str  # PENDING, IN_PROGRESS, REWORK_REQUIRED, FORWARDED, COMPLETED
    priority: str  # CRITICAL, HIGH, NORMAL, LOW
    due_date: Optional[date] = None
    sla_days_remaining: Optional[int] = None
    is_overdue: bool = False
    assigned_role: str
    assigned_role_name: str
    assigned_user_id: Optional[uuid.UUID] = None
    assigned_user_name: Optional[str] = None
    required_action_summary: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    rework_reason: Optional[str] = None
    forwarded_to_role: Optional[str] = None
    forwarded_to_user_name: Optional[str] = None
    primary_action: Optional[AvailableActionOption] = None


class ActionCenterKpis(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    requires_action: int = 0
    due_soon: int = 0
    overdue: int = 0
    high_priority: int = 0
    in_progress: int = 0
    returned_rework: int = 0
    forwarded: int = 0
    completed: int = 0


class ActionCenterSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kpis: ActionCenterKpis
    my_actions: List[ActionItemResponse] = []
    in_progress: List[ActionItemResponse] = []
    returned_rework: List[ActionItemResponse] = []
    forwarded: List[ActionItemResponse] = []
    completed: List[ActionItemResponse] = []
    recent_activity: List[Dict[str, Any]] = []


class RequiredActionDetail(BaseModel):
    what_needs_to_be_done: str
    why_it_is_required: str
    information_or_documents_needed: List[str] = []
    what_happens_after_completion: str
    statutory_reference: Optional[str] = None


class RecordInformationSection(BaseModel):
    record_type: str
    record_reference: str
    title: str
    key_attributes: Dict[str, Any] = {}
    financial_details: Optional[Dict[str, Any]] = None
    geographic_details: Optional[Dict[str, Any]] = None
    beneficiary_details: Optional[Dict[str, Any]] = None


class ActionDocumentItem(BaseModel):
    id: str
    document_name: str
    category: str
    version_number: int
    is_current: bool
    uploaded_by: str
    uploaded_at: datetime
    file_size_bytes: Optional[int] = None
    verification_status: str  # PENDING, ACCEPTED, REJECTED, REWORK
    file_url: Optional[str] = None
    sha256_hash: Optional[str] = None


class ActionRemarkItem(BaseModel):
    id: str
    author_name: str
    author_role: str
    action: str
    remarks: str
    timestamp: datetime


class ActionTimelineEvent(BaseModel):
    stage_name: str
    decision: str
    officer_name: str
    officer_role: str
    remarks: Optional[str] = None
    timestamp: datetime


class ActionWorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_item: ActionItemResponse
    case_summary: Dict[str, Any]
    required_action: RequiredActionDetail
    record_information: RecordInformationSection
    available_actions: List[AvailableActionOption]
    remarks_history: List[ActionRemarkItem] = []
    documents: List[ActionDocumentItem] = []
    workflow_timeline: List[ActionTimelineEvent] = []
    audit_history: List[Dict[str, Any]] = []


class ActionExecuteRequest(BaseModel):
    action: str  # APPROVE, REJECT, REQUEST_REWORK, FORWARD, ASSIGN, VERIFY, SUBMIT, RECORD_POSSESSION, PROCESS, REVIEW_PAYMENT, UPDATE_CASE, COMPLETE, RESPOND_REWORK
    remarks: Optional[str] = None
    rejection_reason: Optional[str] = None
    rework_reason: Optional[str] = None
    rework_items: Optional[List[str]] = None
    target_authority_role: Optional[str] = None
    target_user_id: Optional[uuid.UUID] = None
    due_date: Optional[date] = None
    document_ids: Optional[List[str]] = None
    extra_payload: Optional[Dict[str, Any]] = None


class ActionAssignRequest(BaseModel):
    action_id: str
    target_role: str
    target_user_id: Optional[uuid.UUID] = None
    instructions: str
    priority: str = "NORMAL"
    due_date: Optional[date] = None


class ActionForwardRequest(BaseModel):
    target_role: str
    target_user_id: Optional[uuid.UUID] = None
    forwarding_remarks: str
    supporting_document_ids: Optional[List[str]] = None


class ActionReworkRequest(BaseModel):
    rework_reason: str
    rework_items: List[str] = []
    due_date: Optional[date] = None
    remarks: Optional[str] = None
