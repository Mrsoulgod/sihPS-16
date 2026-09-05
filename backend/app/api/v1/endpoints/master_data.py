from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.master_data import (
    MasterGeographicItem,
    MasterTaxonomyCategory,
    StatutoryParametersMaster,
)
from app.services.master_data_service import MasterDataService

router = APIRouter()


@router.get("/geography", response_model=List[MasterGeographicItem])
async def get_geographic_hierarchy(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get uniform master administrative geographic hierarchy (States -> Districts -> Tehsils -> Villages).
    """
    return await MasterDataService.get_geographic_hierarchy(db)


@router.get("/taxonomy", response_model=List[MasterTaxonomyCategory])
async def get_master_taxonomy(
    current_user: User = Depends(get_current_user),
):
    """
    Get standardized taxonomy categories across Roles, Stages, Land Types, and R&R Entitlements.
    """
    return MasterDataService.get_standardized_taxonomy()


@router.get("/statutory-parameters", response_model=StatutoryParametersMaster)
async def get_statutory_parameters(
    current_user: User = Depends(get_current_user),
):
    """
    Get central RFCTLARR statutory calculation parameters, SLAs, and risk weights.
    """
    return MasterDataService.get_statutory_parameters()
