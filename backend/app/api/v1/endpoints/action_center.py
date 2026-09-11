import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.action_center import (
    ActionCenterSummaryResponse,
    ActionItemResponse,
    ActionWorkspaceResponse,
    ActionExecuteRequest,
    ActionAssignRequest,
    ActionForwardRequest,
    ActionReworkRequest,
)
from app.services.action_center_service import ActionCenterService

router = APIRouter()


@router.get("/summary", response_model=ActionCenterSummaryResponse)
async def get_action_center_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full Action Centre summary with live KPIs and 5 categorized task queues."""
    return await ActionCenterService.get_action_center_summary(
        db=db,
        current_user=current_user,
    )


@router.get("/actions", response_model=List[ActionItemResponse])
async def list_actions(
    section: Optional[str] = Query(None, description="Queue section: my_actions, in_progress, returned_rework, forwarded, completed"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by task status"),
    priority_filter: Optional[str] = Query(None, alias="priority", description="Filter by priority"),
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve filtered action items queue for current user."""
    summary = await ActionCenterService.get_action_center_summary(db=db, current_user=current_user)
    
    if section == "in_progress":
        items = summary.in_progress
    elif section == "returned_rework":
        items = summary.returned_rework
    elif section == "forwarded":
        items = summary.forwarded
    elif section == "completed":
        items = summary.completed
    else:
        items = summary.my_actions

    if status_filter:
        items = [i for i in items if i.status.upper() == status_filter.upper()]
    if priority_filter:
        items = [i for i in items if i.priority.upper() == priority_filter.upper()]
    if project_id:
        items = [i for i in items if i.project_id == project_id]

    return items


@router.get("/actions/{action_id}", response_model=ActionWorkspaceResponse)
async def get_action_workspace(
    action_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve 360 Action Workspace with required actions, record details, dynamic buttons, and audit."""
    return await ActionCenterService.get_action_workspace(
        db=db,
        action_id=action_id,
        current_user=current_user,
    )


@router.post("/actions/{action_id}/execute", response_model=ActionItemResponse)
async def execute_action(
    action_id: str,
    request: ActionExecuteRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute authorized operational workflow transition in the database."""
    return await ActionCenterService.execute_action(
        db=db,
        action_id=action_id,
        current_user=current_user,
        request=request,
    )


@router.post("/actions/assign", response_model=ActionItemResponse)
async def assign_action(
    request: ActionAssignRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign/delegate a task to subordinate officer with statutory SLA."""
    return await ActionCenterService.assign_action(
        db=db,
        current_user=current_user,
        request=request,
    )


@router.post("/actions/{action_id}/forward", response_model=ActionItemResponse)
async def forward_action(
    action_id: str,
    request: ActionForwardRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Forward task to next authority (Agency -> District -> State -> Central)."""
    exec_req = ActionExecuteRequest(
        action="FORWARD",
        remarks=request.forwarding_remarks,
        target_authority_role=request.target_role,
        target_user_id=request.target_user_id,
        document_ids=request.supporting_document_ids,
    )
    return await ActionCenterService.execute_action(
        db=db,
        action_id=action_id,
        current_user=current_user,
        request=exec_req,
    )


@router.post("/actions/{action_id}/rework", response_model=ActionItemResponse)
async def rework_action(
    action_id: str,
    request: ActionReworkRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return task for rework with explicit reason and correction items."""
    exec_req = ActionExecuteRequest(
        action="REQUEST_REWORK",
        rework_reason=request.rework_reason,
        rework_items=request.rework_items,
        due_date=request.due_date,
        remarks=request.remarks,
    )
    return await ActionCenterService.execute_action(
        db=db,
        action_id=action_id,
        current_user=current_user,
        request=exec_req,
    )
