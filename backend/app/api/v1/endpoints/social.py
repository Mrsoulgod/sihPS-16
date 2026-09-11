"""
Phase 11G: R&R / Social Officer API Endpoints
Provides dedicated routes for:
- R&R Case Management Dashboard (/dashboard)
- My R&R Actions (/actions)
- Scoped Affected Families Queue (/families)
- 9-Section Family Case Workspace & Workflow Transitions (/families/{family_id})
- Survey, Eligibility Review, Entitlement Assessment, Allotment, Verification
- Project R&R Monitoring (/projects)
Protected by require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN").
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, require_roles
from app.models.user import User
from app.schemas.randr_social import (
    SocialDashboardSummary,
    SocialRAndRActionItem,
    AffectedFamilyCaseItem,
    FamilyCaseDetailResponse,
    FamilySurveyRequest,
    EligibilityReviewRequest,
    EntitlementAssessmentRequest,
    AllotmentActionRequest,
    AllotmentStatusUpdateRequest,
    VerificationActionRequest,
    ProjectRAndRSummaryItem,
)
from app.services.social_officer_service import SocialOfficerService

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=SocialDashboardSummary,
    summary="Get R&R Case Management Dashboard",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_social_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve 12 statutory KPIs, My R&R Actions, overdue cases, stage queues, and scheme progress."""
    return await SocialOfficerService.get_social_dashboard_summary(db=db, current_user=current_user)


@router.get(
    "/actions",
    response_model=List[SocialRAndRActionItem],
    summary="Get My R&R Actions queue",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_my_actions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve action items assigned to the Social Officer."""
    families = await SocialOfficerService.list_scoped_families(db=db, current_user=current_user)
    return await SocialOfficerService._build_my_actions(families, current_user)


@router.get(
    "/families",
    response_model=List[AffectedFamilyCaseItem],
    summary="List role-scoped Affected Families",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def list_families(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by project"),
    scheme_id: Optional[uuid.UUID] = Query(None, description="Filter by R&R scheme"),
    eligibility_status: Optional[str] = Query(None, description="Filter by eligibility status"),
    case_status: Optional[str] = Query(None, description="Filter by case lifecycle status"),
    search: Optional[str] = Query(None, description="Search by family ref, head of family, or village"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve list of affected families with 12 operational columns."""
    return await SocialOfficerService.list_scoped_families(
        db=db,
        current_user=current_user,
        project_id=project_id,
        scheme_id=scheme_id,
        eligibility_status=eligibility_status,
        case_status=case_status,
        search=search,
    )


@router.get(
    "/families/{family_id}",
    response_model=FamilyCaseDetailResponse,
    summary="Get 9-Section Family Case Workspace",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def get_family_detail(
    family_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve 9-section case detail with trace to project, parcel, compensation, and allotments."""
    return await SocialOfficerService.get_family_case_detail(
        db=db,
        family_id=family_id,
        current_user=current_user,
    )


@router.post(
    "/families/{family_id}/survey",
    response_model=FamilyCaseDetailResponse,
    summary="Submit Family Ground Survey",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def submit_survey(
    family_id: uuid.UUID,
    payload: FamilySurveyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record on-ground family survey observations."""
    return await SocialOfficerService.submit_family_survey(
        db=db,
        family_id=family_id,
        req=payload,
        current_user=current_user,
    )


@router.patch(
    "/families/{family_id}/eligibility",
    response_model=FamilyCaseDetailResponse,
    summary="Record R&R Eligibility Review",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
@router.post(
    "/families/{family_id}/eligibility",
    response_model=FamilyCaseDetailResponse,
    summary="Record R&R Eligibility Review (POST)",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def review_eligibility(
    family_id: uuid.UUID,
    payload: EligibilityReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record statutory eligibility assessment decision (ELIGIBLE, NOT_ELIGIBLE, REWORK_REQUIRED)."""
    return await SocialOfficerService.review_eligibility(
        db=db,
        family_id=family_id,
        req=payload,
        current_user=current_user,
    )


@router.post(
    "/families/{family_id}/entitlements",
    response_model=FamilyCaseDetailResponse,
    summary="Record Entitlement Assessment",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def assess_entitlements(
    family_id: uuid.UUID,
    payload: EntitlementAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record entitled plot area and financial assistance allowances."""
    return await SocialOfficerService.assess_entitlements(
        db=db,
        family_id=family_id,
        req=payload,
        current_user=current_user,
    )


@router.post(
    "/families/{family_id}/allotments",
    response_model=FamilyCaseDetailResponse,
    summary="Generate Allotment Order",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def issue_allotment(
    family_id: uuid.UUID,
    payload: AllotmentActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Issue official plot or grant allotment order."""
    return await SocialOfficerService.process_allotment(
        db=db,
        family_id=family_id,
        req=payload,
        current_user=current_user,
    )


@router.post(
    "/families/{family_id}/verify",
    response_model=FamilyCaseDetailResponse,
    summary="Verify Relocation and Complete Case",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def verify_and_complete(
    family_id: uuid.UUID,
    payload: VerificationActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify physical relocation & grant disbursement and transition case to SETTLED."""
    return await SocialOfficerService.verify_and_complete_case(
        db=db,
        family_id=family_id,
        req=payload,
        current_user=current_user,
    )


@router.get(
    "/projects",
    response_model=List[ProjectRAndRSummaryItem],
    summary="List Projects with R&R KPIs & Possession Dependencies",
    dependencies=[Depends(require_roles("ROLE_SOCIAL_OFFICER", "ROLE_DISTRICT_OFFICER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"))],
)
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List projects with R&R progress and possession blocking dependencies."""
    return await SocialOfficerService.list_scoped_projects(
        db=db,
        current_user=current_user,
    )
