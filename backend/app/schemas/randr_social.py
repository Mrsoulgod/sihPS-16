"""
Phase 11G: R&R / Social Officer Schemas
Defines request and response schemas for:
- 12 Statutory R&R KPIs
- My R&R Actions queue
- Role-scoped Affected Family Cases (12 operational columns)
- 9-Section Comprehensive Case Workspace
- Survey, Eligibility, Entitlement, Allotment, Verification workflows
- Project-level R&R Monitoring & Possession Blocking Dependencies
"""
import uuid
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# 1. 12 Statutory R&R KPIs
# ---------------------------------------------------------------------------
class SocialRAndRKpiSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    affected_families_count: int = Field(default=0, description="1. Total Affected Families in scope")
    survey_pending_count: int = Field(default=0, description="2. Families awaiting ground survey")
    eligibility_pending_count: int = Field(default=0, description="3. Families awaiting eligibility review")
    entitlement_pending_count: int = Field(default=0, description="4. Eligible families awaiting entitlement assessment")
    approval_pending_count: int = Field(default=0, description="5. Cases awaiting competent authority sanction")
    allotment_pending_count: int = Field(default=0, description="6. Families awaiting plot / grant allotment")
    implementation_pending_count: int = Field(default=0, description="7. Allotments in delivery / construction")
    verification_pending_count: int = Field(default=0, description="8. Settled families awaiting field verification")
    completed_count: int = Field(default=0, description="9. Fully settled & verified cases")
    overdue_cases_count: int = Field(default=0, description="10. Cases exceeding statutory SLA deadlines")
    high_risk_projects_count: int = Field(default=0, description="11. Projects with critical R&R bottlenecks")
    active_schemes_count: int = Field(default=0, description="12. Active R&R resettlement colonies / schemes")


# ---------------------------------------------------------------------------
# 2. My R&R Actions Item
# ---------------------------------------------------------------------------
class SocialRAndRActionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Action / Task identifier")
    family_id: Optional[uuid.UUID] = Field(None, description="Affected Family ID")
    family_reference_id: str = Field(..., description="Family Reference ID (e.g. PAF-NH48-001)")
    head_of_family_name: str = Field(..., description="Head of Family")
    project_id: Optional[uuid.UUID] = Field(None, description="Project ID")
    project_title: str = Field(..., description="Project Title")
    project_code: str = Field(default="PRJ-NH48-PKG4", description="Project Code")
    village_name: str = Field(..., description="Village")
    tehsil_name: str = Field(default="Kotputli", description="Tehsil")
    case_stage: str = Field(..., description="SURVEY, ELIGIBILITY, ENTITLEMENT, ALLOTMENT, VERIFICATION, COMPLETION")
    action_type: str = Field(..., description="SURVEY_REQUIRED, ELIGIBILITY_REVIEW, ENTITLEMENT_ASSESSMENT, ALLOTMENT_PROCESSING, VERIFICATION")
    title: str = Field(..., description="Action Title")
    description: str = Field(..., description="Detailed instruction")
    priority: str = Field(default="NORMAL", description="CRITICAL, HIGH, NORMAL, LOW")
    status: str = Field(default="PENDING", description="PENDING, IN_PROGRESS, COMPLETED, OVERDUE")
    due_date: Optional[str] = Field(None, description="SLA Target Date")
    is_overdue: bool = Field(default=False, description="Whether SLA is breached")
    sla_status: str = Field(default="ON_TRACK", description="ON_TRACK, DUE_SOON, OVERDUE")
    required_action: str = Field(..., description="Specific operational action expected")
    target_route: str = Field(..., description="Frontend navigation route")


