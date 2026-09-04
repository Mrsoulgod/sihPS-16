import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.models.alert import Alert
from app.models.enums import RoleCode

router = APIRouter()


class AlertItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    severity: str
    category: str
    title: str
    message: str
    target_role: Optional[str] = None
    is_resolved: bool
    created_at: datetime


@router.get("", response_model=List[AlertItem])
async def list_alerts(
    project_id: Optional[uuid.UUID] = Query(None, description="Optional project filter"),
    resolved: Optional[bool] = Query(False, description="Filter resolved status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve active workflow alerts and SLA notifications scoped to logged-in user."""
    stmt = select(Alert).order_by(Alert.created_at.desc())

    if project_id:
        stmt = stmt.where(Alert.project_id == project_id)
    if resolved is not None:
        stmt = stmt.where(Alert.is_resolved == resolved)

    user_role = current_user.role_id
    if user_role != RoleCode.ADMIN.value:
        stmt = stmt.where(
            or_(
                Alert.target_role == user_role,
                Alert.target_role == None,
            )
        )

    result = await db.execute(stmt.limit(50))
    return result.scalars().all()


@router.post("/{alert_id}/resolve", response_model=Dict[str, Any])
async def resolve_alert(
    alert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark an alert resolved."""
    alert = await db.get(Alert, alert_id)
    if alert:
        alert.is_resolved = True
        await db.commit()
    return {"success": True, "alert_id": str(alert_id), "status": "RESOLVED"}
