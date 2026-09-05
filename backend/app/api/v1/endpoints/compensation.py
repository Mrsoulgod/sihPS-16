import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.models.compensation import AssetValuation, CompensationAssessment
from app.schemas.compensation import (
    CompensationCalculationRequest,
    CompensationCalculationBreakdown,
    CompensationAssessmentCreate,
    CompensationApprovalRequest,
    AssetValuationCreate,
    AssetValuationItem,
)
from app.services.compensation_service import CompensationService

router = APIRouter()


@router.get("", response_model=dict, summary="List Configurable Compensation Assessments")
async def list_compensation_assessments(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by acquisition project ID"),
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, UNDER_REVIEW, APPROVED, REJECTED)"),
    state_id: Optional[str] = Query(None, description="Filter by state ID"),
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    search: Optional[str] = Query(None, description="Search by khasra, reference, village, project"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of Configurable Compensation Assessments with RBAC jurisdiction scoping."""
    res = await CompensationService.list_assessments(
        db=db,
        current_user=current_user,
        project_id=project_id,
        status=status,
        state_id=state_id,
        district_id=district_id,
        search=search,
        page=page,
        page_size=page_size,
    )
    return {
        "success": True,
        "data": res["items"],
        "metadata": {"pagination": res["pagination"]},
        "message": "Compensation assessments retrieved successfully.",
    }


@router.post("/calculate", summary="Compute Configurable Compensation Assessment trial breakdown")
async def calculate_trial_compensation(
    request: CompensationCalculationRequest,
):
    """
    Transparent trial calculation endpoint for Configurable Compensation Assessment.
    Returns itemized breakdown showing Base Land Value, Land Factors, Assets, Statutory Additional Amounts, and Solatium.
    """
    breakdown = CompensationService.calculate_configurable_breakdown(
        area_sqm=request.area_sqm,
        circle_rate_per_sqm=request.circle_rate_per_sqm,
        multiplier_factor=request.multiplier_factor,
        assets_value_inr=request.assets_value_inr,
        solatium_percent=request.solatium_percent,
        statutory_additional_rate_percent=request.statutory_additional_rate_percent,
        sec11_publication_date=request.sec11_publication_date,
        award_date=request.award_date,
    )
    return {
        "success": True,
        "data": breakdown,
        "message": "Configurable compensation assessment calculated successfully.",
    }


@router.get("/{assessment_id}", summary="Get 360° detail for a compensation assessment")
async def get_compensation_assessment_detail(
    assessment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve full 360° detail for a compensation assessment with transparent breakdown and masked beneficiary data."""
    detail = await CompensationService.get_assessment_detail(
        db=db,
        assessment_id=assessment_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "Compensation assessment details retrieved successfully.",
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create or finalize a compensation assessment")
async def create_compensation_assessment(
    payload: CompensationAssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Record or finalize a Configurable Compensation Assessment for a cadastral parcel."""
    assessment = await CompensationService.create_or_finalize_assessment(
        db=db,
        parcel_id=payload.parcel_id,
        current_user=current_user,
        multiplier_factor=payload.multiplier_factor,
        solatium_percent=payload.solatium_percent,
        statutory_additional_rate_percent=payload.statutory_additional_rate_percent,
        sec11_publication_date=payload.sec11_publication_date,
        award_date=payload.award_date,
        remarks=payload.remarks,
    )
    return {
        "success": True,
        "data": {"id": assessment.id, "assessment_reference": assessment.assessment_reference, "total_compensation_inr": assessment.total_compensation_inr},
        "message": "Compensation assessment successfully created.",
    }


@router.post("/{assessment_id}/approve", summary="CALA statutory approval of compensation assessment")
async def approve_compensation_assessment(
    assessment_id: uuid.UUID,
    payload: CompensationApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Competent Authority (CALA) statutory sign-off and approval of compensation assessment."""
    assessment = await CompensationService.approve_assessment(
        db=db,
        assessment_id=assessment_id,
        current_user=current_user,
        decision=payload.decision,
        remarks=payload.remarks,
    )
    return {
        "success": True,
        "data": {"id": assessment.id, "status": assessment.status, "is_approved_by_cala": assessment.is_approved_by_cala},
        "message": f"Compensation assessment decision '{payload.decision}' successfully recorded.",
    }


@router.post("/{assessment_id}/assets", status_code=status.HTTP_201_CREATED, summary="Add asset valuation item")
async def add_asset_valuation_item(
    assessment_id: uuid.UUID,
    payload: AssetValuationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.FIELD_OFFICER.value, RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Add an itemized asset valuation (structure, tree, borewell) to an assessment."""
    assessment = await db.get(CompensationAssessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    asset = AssetValuation(
        assessment_id=assessment.id,
        asset_category=payload.asset_category,
        description=payload.description,
        quantity=payload.quantity,
        unit=payload.unit,
        unit_rate_inr=payload.unit_rate_inr,
        total_asset_value_inr=payload.total_asset_value_inr,
        depreciation_inr=payload.depreciation_inr,
        net_asset_value_inr=payload.net_asset_value_inr,
    )
    db.add(asset)

    # Recalculate assessment asset total
    assessment.assets_value_inr = assessment.assets_value_inr + payload.net_asset_value_inr
    # Solatium is 100% of (market land + assets)
    solatium = assessment.market_value_land_inr + assessment.assets_value_inr
    assessment.solatium_inr = solatium
    assessment.total_compensation_inr = (
        assessment.market_value_land_inr + assessment.assets_value_inr + assessment.solatium_inr + assessment.additional_market_value_inr
    )

    await db.commit()
    await db.refresh(asset)
    return {
        "success": True,
        "data": {"id": asset.id, "net_asset_value_inr": asset.net_asset_value_inr, "new_total_compensation_inr": assessment.total_compensation_inr},
        "message": "Asset valuation line item added successfully.",
    }
