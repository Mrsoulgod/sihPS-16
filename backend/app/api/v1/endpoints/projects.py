import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.project import ProjectListItem, ProjectDetailResponse
from app.services.project_service import ProjectService

router = APIRouter()


@router.get("", response_model=List[ProjectListItem])
async def list_projects(
    state_id: Optional[str] = Query(None, description="Filter by State ID"),
    stage: Optional[str] = Query(None, description="Filter by acquisition stage"),
    search: Optional[str] = Query(None, description="Search project code or title"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all infrastructure projects scoped by authenticated user's jurisdiction."""
    return await ProjectService.list_projects(
        db=db,
        current_user=current_user,
        state_id=state_id,
        stage=stage,
        search=search,
    )


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project_detail(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve 360° detail for a specific project."""
    return await ProjectService.get_project_detail(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )
