import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Login username or official email address")
    password: str = Field(..., description="Account password")


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserSummaryResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    full_name: str
    designation: str
    organization: str
    role_id: str
    role_name: Optional[str] = None
    state_id: Optional[str] = None
    state_name: Optional[str] = None
    district_id: Optional[str] = None
    district_name: Optional[str] = None
    is_active: bool
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserSummaryResponse


class SwitchRoleRequest(BaseModel):
    target_role: str = Field(..., description="Role code to switch to, e.g. 'ROLE_DISTRICT_OFFICER' or 'DISTRICT_OFFICER'")
