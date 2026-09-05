from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.integrations import (
    IntegrationGatewayItem,
    IntegrationTestRequest,
    IntegrationTestResponse,
)
from app.services.integration_service import IntegrationService

router = APIRouter()


@router.get("", response_model=List[IntegrationGatewayItem])
@router.get("/", response_model=List[IntegrationGatewayItem])
async def list_integration_gateways(
    current_user: User = Depends(get_current_user),
):
    """
    List all available Government Integration Gateway connectors (Sandbox / Interoperability).
    """
    return IntegrationService.get_gateways_list()


@router.post("/{code}/test-sync", response_model=IntegrationTestResponse)
async def test_gateway_sync(
    code: str,
    req: IntegrationTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Execute a live sandbox interoperability query / synchronization test with full audit trail.
    """
    valid_codes = [
        "BHULEKH_LAND_RECORDS",
        "BHUVAN_CADASTRAL_GIS",
        "PFMS_DBT_FINANCIAL",
        "NOTIFICATION_GATEWAY_SMS",
    ]
    if code.upper() not in valid_codes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration gateway '{code}' not recognized.",
        )

    return await IntegrationService.execute_sandbox_test(
        db=db,
        code=code.upper(),
        req=req,
        current_user=current_user,
    )
