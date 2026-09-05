import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class DisbursementInitiateBatch(BaseModel):
    award_id: uuid.UUID
    parcel_ids: Optional[List[uuid.UUID]] = Field(default=None, description="Optional specific parcels; defaults to all parcels under the award")
    pfms_batch_reference: Optional[str] = None
    remarks: Optional[str] = "PFMS-compatible payment batch initiated for beneficiary direct benefit transfer."


class DisbursementProcessSimulationRequest(BaseModel):
    """Simulate PFMS bank response (Credit or Failure)."""
    target_status: str = Field(default="DISBURSED", description="DISBURSED or FAILED")
    bank_utr_number: Optional[str] = None
    failure_reason: Optional[str] = None


class DisbursementListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    disbursement_reference: str
    pfms_batch_reference: str
    award_id: uuid.UUID
    award_number: str
    project_id: uuid.UUID
    project_title: str
    parcel_id: uuid.UUID
    khasra_number: str
    owner_id: uuid.UUID
    owner_name: str
    masked_bank_account: str
    masked_ifsc: str
    amount_inr: Decimal
    payment_method: str = "PFMS_DBT"
    payment_status: str
    bank_utr_number: Optional[str] = None
    disbursed_at: Optional[datetime] = None
    created_at: datetime


class DisbursementDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    disbursement_reference: str
    pfms_batch_reference: str
    payment_workflow_label: str = "PFMS-Compatible / Simulated Payment Workflow"
    award_id: uuid.UUID
    award_number: str
    award_amount_inr: Decimal
    project_id: uuid.UUID
    project_title: str
    project_code: str
    district_name: str
    state_name: str
    parcel_id: uuid.UUID
    khasra_number: str
    owner_id: uuid.UUID
    owner_name: str
    relative_name: Optional[str] = None
    masked_bank_account: str
    masked_ifsc: str
    bank_name: str
    social_category: str
    is_kyc_verified: bool
    amount_inr: Decimal
    payment_method: str
    payment_status: str
    bank_utr_number: Optional[str] = None
    disbursed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    remarks: Optional[str] = None
    processed_by_user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class FinancialReconciliationSummary(BaseModel):
    """Authoritative project or award level financial reconciliation."""
    reference_id: uuid.UUID
    reference_title: str
    total_assessed_inr: Decimal
    total_awarded_inr: Decimal
    total_disbursed_inr: Decimal
    outstanding_inr: Decimal
    disbursement_percent: Decimal
    total_beneficiaries_count: int
    disbursed_beneficiaries_count: int
    pending_beneficiaries_count: int
    reconciliation_status: str = "BALANCED"
