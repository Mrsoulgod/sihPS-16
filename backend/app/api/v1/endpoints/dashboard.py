import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.services.dashboard import DashboardService

router = APIRouter()


@router.get("/public-summary")
async def get_public_dashboard_summary(
    state_id: Optional[str] = Query(None, description="Optional state filter"),
    district_id: Optional[str] = Query(None, description="Optional district filter"),
    db: AsyncSession = Depends(get_db),
):
    """
    Public national transparency aggregation endpoint.
    Returns aggregated corridor metrics, state comparisons, and project health
    without exposing any sensitive citizen PII or internal administrative data.
    """
    summary = await DashboardService.get_dashboard_summary(
        db=db,
        current_user=None,
        filter_state_id=state_id,
        filter_district_id=district_id,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": summary.model_dump(),
        "message": "National public transparency summary retrieved successfully.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-pub-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get("/summary")
async def get_dashboard_summary(
    state_id: Optional[str] = Query(None, description="Optional state filter for national officers"),
    district_id: Optional[str] = Query(None, description="Optional district filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve authoritative aggregated dashboard metrics, state comparisons,
    attention items, recent activities, and role-tailored quick actions.
    Automatically scopes data to user's statutory role and jurisdiction.
    """
    summary = await DashboardService.get_dashboard_summary(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
        filter_district_id=district_id,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": summary.model_dump(),
        "message": f"Dashboard summary retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-{uuid.uuid4().hex[:8]}",
        },
    }

