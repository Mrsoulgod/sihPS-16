import uuid
from decimal import Decimal
from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    description: str
    sponsoring_ministry: str
    implementing_agency: str
    current_stage: str
    current_stage_name: str
    status: Optional[str] = "ACTIVE"
    proposal_status: Optional[str] = "SUBMITTED"
    primary_district_id: Optional[str] = None
    primary_district_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    acquisition_progress_percent: float
    total_possession_acres: float
    estimated_budget_inr_cr: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    total_paf_count: int
    total_pdf_count: int
    randr_completion_percent: float
    risk_score: int
    parcels_count: int = 0
    pending_action: Optional[str] = None


class ProjectDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_code: str
    title: str
    description: str
    sponsoring_ministry: str
    implementing_agency: str
    current_stage: str
    current_stage_name: str
    status: Optional[str] = "ACTIVE"
    proposal_status: Optional[str] = "SUBMITTED"
    primary_district_id: Optional[str] = None
    primary_district_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    total_possession_acres: float
    acquisition_progress_percent: float
    possession_percent: float
    estimated_budget_inr_cr: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    total_paf_count: int
    total_pdf_count: int
    randr_completion_percent: float
    risk_score: int
    parcels_count: int
    verified_parcels_count: int = 0
    assessed_parcels_count: int = 0
    awards_count: int = 0
    disbursed_parcels_count: int = 0
    possession_parcels_count: int = 0
    parcels_pending_possession_count: int = 0
    total_awarded_cr: float = 0.0
    outstanding_compensation_cr: float = 0.0
    randr_schemes_count: int = 0
    eligible_families_count: int = 0
    assisted_families_count: int = 0
    pending_families_count: int = 0
    created_at: Optional[datetime] = None
    alignment_geojson: Optional[Any] = None
    proposal_metadata: Optional[Dict[str, Any]] = None


class ProjectProposalCreate(BaseModel):
    """
    Payload for submitting or drafting a new multi-step infrastructure project proposal.
    """
    # Step 1: Project Details
    title: str
    project_code: str
    project_type: Optional[str] = "Highway Corridor"
    project_category: Optional[str] = "National Infrastructure"
    description: Optional[str] = "Infrastructure Project Proposal"
    objective: Optional[str] = None
    sponsoring_ministry: Optional[str] = "Ministry of Road Transport and Highways"
    estimated_budget_inr_cr: Optional[float] = None
    estimated_project_cost_cr: Optional[float] = None
    priority: Optional[str] = "HIGH"
    proposed_start_date: Optional[date] = None
    target_completion_date: Optional[date] = None

    # Step 2: Location
    state_id: Optional[str] = "IN-RJ"
    primary_district_id: Optional[str] = "DST-JAI"
    tehsil_id: Optional[str] = None
    tehsil_name: Optional[str] = None
    villages: Optional[List[str]] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    project_length_km: Optional[float] = None

    # Step 3: Proposed Land Requirement
    total_land_proposed_acres: Optional[float] = None
    total_land_required_acres: Optional[float] = None
    unit: Optional[str] = "Acres"
    land_unit: Optional[str] = "Acres"
    government_land_acres: Optional[float] = 0.0
    private_land_acres: Optional[float] = 0.0
    other_land_acres: Optional[float] = 0.0
    expected_parcel_count: Optional[int] = 0
    affected_villages_count: Optional[int] = 0
    land_remarks: Optional[str] = None
    proposed_land_remarks: Optional[str] = None

    # Step 4: Proposed Alignment
    alignment_geojson: Optional[Any] = None
    preliminary_coordinates: Optional[List[List[float]]] = None

    # Step 5: Documents
    document_ids: Optional[List[uuid.UUID]] = None
    documents: Optional[List[Dict[str, Any]]] = None

    # Step 6: Draft vs Submit
    is_draft: bool = False
    submission_remarks: Optional[str] = None


class ProjectDraftUpdate(BaseModel):
    """Payload for updating an existing DRAFT or REWORK_REQUESTED project proposal."""
    title: Optional[str] = None
    project_type: Optional[str] = None
    project_category: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    sponsoring_ministry: Optional[str] = None
    estimated_budget_inr_cr: Optional[float] = None
    estimated_project_cost_cr: Optional[float] = None
    priority: Optional[str] = None
    proposed_start_date: Optional[date] = None
    target_completion_date: Optional[date] = None

    state_id: Optional[str] = None
    primary_district_id: Optional[str] = None
    tehsil_id: Optional[str] = None
    tehsil_name: Optional[str] = None
    villages: Optional[List[str]] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    project_length_km: Optional[float] = None

    total_land_proposed_acres: Optional[float] = None
    total_land_required_acres: Optional[float] = None
    unit: Optional[str] = None
    land_unit: Optional[str] = None
    government_land_acres: Optional[float] = None
    private_land_acres: Optional[float] = None
    other_land_acres: Optional[float] = None
    expected_parcel_count: Optional[int] = None
    affected_villages_count: Optional[int] = None
    land_remarks: Optional[str] = None
    proposed_land_remarks: Optional[str] = None

    alignment_geojson: Optional[Any] = None
    preliminary_coordinates: Optional[List[List[float]]] = None
    document_ids: Optional[List[uuid.UUID]] = None
    documents: Optional[List[Dict[str, Any]]] = None
    submission_remarks: Optional[str] = None


class ProjectSubmitRequest(BaseModel):
    """Payload for formal submission of a DRAFT proposal."""
    submission_remarks: Optional[str] = "Submitted for Competent Authority / CALA administrative scrutiny."


class ProjectResubmitRequest(BaseModel):
    """Payload for resubmission of proposal following Scrutiny Rework Request."""
    rework_response_remarks: Optional[str] = None
    response_remarks: Optional[str] = None
    corrections_summary: Optional[str] = None
    corrected_fields: Optional[List[str]] = None
    new_document_ids: Optional[List[uuid.UUID]] = None


class SurveyRequestCreate(BaseModel):
    """Payload for Project Agency requesting field survey / ground verification."""
    project_id: Optional[uuid.UUID] = None
    request_type: Optional[str] = "FIELD_VERIFICATION"
    survey_type: Optional[str] = None
    title: str
    description: Optional[str] = None
    justification: Optional[str] = None
    target_district_id: Optional[str] = None
    target_tehsil: Optional[str] = None
    target_villages: Optional[List[str]] = None
    target_village: Optional[str] = None
    target_khasra: Optional[str] = None
    priority: str = "HIGH"
    due_date: Optional[date] = None

