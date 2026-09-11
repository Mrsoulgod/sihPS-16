import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user
from app.models.user import User
from app.schemas.project import (
    ProjectListItem,
    ProjectDetailResponse,
    ProjectProposalCreate,
    ProjectDraftUpdate,
    ProjectSubmitRequest,
    ProjectResubmitRequest,
    SurveyRequestCreate,
)
from app.services.project_service import ProjectService

router = APIRouter()


@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_project_proposal(
    req: ProjectProposalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Originate a new infrastructure project proposal (DRAFT or SUBMITTED).
    Automatically attaches authenticated user, agency, created_by, and sets initial workflow stage.
    """
    return await ProjectService.create_project_proposal(
        db=db,
        req=req,
        current_user=current_user,
    )


@router.get("", response_model=List[ProjectListItem])
async def list_projects(
    state_id: Optional[str] = Query(None, description="Filter by State ID"),
    stage: Optional[str] = Query(None, description="Filter by acquisition stage"),
    status: Optional[str] = Query(None, description="Filter by proposal/project status (DRAFT, SUBMITTED, UNDER_SCRUTINY, etc.)"),
    search: Optional[str] = Query(None, description="Search project code or title"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve all infrastructure projects scoped by authenticated user's jurisdiction."""
    return await ProjectService.list_projects(
        db=db,
        current_user=current_user,
        state_id=state_id,
        stage=stage,
        status_filter=status,
        search=search,
    )


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project_detail(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve 360° detail for a specific project."""
    return await ProjectService.get_project_detail(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )


@router.put("/{project_id}", response_model=ProjectDetailResponse)
async def update_project_draft(
    project_id: uuid.UUID,
    req: ProjectDraftUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update details of a project in DRAFT or REWORK_REQUESTED status."""
    return await ProjectService.update_project_draft(
        db=db,
        project_id=project_id,
        req=req,
        current_user=current_user,
    )


@router.post("/{project_id}/submit", response_model=ProjectDetailResponse)
async def submit_project_proposal(
    project_id: uuid.UUID,
    req: ProjectSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Formally submit a DRAFT project proposal for District / CALA scrutiny."""
    return await ProjectService.submit_project_proposal(
        db=db,
        project_id=project_id,
        req=req,
        current_user=current_user,
    )


@router.post("/{project_id}/resubmit", response_model=ProjectDetailResponse)
async def resubmit_project_proposal(
    project_id: uuid.UUID,
    req: ProjectResubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resubmit a project proposal after completing requested rework from District / CALA."""
    return await ProjectService.resubmit_project_proposal(
        db=db,
        project_id=project_id,
        req=req,
        current_user=current_user,
    )


@router.post("/{project_id}/survey-requests")
async def create_survey_request(
    project_id: uuid.UUID,
    req: SurveyRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Project Agency requests a ground/boundary land survey from the District CALA authority."""
    req.project_id = project_id
    result = await ProjectService.create_survey_request(
        db=db,
        req=req,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": result,
        "task_id": result.get("task_id"),
        "message": result.get("message", "Survey request submitted successfully."),
    }
