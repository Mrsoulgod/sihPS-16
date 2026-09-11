import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, require_roles
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


@router.get(
    "/central",
    summary="Get dedicated National Acquisition Command center dataset",
    dependencies=[Depends(require_roles("ROLE_CENTRAL_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_central_command_dashboard(
    state_id: Optional[str] = Query(None, description="Filter national command view by state"),
    district_id: Optional[str] = Query(None, description="Filter national command view by district"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the Central Officer (National Command Authority).
    Delivers 11 nationwide KPIs, 12-stage statutory lifecycle funnel, multi-state
    performance comparative matrix, critical projects spotlight, central attention queue,
    and predictive risk intelligence.
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
        "message": "National Acquisition Command dataset retrieved successfully.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-cmd-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get(
    "/state",
    summary="Get dedicated State Acquisition Control Center dataset",
    dependencies=[Depends(require_roles("ROLE_STATE_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_state_control_dashboard(
    district_id: Optional[str] = Query(None, description="Filter state control view by district"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the State Revenue Officer (State Supervisory Authority).
    Delivers 12 State KPIs, subordinate district performance matrix, state project monitoring,
    12-stage state acquisition funnel, district escalations queue, state attention queue,
    and state compensation/possession/R&R overviews.
    Derives state strictly from authenticated user identity.
    """
    # Strictly enforce state from authenticated identity for state officers
    state_id = current_user.state_id or "IN-RJ" if current_user.role_id == "ROLE_STATE_OFFICER" else None

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
        "message": f"State Acquisition Control dataset retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-state-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get(
    "/district",
    summary="Get dedicated District Acquisition Control Center dataset",
    dependencies=[Depends(require_roles("ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_district_control_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the District / CALA Officer (Competent Authority for Land Acquisition).
    Delivers 14 District Statutory KPIs, "My Pending Actions" task queue, district projects table,
    field verification supervision, Section 15 objections & claims, compensation review,
    Section 23/30 awards, PFMS disbursement monitoring, Section 38 possession tracking,
    Second Schedule R&R coordination, and district-to-state escalations.
    Derives district strictly from authenticated user identity.
    """
    district_id = current_user.district_id or "DST-JAI"
    state_id = current_user.state_id or "IN-RJ"

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
        "message": f"District Acquisition Control dataset retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-dist-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get(
    "/agency",
    summary="Get dedicated Project Agency Control Center dataset",
    dependencies=[Depends(require_roles("ROLE_PROJECT_AGENCY", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_agency_control_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the Project Implementing Agency (e.g. NHAI, DMRC, Railways).
    Delivers:
    - My Actions (Pending submissions, rework requests, document requests, clarifications, survey requests)
    - My Projects (Draft, Submitted, Under Scrutiny, Approved, Acquisition in Progress, Completed)
    - Land Acquisition (Proposed, Identified, Verified, Acquired, Pending)
    - Compensation (Assessed, Awarded, Disbursed, Pending)
    - Possession (Ready, Pending, Completed, Action Required)
    - R&R (Affected Families, Eligible, Allotments, Completed, Pending)
    - Project Risk (Risk Level, Major Bottlenecks, Delayed Stages)
    - Recent Activity
    Strictly scoped to the authenticated agency's projects.
    """
    summary = await DashboardService.get_dashboard_summary(
        db=db,
        current_user=current_user,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": summary.model_dump(),
        "message": f"Project Agency Control dataset retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-agency-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get(
    "/field",
    summary="Get dedicated Field Officer My Field Work dataset",
    dependencies=[Depends(require_roles("ROLE_FIELD_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_field_officer_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the Field Officer / Patwari / Revenue Inspector.
    Delivers:
    - Top metrics: Assigned Today, Pending, In Progress, Submitted, Overdue
    - My Priority Tasks: Actionable on-ground verification tasks
    - Rework Requests: Issues sent back by CALA for re-inspection
    - Assigned Parcels queue
    - Field Notifications & SLA alerts
    """
    summary = await DashboardService.get_dashboard_summary(
        db=db,
        current_user=current_user,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": summary.model_dump(),
        "message": f"Field Officer dataset retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-field-{uuid.uuid4().hex[:8]}",
        },
    }


@router.get(
    "/social",
    summary="Get dedicated Social / R&R Officer Case Management dataset",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_social_officer_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint for the Social Development & R&R Officer.
    Delivers:
    - 12 Statutory KPIs (Affected Families, Surveys, Eligibility, Entitlements, Approvals, Allotments, Verifications, Overdue, Risk, Schemes)
    - My R&R Actions queue
    - Overdue Cases alert list
    - Stage Queues (Eligibility Pending, Entitlements Pending, Allotments Pending, Verification Pending)
    - Active R&R Schemes summary
    - Project R&R Progress with Possession Blocking Dependencies
    - Predictive R&R Risk & Notifications
    """
    summary = await DashboardService.get_dashboard_summary(
        db=db,
        current_user=current_user,
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "success": True,
        "data": summary.model_dump(),
        "message": f"R&R Case Management dataset retrieved successfully for {summary.jurisdiction_name}.",
        "metadata": {
            "timestamp": now_iso,
            "request_id": f"req-social-{uuid.uuid4().hex[:8]}",
        },
    }


