import uuid
from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class StageDefinition(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stage_code: str
    stage_name: str
    sequence_order: int
    sla_days: int
    statutory_reference: str
    primary_role: str
    description: str
    can_reject: bool = False
    rejection_target: Optional[str] = None
    required_documents: List[str] = []


class ProjectStageItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    stage_code: str
    stage_name: str
    sequence_order: int
    status: str  # PENDING, IN_PROGRESS, COMPLETED, BLOCKED, REJECTED
    compliance_status: str  # ON_TRACK, DUE_SOON, OVERDUE, COMPLETED
    sla_deadline_days: int
    started_at: Optional[datetime] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    days_remaining: Optional[int] = None
    is_overdue: bool = False
    assigned_role: Optional[str] = None
    assigned_role_name: Optional[str] = None
    assigned_user_id: Optional[uuid.UUID] = None
    assigned_user_name: Optional[str] = None
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None
    required_documents: Optional[List[str]] = None


class TransitionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_stage: str
    to_stage: str
    decision: str
    remarks: Optional[str] = None
    triggered_by_user_id: uuid.UUID
    triggered_by_name: Optional[str] = None
    triggered_by_role: Optional[str] = None
    created_at: datetime


class ProjectWorkflowTimelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: uuid.UUID
    project_code: str
    project_title: str
    current_stage: str
    overall_progress_percent: float
    is_current_stage_overdue: bool
    stages: List[ProjectStageItem]
    transition_history: List[TransitionHistoryItem]
    can_current_user_transition: bool
    allowed_transitions: List[Dict[str, Any]]


class StageTransitionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED
    target_stage: Optional[str] = None
    remarks: Optional[str] = None
    rejection_reason: Optional[str] = None


class WorkflowTaskItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    project_code: Optional[str] = None
    project_title: Optional[str] = None
    parcel_id: Optional[uuid.UUID] = None
    khasra_number: Optional[str] = None
    task_type: str
    title: str
    description: Optional[str] = None
    assigned_role: str
    assigned_role_name: Optional[str] = None
    assigned_user_id: Optional[uuid.UUID] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    is_overdue: bool = False
    action_url: Optional[str] = None
    created_at: datetime


class WorkflowTaskActionRequest(BaseModel):
    action: str  # COMPLETE, REJECT, IN_REVIEW
    remarks: Optional[str] = None
