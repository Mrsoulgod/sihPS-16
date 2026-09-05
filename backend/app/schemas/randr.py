import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Scheme Progress KPIs
# ---------------------------------------------------------------------------
class SchemeProgressKpis(BaseModel):
    total_affected_families: int = 0
    eligible_families: int = 0
    approved_families: int = 0
    allocated_families: int = 0
    completed_families: int = 0
    completion_percent: float = 0.0


# ---------------------------------------------------------------------------
# R&R Scheme Schemas
# ---------------------------------------------------------------------------
class RAndRSchemeBase(BaseModel):
    project_id: uuid.UUID
    scheme_title: str = Field(..., max_length=200)
    scheme_type: str = Field("RESETTLEMENT_COLONY", max_length=50)
    resettlement_site_name: str = Field(..., max_length=200)
    total_plots_planned: int = 0
    sanctioned_budget_cr: Decimal = Decimal("0.0")
    target_completion_date: Optional[date] = None
    remarks: Optional[str] = None


class RAndRSchemeCreate(RAndRSchemeBase):
    scheme_reference: Optional[str] = None


class RAndRSchemeUpdate(BaseModel):
    scheme_title: Optional[str] = None
    scheme_type: Optional[str] = None
    resettlement_site_name: Optional[str] = None
    total_plots_planned: Optional[int] = None
    sanctioned_budget_cr: Optional[Decimal] = None
    spent_budget_cr: Optional[Decimal] = None
    status: Optional[str] = None
    target_completion_date: Optional[date] = None
    remarks: Optional[str] = None


class RAndRSchemeStatusUpdate(BaseModel):
    status: str = Field(..., description="DRAFT, UNDER_REVIEW, APPROVED, ACTIVE, COMPLETED, ON_HOLD, CANCELLED")
    remarks: Optional[str] = None


class RAndRSchemeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    project_code: Optional[str] = None
    project_title: Optional[str] = None
    scheme_reference: Optional[str] = None
    scheme_title: str
    scheme_type: str
    resettlement_site_name: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    total_plots_planned: int
    total_plots_allotted: int
    sanctioned_budget_cr: Decimal
    spent_budget_cr: Decimal
    status: str
    target_completion_date: Optional[date] = None
    total_families_count: int = 0
    eligible_families_count: int = 0
    assisted_families_count: int = 0
    progress_percent: float = 0.0
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Acquisition Linkage Trace
# ---------------------------------------------------------------------------
class AcquisitionTraceLinkage(BaseModel):
    project_id: uuid.UUID
    project_code: str
    project_title: str
    parcel_id: Optional[uuid.UUID] = None
    khasra_number: Optional[str] = None
    khata_number: Optional[str] = None
    parcel_area_sqm: Optional[Decimal] = None
    parcel_status: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None
    owner_name: Optional[str] = None
    compensation_id: Optional[uuid.UUID] = None
    compensation_reference: Optional[str] = None
    compensation_total_inr: Optional[Decimal] = None
    compensation_status: Optional[str] = None
    award_id: Optional[uuid.UUID] = None
    award_number: Optional[str] = None
    award_status: Optional[str] = None
    disbursement_id: Optional[uuid.UUID] = None
    disbursement_reference: Optional[str] = None
    disbursement_status: Optional[str] = None
    disbursement_amount_inr: Optional[Decimal] = None
    possession_id: Optional[uuid.UUID] = None
    possession_reference: Optional[str] = None
    possession_status: Optional[str] = None


# ---------------------------------------------------------------------------
# R&R Allotment Schemas
# ---------------------------------------------------------------------------
class RAndRAllotmentBase(BaseModel):
    family_id: uuid.UUID
    scheme_id: Optional[uuid.UUID] = None
    allotment_type: str = Field("PLOT", max_length=50)
    entitlement_category: str = Field("HOUSING_RESETTLEMENT", max_length=50)
    asset_identifier: str = Field(..., max_length=100)
    allotment_order_no: str = Field(..., max_length=100)
    allotment_date: date
    delivery_date: Optional[date] = None
    allocated_value_inr: Decimal = Decimal("0.0")
    responsible_authority: Optional[str] = None
    status: str = "ALLOTTED"
    remarks: Optional[str] = None


class RAndRAllotmentCreate(RAndRAllotmentBase):
    allotment_reference: Optional[str] = None


class RAndRAllotmentUpdate(BaseModel):
    status: Optional[str] = None
    delivery_date: Optional[date] = None
    remarks: Optional[str] = None


class RAndRAllotmentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    family_id: uuid.UUID
    family_reference_id: Optional[str] = None
    head_of_family_name: Optional[str] = None
    scheme_id: Optional[uuid.UUID] = None
    scheme_title: Optional[str] = None
    allotment_reference: Optional[str] = None
    entitlement_category: str
    allotment_type: str
    asset_identifier: str
    allotment_order_no: str
    allotment_date: date
    delivery_date: Optional[date] = None
    allocated_value_inr: Decimal
    responsible_authority: Optional[str] = None
    status: str
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Affected Family Schemas
# ---------------------------------------------------------------------------
class AffectedFamilyBase(BaseModel):
    scheme_id: uuid.UUID
    parcel_id: Optional[uuid.UUID] = None
    land_owner_id: Optional[uuid.UUID] = None
    head_of_family_name: str = Field(..., max_length=100)
    village_name: Optional[str] = None
    family_type: str = Field("PAF_AFFECTED_ONLY", max_length=30)
    displacement_category: str = Field("TITLEHOLDER_DISPLACED", max_length=50)
    social_category: str = Field("GEN", max_length=20)
    family_members_count: int = 4
    contact_masked: Optional[str] = None
    entitled_plot_sqyd: Decimal = Decimal("0.0")
    allotted_plot_number: Optional[str] = None
    subsistence_grant_inr: Decimal = Decimal("0.0")
    transportation_allowance_inr: Decimal = Decimal("0.0")
    one_time_resettlement_allowance_inr: Decimal = Decimal("0.0")
    is_grant_disbursed: bool = False
    rehabilitation_status: str = "SURVEYED"