# ---------------------------------------------------------------------------
# 3. Affected Family Case Item (12 Operational Columns)
# ---------------------------------------------------------------------------
class AffectedFamilyCaseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Primary UUID")
    family_reference_id: str = Field(..., description="1. Family Reference ID (e.g. PAF-NH48-001)")
    head_of_family_name: str = Field(..., description="Head of Family (Masked PII)")
    project_id: Optional[uuid.UUID] = Field(None, description="Project ID")
    project_title: str = Field(..., description="2. Project Title")
    project_code: str = Field(default="PRJ-NH48-PKG4", description="Project Code")
    village_name: str = Field(..., description="3. Village")
    tehsil_name: str = Field(default="Kotputli", description="Tehsil")
    parcel_id: Optional[uuid.UUID] = Field(None, description="Parcel ID")
    khasra_number: str = Field(..., description="4. Parcel / Khasra Number")
    displacement_status: str = Field(..., description="5. Displacement Status: TITLEHOLDER_DISPLACED, TENANT_DISPLACED, LIVELIHOOD_AFFECTED")
    family_type: str = Field(default="PAF_AFFECTED_ONLY", description="PAF_AFFECTED_ONLY or PDF_DISPLACED_REQUIRING_RELOCATION")
    social_category: str = Field(..., description="6. Social Category: SC, ST, OBC, GEN, EWS")
    family_members_count: int = Field(default=4, description="Family member count")
    contact_masked: Optional[str] = Field(None, description="Masked contact")
    eligibility_status: str = Field(..., description="7. Eligibility Status: NOT_REVIEWED, UNDER_REVIEW, ELIGIBLE, NOT_ELIGIBLE, REWORK_REQUIRED")
    eligibility_category: Optional[str] = Field(None, description="Category basis (e.g. Section 31 Schedule II)")
    entitlement_status: str = Field(..., description="8. Entitlement Status: PENDING, ASSESSED, SANCTIONED")
    entitled_plot_sqyd: Decimal = Field(default=Decimal("0.0"), description="Entitled plot area in sq.yd")
    subsistence_grant_inr: Decimal = Field(default=Decimal("0.0"), description="Subsistence grant in INR")
    allotment_status: str = Field(..., description="9. Allotment Status: NOT_ALLOTTED, PLANNED, ALLOTTED, DELIVERED")
    allotted_plot_number: Optional[str] = Field(None, description="Allotted plot number (e.g. Plot B-14)")
    implementation_status: str = Field(..., description="10. Implementation Status: NOT_STARTED, IN_PROGRESS, DELIVERED, VERIFIED")
    case_status: str = Field(..., description="11. Case Status: IDENTIFIED, SURVEYED, UNDER_REVIEW, ALLOTTED, SETTLED, COMPLETED")
    pending_action: str = Field(..., description="12. Pending Action (e.g. 'Review Eligibility', 'Process Allotment Order')")
    is_overdue: bool = Field(default=False, description="SLA overdue flag")
    due_date: Optional[str] = Field(None, description="Current stage due date")
    scheme_id: Optional[uuid.UUID] = Field(None, description="R&R Scheme ID")
    scheme_title: Optional[str] = Field(None, description="R&R Scheme Title")


# ---------------------------------------------------------------------------
# 4. 9-Section Comprehensive Family Case Workspace
# ---------------------------------------------------------------------------
class CaseSummarySection(BaseModel):
    family_reference_id: str
    head_of_family_name: str
    project_id: Optional[uuid.UUID] = None
    project_title: str
    project_code: str
    parcel_id: Optional[uuid.UUID] = None
    khasra_number: str
    village_name: str
    tehsil_name: str
    district_name: str
    displacement_status: str
    family_type: str
    social_category: str
    family_members_count: int
    contact_masked: Optional[str] = None
    case_status: str
    current_stage: str
    sla_due_date: Optional[str] = None
    blocking_possession: bool = False


class CaseEligibilitySection(BaseModel):
    eligibility_status: str  # NOT_REVIEWED, UNDER_REVIEW, ELIGIBLE, NOT_ELIGIBLE, REWORK_REQUIRED
    eligibility_category: Optional[str] = None  # TITLEHOLDER, TENANT, AGRICULTURAL_LABOURER, ARTISAN
    eligibility_basis: Optional[str] = None
    assessing_authority: Optional[str] = None
    assessment_date: Optional[str] = None
    verification_status: str = "PENDING"
    remarks: Optional[str] = None
    can_edit_eligibility: bool = True


