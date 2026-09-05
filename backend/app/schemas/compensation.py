import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AssetValuationBase(BaseModel):
    asset_category: str = Field(..., description="Category: RESIDENTIAL_STRUCTURE, COMMERCIAL_STRUCTURE, FRUIT_BEARING_TREE, TIMBER_TREE, TUBEWELL_PUMP")
    description: str
    quantity: Decimal = Field(..., gt=0)
    unit: str = Field(..., description="e.g. SQ_FT, UNITS, TREES")
    unit_rate_inr: Decimal = Field(..., ge=0)
    total_asset_value_inr: Decimal = Field(..., ge=0)
    depreciation_inr: Decimal = Field(default=Decimal("0.0"), ge=0)
    net_asset_value_inr: Decimal = Field(..., ge=0)


class AssetValuationCreate(AssetValuationBase):
    pass


class AssetValuationItem(AssetValuationBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    assessment_id: uuid.UUID


class CompensationCalculationRequest(BaseModel):
    """Input parameters for Configurable Compensation Assessment trial or final calculation."""
    parcel_id: Optional[uuid.UUID] = None
    area_sqm: Decimal = Field(..., gt=0, description="Acquired land area in square meters")
    circle_rate_per_sqm: Decimal = Field(..., gt=0, description="Base government circle rate per sqm")
    multiplier_factor: Decimal = Field(default=Decimal("1.25"), ge=Decimal("1.00"), le=Decimal("2.00"), description="Applicable rural/distance factor (1.00x - 2.00x)")
    assets_value_inr: Decimal = Field(default=Decimal("0.0"), ge=0, description="Net assessed value of assets/structures/trees")
    solatium_percent: Decimal = Field(default=Decimal("100.0"), ge=0, description="Applicable Solatium percentage (typically 100%)")
    statutory_additional_rate_percent: Decimal = Field(default=Decimal("12.0"), ge=0, description="Statutory condition-based additional rate p.a. (typically 12%)")
    sec11_publication_date: Optional[date] = Field(default=None, description="Preliminary statutory notification date")
    award_date: Optional[date] = Field(default=None, description="Projected or actual award declaration date")
    remarks: Optional[str] = None


class StatutoryComponentDetail(BaseModel):
    component_name: str
    statutory_basis: str
    amount_inr: Decimal
    percentage_or_rate: Optional[Decimal] = None
    formula_description: str


class CompensationCalculationBreakdown(BaseModel):
    """Transparent calculation breakdown for Configurable Compensation Assessment."""
    area_sqm: Decimal
    circle_rate_per_sqm: Decimal
    base_land_value_inr: Decimal
    multiplier_factor: Decimal
    market_value_land_inr: Decimal
    assets_value_inr: Decimal
    solatium_rate_percent: Decimal
    solatium_inr: Decimal
    statutory_additional_rate_percent: Decimal
    statutory_period_days: int
    additional_market_value_inr: Decimal
    total_compensation_inr: Decimal
    components: List[StatutoryComponentDetail] = []
    calculation_summary: str = "Configurable Compensation Assessment computed with applicable statutory conditions."


class CompensationAssessmentCreate(BaseModel):
    parcel_id: uuid.UUID
    multiplier_factor: Optional[Decimal] = Field(default=Decimal("1.25"), ge=Decimal("1.00"), le=Decimal("2.00"))
    solatium_percent: Optional[Decimal] = Decimal("100.0")
    statutory_additional_rate_percent: Optional[Decimal] = Decimal("12.0")
    sec11_publication_date: Optional[date] = None
    award_date: Optional[date] = None
    remarks: Optional[str] = None


class CompensationApprovalRequest(BaseModel):
    decision: str = Field(default="APPROVED", description="APPROVED or REJECTED")
    remarks: Optional[str] = None


class MaskedOwnerItem(BaseModel):
    id: uuid.UUID
    full_name: str
    relative_name: Optional[str] = None
    ownership_share_percent: Decimal
    masked_bank_account: str
    masked_bank_ifsc: str
    is_kyc_verified: bool


class CompensationAssessmentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    assessment_reference: str
    project_id: uuid.UUID
    project_title: str
    parcel_id: uuid.UUID
    khasra_number: str
    village_name: str
    district_name: str
    state_name: str
    owner_names: List[str]
    acquired_area_sqm: Decimal
    total_compensation_inr: Decimal
    status: str
    is_approved_by_cala: bool
    approval_date: Optional[datetime] = None
    assessing_officer_name: Optional[str] = None
    created_at: datetime


class CompensationAssessmentDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    assessment_reference: str
    status: str
    project_id: uuid.UUID
    project_code: str
    project_title: str
    parcel_id: uuid.UUID
    khasra_number: str
    khata_number: str
    village_name: str
    tehsil_name: Optional[str] = None
    district_name: str
    state_name: str
    land_type: str
    acquired_area_sqm: Decimal
    circle_rate_per_sqm: Decimal
    multiplier_factor: Decimal
    base_land_value_inr: Decimal
    market_value_land_inr: Decimal
    assets_value_inr: Decimal
    solatium_inr: Decimal
    additional_market_value_inr: Decimal
    total_compensation_inr: Decimal
    breakdown: CompensationCalculationBreakdown
    asset_valuations: List[AssetValuationItem] = []
    owners: List[MaskedOwnerItem] = []
    is_approved_by_cala: bool
    approval_date: Optional[datetime] = None
    assessing_officer_name: Optional[str] = None
    award_id: Optional[uuid.UUID] = None
    award_number: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
