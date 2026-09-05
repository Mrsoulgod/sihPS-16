import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_optional_user
from app.models.user import User
from app.services.risk_service import RiskService

router = APIRouter()


@router.get("/overview", summary="Get portfolio predictive risk overview and distribution")
async def get_risk_overview(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve portfolio-wide risk score distribution, top high-risk projects, and factor benchmarks."""
    res = await RiskService.get_risk_overview(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
        filter_district_id=district_id,
    )
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "Risk overview retrieved successfully.",
    }


@router.get("/projects/{project_id}", summary="Get project-specific 5-factor risk intelligence")
async def get_project_risk_detail(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve comprehensive 5-factor risk intelligence breakdown, drivers, and recommendations for a single project."""
    res = await RiskService.get_project_risk_detail(
        db=db,
        project_id=project_id,
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found.",
        )
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "Project risk detail retrieved successfully.",
    }
