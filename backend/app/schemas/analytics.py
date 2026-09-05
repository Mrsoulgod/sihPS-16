import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class AnalyticsKpiSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_projects: int
    active_projects: int
    completed_projects: int
    total_land_proposed_acres: float
    total_land_acquired_acres: float
    acquisition_progress_percent: float
    total_compensation_assessed_cr: float
    total_compensation_awarded_cr: float
    total_compensation_disbursed_cr: float
    outstanding_compensation_cr: float
    disbursement_progress_percent: float
    total_possession_acres: float
    possession_progress_percent: float
    total_affected_families: int
    total_displaced_families: int
    randr_completed_families: int
    randr_completion_percent: float


class AcquisitionFunnelStage(BaseModel):
    stage_id: str
    stage_name: str
    metric_label: str
    unit: str  # "Projects", "Acres", "₹ Cr", "Families"
    value: float
    formatted_value: str
    conversion_rate_pct: float  # progress relative to baseline or previous stage
    status: str  # ON_TRACK, IN_PROGRESS, PENDING


class AcquisitionFunnelResponse(BaseModel):
    stages: List[AcquisitionFunnelStage]
    baseline_project_count: int
    baseline_proposed_acres: float


class StateAnalyticsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    state_id: str
    state_name: str
    project_count: int
    land_proposed_acres: float
    land_acquired_acres: float
    acquisition_percent: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    possession_acres: float
    possession_percent: float
    affected_families_count: int
    randr_completed_count: int
    randr_completion_percent: float
    performance_category: str  # STRONG, MODERATE, POOR


class DistrictAnalyticsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    district_id: str
    district_name: str
    state_name: str
    project_count: int
    land_proposed_acres: float
    land_acquired_acres: float
    acquisition_percent: float
    compensation_assessed_cr: float
    compensation_disbursed_cr: float
    disbursement_percent: float
    possession_acres: float
    affected_families_count: int
    randr_completion_percent: float


class TimeSeriesDataPoint(BaseModel):
    period_label: str  # e.g., "Q1 2026", "2026-06"
    date_iso: str
    projects_initiated: int
    land_acquired_acres_cumulative: float
    compensation_disbursed_cr_cumulative: float
    possession_acres_cumulative: float
    randr_settled_cumulative: int


class TimeSeriesResponse(BaseModel):
    data_points: List[TimeSeriesDataPoint]
    time_horizon_note: str
    source_database_status: str


class BottleneckItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: uuid.UUID
    project_code: str
    title: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    current_stage: str
    severity: str  # CRITICAL, AT_RISK, WATCH, ON_TRACK
    primary_reason: str
    overdue_tasks_count: int
    outstanding_compensation_cr: float
    disputed_parcels_count: int
    pending_rr_families_count: int
    risk_score: int


class DataQualityCheckItem(BaseModel):
    check_id: str
    check_name: str
    status: str  # PASSED, WARNING, FLAGGED
    rule_description: str
    tested_value: str
    reference_value: str
    is_compliant: bool
    notes: Optional[str] = None


class DataQualityResponse(BaseModel):
    overall_status: str  # COMPLIANT, ATTENTION_REQUIRED
    total_checks_count: int
    passed_checks_count: int
    warnings_count: int
    checks: List[DataQualityCheckItem]
    reconciliation_timestamp: str


class NationalAnalyticsOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scope_level: str  # NATIONAL, STATE, DISTRICT, AGENCY, FIELD
    jurisdiction_name: str
    kpis: AnalyticsKpiSummary
    funnel: AcquisitionFunnelResponse
    data_quality_summary: DataQualityResponse
