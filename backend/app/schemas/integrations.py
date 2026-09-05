from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class IntegrationGatewayItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    system_category: str  # LAND_RECORDS, CADASTRAL_GIS, FINANCIAL_DBT, NOTIFICATION_GATEWAY
    status: str = "SANDBOX_ACTIVE"  # SANDBOX_ACTIVE, SIMULATED, IDLE
    sync_mode: str = "REST_API_WEBHOOK"
    endpoint_url: str
    last_synced_at: str
    records_synced_count: int
    description: str
    sample_request: Dict[str, Any]
    sample_response: Dict[str, Any]
    supported_operations: List[str]
    sla_response_ms: int = 120


class IntegrationTestRequest(BaseModel):
    operation: str = Field(..., description="Operation code, e.g. 'VERIFY_KHASRA_TITLE'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class IntegrationTestResponse(BaseModel):
    integration_code: str
    operation: str
    status: str = "SUCCESS"
    executed_at: str
    latency_ms: int
    payload_sent: Dict[str, Any]
    response_data: Dict[str, Any]
    audit_logged: bool = True
    disclaimer: str = "PROTOTYPE / SANDBOX INTEGRATION: Simulated government API response for SIH demonstration."
