import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, require_roles
from app.models.user import User
from app.schemas.field import (
    FieldAssignedParcelItem,
    FieldTaskItem,
    FieldVerificationRequest,
    FieldVerificationDetail,
    FieldDashboardSummary,
    FieldChecklistSubmissionRequest,
    FieldVerificationSubmissionResponse,
)
from app.services.field_service import FieldService

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=FieldDashboardSummary,
    summary="Get Field Officer Mobile Dashboard Summary",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_field_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Operational dashboard for the Field Officer / Patwari / Revenue Inspector.
    Delivers:
    - Top Metrics: Assigned Today, Pending, In Progress, Submitted, Overdue
    - My Priority Tasks: Actionable on-ground verification tasks
    - Rework Requests: Issues sent back by CALA for re-inspection
    - Assigned Parcels queue
    - Field Notifications & SLA alerts
    """
    return await FieldService.get_field_dashboard_summary(db, current_user)


@router.get(
    "/tasks",
    response_model=List[FieldTaskItem],
    summary="Get Tasks Assigned to Field Officer",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_assigned_tasks(
    status: Optional[str] = Query(None, description="Filter by status: ASSIGNED, IN_PROGRESS, SUBMITTED, REWORK_REQUIRED, OVERDUE"),
    priority: Optional[str] = Query(None, description="Filter by priority: NORMAL, HIGH, CRITICAL"),
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve survey & ground verification tasks assigned strictly to the authenticated Field Officer.
    """
    return await FieldService.get_assigned_tasks(
        db,
        current_user,
        status=status,
        priority=priority,
        project_id=project_id,
    )


@router.get(
    "/tasks/{task_id}",
    response_model=FieldVerificationDetail,
    summary="Get Field Task Workspace Detail",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_field_task_detail(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch comprehensive field workspace detail including parcel information, official cadastral polygon,
    previous observations, rework notes, and photographic evidence.
    """
    try:
        return await FieldService.get_task_by_id(db, task_id, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tasks/{task_id}/start",
    response_model=FieldTaskItem,
    summary="Start Field Verification Task",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def start_field_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Transition task from ASSIGNED -> IN_PROGRESS, capturing start timestamp and logging audit trail.
    """
    try:
        return await FieldService.start_task(db, task_id, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tasks/{task_id}/verify",
    response_model=FieldVerificationDetail,
    summary="Save Draft or Submit 8-Step Field Verification",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def submit_field_verification_8step(
    task_id: uuid.UUID,
    req: FieldVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save draft ground observations or formally submit completed 8-step verification to District CALA.
    """
    try:
        return await FieldService.submit_verification(db, task_id, req, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tasks/{task_id}/resubmit",
    response_model=FieldVerificationDetail,
    summary="Resubmit Field Verification After Rework",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def resubmit_field_rework(
    task_id: uuid.UUID,
    req: FieldVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Resubmit corrected field observations back to CALA after rework request.
    """
    try:
        return await FieldService.resubmit_rework(db, task_id, req, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/parcels",
    response_model=List[FieldAssignedParcelItem],
    summary="Get All Assigned Parcels for Field Officer",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_parcels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of land parcels assigned to the authenticated Field Officer.
    """
    return await FieldService.get_assigned_parcels(db, current_user)


@router.get(
    "/assigned-parcels",
    response_model=List[FieldAssignedParcelItem],
    summary="Get Assigned Parcels (Alias)",
)
async def get_assigned_parcels_alias(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Legacy compatibility alias for /parcels.
    """
    return await FieldService.get_assigned_parcels(db, current_user)


@router.get(
    "/parcels/{parcel_id}",
    response_model=FieldAssignedParcelItem,
    summary="Get Assigned Parcel Detail",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_parcel_detail(
    parcel_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve specific assigned parcel details for field view.
    """
    try:
        return await FieldService.get_parcel_detail(db, parcel_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
