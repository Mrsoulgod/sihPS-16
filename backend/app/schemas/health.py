from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class HealthData(BaseModel):
    status: str = Field(..., example="healthy")
    project_name: str = Field(..., example="National Land Acquisition & Management System")
    environment: str = Field(..., example="development")
    version: str = Field(..., example="1.0.0")
    database_status: str = Field(..., example="connected")
    timestamp: str


class ResponseMetadata(BaseModel):
    timestamp: str
    request_id: str
    pagination: Optional[Dict[str, Any]] = None


class StandardResponse(BaseModel):
    success: bool = True
    data: Any
    message: str = "Operation completed successfully."
    metadata: ResponseMetadata
