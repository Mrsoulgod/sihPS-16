import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.workflow import (
    StageDefinition,
    ProjectWorkflowTimelineResponse,
    StageTransitionRequest,
    WorkflowTaskItem,
    WorkflowTaskActionRequest,
)
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()


@router.get("/stages", response_model=List[StageDefinition])
async def get_statutory_stages():
    """Retrieve all 12 configurable statutory acquisition stages with SLA rules."""
    return WorkflowEngine.get_stage_definitions()


@router.get("/projects/{project_id}/timeline", response_model=ProjectWorkflowTimelineResponse)
async def get_project_workflow_timeline(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve 12-stage workflow visual timeline, SLA deadlines, and transition history for a project."""
    return await WorkflowEngine.get_project_workflow_timeline(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )


@router.post("/projects/{project_id}/transition", response_model=ProjectWorkflowTimelineResponse)
async def transition_project_stage(
    project_id: uuid.UUID,
    request: StageTransitionRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute authorized stage transition (Approval or Rejection) with RBAC validation and audit logging."""
    return await WorkflowEngine.transition_stage(
        db=db,
        project_id=project_id,
        current_user=current_user,
        decision=request.decision,
        remarks=request.remarks,
        rejection_reason=request.rejection_reason,
    )


@router.get("/tasks", response_model=List[WorkflowTaskItem])
async def get_workflow_tasks(
    project_id: Optional[uuid.UUID] = Query(None, description="Optional project filter"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve pending workflow action items scoped to logged-in user's role and jurisdiction."""
    return await WorkflowEngine.get_workflow_tasks(
        db=db,
        current_user=current_user,
        project_id=project_id,
    )


@router.post("/tasks/{task_id}/action", response_model=WorkflowTaskItem)
async def action_workflow_task(
    task_id: uuid.UUID,
    request: WorkflowTaskActionRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Action an assigned workflow task (Complete, Reject, In Review)."""
    return await WorkflowEngine.action_workflow_task(
        db=db,
        task_id=task_id,
        current_user=current_user,
        action=request.action,
        remarks=request.remarks,
    )