class CaseEntitlementsSection(BaseModel):
    entitlement_status: str  # PENDING, ASSESSED, SANCTIONED
    entitlement_category: str = "HOUSING_RESETTLEMENT"
    entitled_plot_sqyd: Decimal = Decimal("0.0")
    subsistence_grant_inr: Decimal = Decimal("0.0")
    transportation_allowance_inr: Decimal = Decimal("0.0")
    one_time_resettlement_allowance_inr: Decimal = Decimal("0.0")
    total_assistance_inr: Decimal = Decimal("0.0")
    source_parameter: str = "RFCTLARR 2013 Second Schedule Standard Entitlement Matrix"
    is_grant_disbursed: bool = False
    remarks: Optional[str] = None


class AllotmentItem(BaseModel):
    id: uuid.UUID
    allotment_reference: str
    entitlement_category: str
    allotment_type: str  # PLOT, HOUSING_UNIT, SUBSISTENCE_ALLOWANCE, TRANSPORT_ALLOWANCE, LIVELIHOOD_GRANT
    asset_identifier: str  # Plot B-14, Resettlement Colony Manpura
    allotment_order_no: str
    allotment_date: str
    delivery_date: Optional[str] = None
    allocated_value_inr: Decimal = Decimal("0.0")
    responsible_authority: Optional[str] = None
    status: str  # PLANNED, APPROVED, ALLOTTED, IN_PROGRESS, DELIVERED, COMPLETED
    remarks: Optional[str] = None


class CaseAllotmentsSection(BaseModel):
    allotment_status: str
    scheme_id: Optional[uuid.UUID] = None
    scheme_title: Optional[str] = None
    resettlement_site_name: Optional[str] = None
    allotted_plot_number: Optional[str] = None
    items: List[AllotmentItem] = []


class CaseDocumentItem(BaseModel):
    id: uuid.UUID
    document_type: str
    title: str
    file_name: str
    file_path: Optional[str] = None
    version: int = 1
    file_hash: Optional[str] = None
    uploaded_at: Optional[str] = None
    uploaded_by: Optional[str] = None
    is_verified: bool = False


class CaseDocumentsSection(BaseModel):
    required_documents: List[str] = []
    submitted_documents: List[CaseDocumentItem] = []
    verification_status: str = "PENDING"


class CaseImplementationSection(BaseModel):
    current_status: str  # NOT_STARTED, IN_PROGRESS, DELIVERED, VERIFIED
    progress_percent: float = 0.0
    pending_action: str
    physical_possession_handed_over: bool = False
    grant_transferred: bool = False
    milestones: List[Dict[str, Any]] = []


class CaseVerificationSection(BaseModel):
    verification_status: str  # PENDING, IN_PROGRESS, VERIFIED, REWORK_REQUESTED
    verification_date: Optional[str] = None
    verifying_officer_name: Optional[str] = None
    verifying_officer_designation: Optional[str] = None
    observations: Optional[str] = None
    rework_reason: Optional[str] = None


class CaseTimelineEvent(BaseModel):
    stage: str
    title: str
    description: str
    actor_name: str
    actor_role: str
    timestamp: str
    status: str


class FamilyCaseDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    family_id: uuid.UUID
    summary: CaseSummarySection
    eligibility: CaseEligibilitySection
    entitlements: CaseEntitlementsSection
    allotments: CaseAllotmentsSection
    documents: CaseDocumentsSection
    implementation: CaseImplementationSection
    verification: CaseVerificationSection
    timeline: List[CaseTimelineEvent] = []
    audit_history: List[Dict[str, Any]] = []


# ---------------------------------------------------------------------------
# 5. Mutation & Action Requests
# ---------------------------------------------------------------------------
class FamilySurveyRequest(BaseModel):
    displacement_category: str = Field(default="TITLEHOLDER_DISPLACED", description="Displacement category")
    family_type: str = Field(default="PDF_DISPLACED_REQUIRING_RELOCATION", description="PAF or PDF")
    social_category: str = Field(default="GEN", description="SC, ST, OBC, GEN, EWS")
    family_members_count: int = Field(default=4, ge=1, le=50, description="Count of members")
    existing_housing_type: Optional[str] = Field(None, description="Kaccha, Pucca, Semi-Pucca")
    livelihood_source: Optional[str] = Field(None, description="Primary livelihood source")
    survey_remarks: str = Field(..., description="On-ground observations by social surveyor")
    supporting_document_ids: Optional[List[uuid.UUID]] = None


