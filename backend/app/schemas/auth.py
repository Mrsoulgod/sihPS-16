import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Login username or official email address")
    password: str = Field(..., description="Account password")


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class JurisdictionSummary(BaseModel):
    level: str = Field(..., description="Jurisdiction scope level: CENTRAL, STATE, DISTRICT, PROJECT, FIELD, SOCIAL")
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    tehsil_id: Optional[str] = None
    project_id: Optional[str] = None
    scope_display: str = Field(..., description="Human readable jurisdiction scope string")


class UserSummaryResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    full_name: str
    display_name: Optional[str] = None
    designation: str
    organization: str
    role_id: str
    role_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    jurisdiction: Optional[JurisdictionSummary] = None
    permissions: List[str] = Field(default_factory=list)
    is_active: bool
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserSummaryResponse

