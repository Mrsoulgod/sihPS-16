import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class RiskFactorItem(BaseModel):
    factor_id: str
    factor_name: str
    weight_percent: float  # e.g., 20.0
    score: float  # 0.0 - 100.0
    weighted_contribution: float  # (score * weight / 100)
    status: str  # LOW (0-24), MODERATE (25-49), HIGH (50-74), CRITICAL (75-100)
    explanation: str
    key_indicators: List[str]


class ProjectRiskDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: uuid.UUID
    project_code: str
    title: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    current_stage: str
    overall_risk_score: int  # 0 - 100
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    factors: List[RiskFactorItem]
    top_risk_drivers: List[str]
    decision_support_recommendations: List[str]
    assessment_timestamp: str
    methodology_version: str = "RFCTLARR-v1.0 (Rule-Based Operational Indicators)"


class RiskDistributionCount(BaseModel):
    low_count: int  # 0-24
    moderate_count: int  # 25-49
    high_count: int  # 50-74
    critical_count: int  # 75-100
    total_projects: int


class HighRiskProjectLeaderboardItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: uuid.UUID
    project_code: str
    title: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    risk_score: int
    risk_level: str
    primary_driver: str
    recommended_action: str


class RiskOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scope_level: str  # NATIONAL, STATE, DISTRICT, AGENCY, FIELD
    jurisdiction_name: str
    distribution: RiskDistributionCount
    top_high_risk_projects: List[HighRiskProjectLeaderboardItem]
    factor_benchmarks: List[Dict[str, Any]]
    methodology_note: str = (
        "Prototype rule-based risk assessment using operational RFCTLARR indicators. "
        "Provides decision-support insights; does not constitute automated statutory actions."
    )