class EligibilityReviewRequest(BaseModel):
    eligibility_status: str = Field(..., description="ELIGIBLE, NOT_ELIGIBLE, UNDER_REVIEW, REWORK_REQUIRED")
    eligibility_category: Optional[str] = Field(None, description="Statutory eligibility category")
    eligibility_basis: str = Field(..., description="Legal and factual basis for decision")
    eligibility_remarks: Optional[str] = Field(None, description="Additional assessment notes")
    request_documents: Optional[List[str]] = Field(None, description="List of required missing documents if any")


class EntitlementAssessmentRequest(BaseModel):
    entitled_plot_sqyd: Decimal = Field(default=Decimal("150.0"), ge=0, description="Plot area in sq.yd")
    subsistence_grant_inr: Decimal = Field(default=Decimal("36000.0"), ge=0, description="Subsistence grant in INR")
    transportation_allowance_inr: Decimal = Field(default=Decimal("50000.0"), ge=0, description="Transportation cost in INR")
    one_time_resettlement_allowance_inr: Decimal = Field(default=Decimal("50000.0"), ge=0, description="One-time grant in INR")
    entitlement_remarks: Optional[str] = Field(None, description="Assessment remarks")


class AllotmentActionRequest(BaseModel):
    scheme_id: Optional[uuid.UUID] = None
    allotment_type: str = Field(default="PLOT", description="PLOT, HOUSING_UNIT, SUBSISTENCE_ALLOWANCE, TRANSPORT_ALLOWANCE")
    asset_identifier: str = Field(..., description="Plot number or asset ID (e.g. Plot B-14)")
    allotment_order_no: str = Field(..., description="Official sanction order reference")
    allocated_value_inr: Decimal = Field(default=Decimal("0.0"), ge=0, description="Value allocated")
    status: str = Field(default="ALLOTTED", description="APPROVED, ALLOTTED, DELIVERED, COMPLETED")
    remarks: Optional[str] = Field(None, description="Allotment notes")


class AllotmentStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="APPROVED, ALLOTTED, IN_PROGRESS, DELIVERED, COMPLETED, ON_HOLD")
    delivery_date: Optional[str] = None
    remarks: Optional[str] = None


class VerificationActionRequest(BaseModel):
    verification_status: str = Field(..., description="VERIFIED, REWORK_REQUESTED")
    physical_relocation_confirmed: bool = Field(default=True, description="Physical move confirmed")
    grant_receipt_confirmed: bool = Field(default=True, description="Financial grant receipt confirmed")
    remarks: str = Field(..., description="Social Officer verification remarks")
    rework_reason: Optional[str] = Field(None, description="Reason if rework requested")


# ---------------------------------------------------------------------------
# 6. Project R&R Monitoring & Possession Blocking Dependencies
# ---------------------------------------------------------------------------
class ProjectRAndRSummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: uuid.UUID
    project_code: str
    project_title: str
    district_name: str
    total_affected_families: int = 0
    eligible_families: int = 0
    entitlements_assessed: int = 0
    allotments_completed: int = 0
    physically_settled_families: int = 0
    verification_completed: int = 0
    randr_completion_percent: float = 0.0
    pending_cases_count: int = 0
    overdue_cases_count: int = 0
    randr_risk_level: str = "LOW"  # CRITICAL, HIGH, MODERATE, LOW
    has_blocking_possession_dependency: bool = False
    blocking_dependency_description: Optional[str] = None
    target_action: str = "Manage R&R Cases"


# ---------------------------------------------------------------------------
# 7. Complete Social Officer / R&R Dashboard Summary
# ---------------------------------------------------------------------------
class SocialDashboardSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kpis: SocialRAndRKpiSummary
    my_actions: List[SocialRAndRActionItem] = []
    overdue_cases: List[AffectedFamilyCaseItem] = []
    eligibility_pending_cases: List[AffectedFamilyCaseItem] = []
    entitlement_pending_cases: List[AffectedFamilyCaseItem] = []
    allotment_pending_cases: List[AffectedFamilyCaseItem] = []
    verification_pending_cases: List[AffectedFamilyCaseItem] = []
    active_schemes_summary: List[Dict[str, Any]] = []
    projects_progress: List[ProjectRAndRSummaryItem] = []
    risk_summary: Dict[str, Any] = {}
    notifications: List[Dict[str, Any]] = []
