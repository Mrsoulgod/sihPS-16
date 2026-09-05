import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_optional_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/overview", summary="Get national analytics overview, KPIs, and funnel")
async def get_analytics_overview(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve authoritative aggregated national analytics, 7-stage acquisition funnel, and data quality summary."""
    res = await AnalyticsService.get_national_overview(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
        filter_district_id=district_id,
    )
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "National analytics overview retrieved successfully.",
    }


@router.get("/states", summary="Get state-wise acquisition analytics")
async def get_state_analytics(
    state_id: Optional[str] = Query(None, description="Filter by specific state ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve comparative state performance matrix, land progress, and financial metrics."""
    res = await AnalyticsService.get_state_analytics(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
    )
    return {
        "success": True,
        "data": [item.model_dump() for item in res],
        "message": "State analytics retrieved successfully.",
    }


@router.get("/districts", summary="Get district-wise acquisition analytics")
async def get_district_analytics(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve district drill-down acquisition metrics, land, and R&R progress."""
    res = await AnalyticsService.get_district_analytics(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
        filter_district_id=district_id,
    )
    return {
        "success": True,
        "data": [item.model_dump() for item in res],
        "message": "District analytics retrieved successfully.",
    }


@router.get("/time-series", summary="Get time-series historical progression analytics")
async def get_time_series_analytics(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve time-series acquisition, disbursement, and possession progression."""
    res = await AnalyticsService.get_time_series(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
    )
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "Time-series analytics retrieved successfully.",
    }


@router.get("/bottlenecks", summary="Get operational bottlenecks and high-risk projects")
async def get_bottlenecks(
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve attention projects with statutory delay reasons and overdue workflow tasks."""
    res = await AnalyticsService.get_bottlenecks(
        db=db,
        current_user=current_user,
        filter_state_id=state_id,
    )
    return {
        "success": True,
        "data": [item.model_dump() for item in res],
        "message": "Bottlenecks retrieved successfully.",
    }


@router.get("/data-quality", summary="Get statutory data consistency and reconciliation audit")
async def get_data_quality_report(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Perform automated data reconciliation audits across land, financial, possession, and R&R records."""
    res = await AnalyticsService.get_data_quality_report(db=db)
    return {
        "success": True,
        "data": res.model_dump(),
        "message": "Data quality audit report generated successfully.",
    }