class AffectedFamilyCreate(AffectedFamilyBase):
    family_reference_id: Optional[str] = None
    eligibility_status: str = "PENDING"
    eligibility_category: Optional[str] = None
    eligibility_assessment_date: Optional[date] = None
    assessing_authority: Optional[str] = None
    eligibility_basis: Optional[str] = None
    eligibility_remarks: Optional[str] = None


class AffectedFamilyUpdate(BaseModel):
    head_of_family_name: Optional[str] = None
    village_name: Optional[str] = None
    family_type: Optional[str] = None
    displacement_category: Optional[str] = None
    social_category: Optional[str] = None
    family_members_count: Optional[int] = None
    contact_masked: Optional[str] = None
    entitled_plot_sqyd: Optional[Decimal] = None
    allotted_plot_number: Optional[str] = None
    subsistence_grant_inr: Optional[Decimal] = None
    transportation_allowance_inr: Optional[Decimal] = None
    one_time_resettlement_allowance_inr: Optional[Decimal] = None
    is_grant_disbursed: Optional[bool] = None
    rehabilitation_status: Optional[str] = None


class EligibilityAssessmentUpdate(BaseModel):
    eligibility_status: str = Field(..., description="PENDING, UNDER_REVIEW, ELIGIBLE, INELIGIBLE, DISPUTED, APPROVED")
    eligibility_category: Optional[str] = None
    eligibility_assessment_date: Optional[date] = None
    assessing_authority: Optional[str] = None
    eligibility_basis: Optional[str] = None
    eligibility_remarks: Optional[str] = None


class RehabilitationStatusUpdate(BaseModel):
    rehabilitation_status: str = Field(..., description="SURVEYED, SCHEME_APPROVED, PLOT_ALLOTTED, SETTLED")
    remarks: Optional[str] = None


class AffectedFamilyListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    family_reference_id: Optional[str] = None
    head_of_family_name: str
    family_type: str
    displacement_category: str
    social_category: str
    village_name: Optional[str] = None
    khasra_number: Optional[str] = None
    parcel_id: Optional[uuid.UUID] = None
    project_id: uuid.UUID
    project_code: Optional[str] = None
    project_title: Optional[str] = None
    scheme_id: uuid.UUID
    scheme_title: Optional[str] = None
    scheme_reference: Optional[str] = None
    eligibility_status: str
    eligibility_category: Optional[str] = None
    rehabilitation_status: str
    allotted_plot_number: Optional[str] = None
    subsistence_grant_inr: Decimal
    is_grant_disbursed: bool
    allotments_count: int = 0
    created_at: Optional[datetime] = None


class AffectedFamilyDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    family_reference_id: Optional[str] = None
    scheme_id: uuid.UUID
    scheme_title: Optional[str] = None
    scheme_reference: Optional[str] = None
    resettlement_site_name: Optional[str] = None
    parcel_id: Optional[uuid.UUID] = None
    land_owner_id: Optional[uuid.UUID] = None
    head_of_family_name: str
    village_name: Optional[str] = None
    family_type: str
    displacement_category: str
    social_category: str
    family_members_count: int
    contact_masked: Optional[str] = None

    # Entitlement details
    entitled_plot_sqyd: Decimal
    allotted_plot_number: Optional[str] = None
    subsistence_grant_inr: Decimal
    transportation_allowance_inr: Decimal
    one_time_resettlement_allowance_inr: Decimal
    is_grant_disbursed: bool

    # Configurable Eligibility Details
    eligibility_status: str
    eligibility_category: Optional[str] = None
    eligibility_assessment_date: Optional[date] = None
    assessing_authority: Optional[str] = None
    eligibility_basis: Optional[str] = None
    eligibility_remarks: Optional[str] = None

    # Lifecycle Status
    rehabilitation_status: str

    # 360 Acquisition Traceability Linkage
    acquisition_trace: Optional[AcquisitionTraceLinkage] = None

    # Allotments received
    allotments: List[RAndRAllotmentItem] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# R&R Scheme 360 Detail
# ---------------------------------------------------------------------------
class RAndRSchemeDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    project_code: str
    project_title: str
    scheme_reference: Optional[str] = None
    scheme_title: str
    scheme_type: str
    resettlement_site_name: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    total_plots_planned: int
    total_plots_allotted: int
    sanctioned_budget_cr: Decimal
    spent_budget_cr: Decimal
    status: str
    target_completion_date: Optional[date] = None
    approval_date: Optional[date] = None
    approved_by_user: Optional[str] = None
    remarks: Optional[str] = None

    # Progress KPIs
    kpis: SchemeProgressKpis

    # Covered families
    families: List[AffectedFamilyListItem] = []
    allotments: List[RAndRAllotmentItem] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
