from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class MasterGeographicItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    code: Optional[str] = None
    level: str  # STATE, DISTRICT, TEHSIL, VILLAGE
    parent_id: Optional[str] = None
    lgd_code: Optional[str] = None
    rural_factor: Optional[float] = None


class MasterTaxonomyCategory(BaseModel):
    category_id: str
    category_name: str
    description: str
    values: List[Dict[str, Any]]


class StatutoryParametersMaster(BaseModel):
    act_name: str = "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)"
    solatium_multiplier_percent: float = 100.0
    solatium_percentage: float = 100.0
    statutory_additional_interest_percent: float = 12.0
    statutory_interest_rate_per_annum: float = 12.0
    rural_multiplier_range: Dict[str, float] = {"min": 1.0, "max": 2.0}
    section_15_objection_window_days: int = 60
    section_25_statutory_lapse_months: int = 12
    urgency_clause_deposit_percent: float = 80.0
    sla_limits_days: Dict[str, int] = {
        "Section 11 Preliminary Notification": 30,
        "Section 15 Hearing Objections": 60,
        "Section 19 Declaration of Acquisition": 90,
        "Section 23/27 Award Enquiry & Determination": 120,
        "Section 25 Statutory Award Finalization": 365,
        "Section 38 Taking Possession & Handover": 60,
    }
    risk_scoring_weights: Dict[str, float] = {
        "workflow_delay": 0.20,
        "parcel_verification": 0.20,
        "compensation_financial": 0.25,
        "disputes_objections": 0.15,
        "randr_possession_lag": 0.20,
    }
    risk_weights_distribution: Dict[str, float] = {
        "workflow_delay_risk": 20.0,
        "parcel_verification_risk": 20.0,
        "compensation_financial_risk": 25.0,
        "disputes_objections_risk": 15.0,
        "randr_possession_lag_risk": 20.0,
    }
    supported_document_mime_types: List[str] = ["application/pdf", "image/png", "image/jpeg", "application/geo+json"]

