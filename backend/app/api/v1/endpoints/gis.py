import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.gis import GeoJsonFeatureCollection, GeoJsonFeature
from app.services.gis_service import GisService

router = APIRouter()


@router.get("/projects/{project_id}/parcels", response_model=GeoJsonFeatureCollection)
async def get_project_parcels_geojson(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve GeoJSON FeatureCollection of all cadastral parcels for a project corridor with thematic status styling."""
    return await GisService.get_project_parcels_geojson(
        db=db,
        project_id=project_id,
        current_user=current_user,
    )


@router.get("/parcels/{parcel_id}/geojson", response_model=GeoJsonFeature)
async def get_parcel_geojson(
    parcel_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve GeoJSON Feature of a single parcel boundary."""
    return await GisService.get_parcel_geojson(
        db=db,
        parcel_id=parcel_id,
        current_user=current_user,
    )
