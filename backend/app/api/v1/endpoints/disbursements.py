import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, get_optional_user, require_roles
from app.models.enums import RoleCode
from app.models.user import User
from app.schemas.disbursement import (
    DisbursementInitiateBatch,
    DisbursementProcessSimulationRequest,
)
from app.services.disbursement_service import DisbursementService

router = APIRouter()


@router.get("", response_model=dict, summary="List compensation disbursements (PFMS-Compatible)")
async def list_disbursements(
    project_id: Optional[uuid.UUID] = Query(None, description="Filter by acquisition project ID"),
    award_id: Optional[uuid.UUID] = Query(None, description="Filter by award ID"),
    payment_status: Optional[str] = Query(None, description="Filter by status (PENDING, PROCESSING, DISBURSED, FAILED, ON_HOLD)"),
    search: Optional[str] = Query(None, description="Search by batch, UTR, owner, or award"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve list of compensation disbursements under the PFMS-compatible simulated workflow."""
    res = await DisbursementService.list_disbursements(
        db=db,
        current_user=current_user,
        project_id=project_id,
        award_id=award_id,
        payment_status=payment_status,
        search=search,
        page=page,
        page_size=page_size,
    )
    return {
        "success": True,
        "data": res["items"],
        "metadata": {"pagination": res["pagination"]},
        "message": "Disbursement transactions retrieved successfully.",
    }


@router.get("/{disbursement_id}", summary="Get disbursement transaction detail")
async def get_disbursement_detail(
    disbursement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve 360° detail for a single disbursement transaction with masked PII."""
    detail = await DisbursementService.get_disbursement_detail(
        db=db,
        disbursement_id=disbursement_id,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": detail,
        "message": "Disbursement details retrieved successfully.",
    }


@router.post("/initiate-batch", status_code=status.HTTP_201_CREATED, summary="Initiate PFMS-compatible payment batch")
async def initiate_disbursement_batch(
    payload: DisbursementInitiateBatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Initiate a PFMS-compatible simulated DBT batch for beneficiaries under an award."""
    disbs = await DisbursementService.initiate_batch(
        db=db,
        data=payload,
        current_user=current_user,
    )
    return {
        "success": True,
        "data": {
            "created_count": len(disbs),
            "batch_reference": disbs[0].pfms_batch_reference if disbs else "EMPTY",
            "workflow": "PFMS-Compatible / Simulated Payment Workflow",
        },
        "message": f"Successfully initiated payment batch with {len(disbs)} beneficiary records.",
    }


@router.post("/{disbursement_id}/process", summary="Simulate PFMS bank DBT settlement")
async def process_disbursement_simulation(
    disbursement_id: uuid.UUID,
    payload: DisbursementProcessSimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value])),
):
    """Simulate PFMS bank response (Credit confirmation with UTR or failure reason)."""
    disb = await DisbursementService.process_simulation(
        db=db,
        disbursement_id=disbursement_id,
        target_status=payload.target_status,
        current_user=current_user,
        bank_utr_number=payload.bank_utr_number,
        failure_reason=payload.failure_reason,
    )
    return {
        "success": True,
        "data": {
            "id": disb.id,
            "payment_status": disb.payment_status,
            "bank_utr_number": disb.bank_utr_number,
            "disbursed_at": disb.disbursed_at,
        },
        "message": f"Simulated payment settlement completed: Status is '{disb.payment_status}'.",
    }


@router.get("/summary/{project_or_award_id}", summary="Get financial reconciliation metrics")
async def get_financial_reconciliation(
    project_or_award_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve financial reconciliation metrics (Total Awarded, Disbursed, Remaining, Percentage)."""
    summary = await DisbursementService.get_reconciliation_summary(
        db=db,
        project_or_award_id=project_or_award_id,
    )
    return {
        "success": True,
        "data": summary,
        "message": "Financial reconciliation summary calculated successfully.",
    }
