import uuid
from decimal import Decimal
from typing import List, Optional, Any, Dict
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.parcel import LandParcel
from app.models.project import Project
from app.models.location import Village
from app.models.user import User
from app.schemas.gis import GeoJsonFeature, GeoJsonFeatureCollection

SQM_TO_ACRES = Decimal("0.000247105")

STATUS_COLOR_MAP = {
    "POSSESSION_TAKEN": {"fillColor": "#138808", "color": "#0d5c05", "label": "Possession Taken"},
    "DISBURSED": {"fillColor": "#138808", "color": "#0d5c05", "label": "Compensation Disbursed"},
    "AWARD_PASSED": {"fillColor": "#138808", "color": "#0d5c05", "label": "Award Declared"},
    "VALUATION_COMPLETED": {"fillColor": "#10b981", "color": "#059669", "label": "Valuation Completed"},
    "NOTIFIED_SEC19": {"fillColor": "#10b981", "color": "#059669", "label": "Section 19 Declaration"},
    "NOTIFIED_SEC11": {"fillColor": "#10b981", "color": "#059669", "label": "Section 11 Notified"},
    "PROPOSED": {"fillColor": "#34d399", "color": "#059669", "label": "Proposed Acquisition"},
    "VERIFIED": {"fillColor": "#f59e0b", "color": "#d97706", "label": "Field Verified"},
    "DISPUTED": {"fillColor": "#ef4444", "color": "#b91c1c", "label": "Title Dispute / Litigation"},
}


class GisService:
    @staticmethod
    async def get_project_parcels_geojson(
        db: AsyncSession,
        project_id: uuid.UUID,
        current_user: User,
    ) -> GeoJsonFeatureCollection:
        """Generate GeoJSON FeatureCollection with status-based thematic styling for Leaflet map."""
        stmt = (
            select(LandParcel)
            .where(LandParcel.project_id == project_id)
            .options(
                selectinload(LandParcel.project),
                selectinload(LandParcel.village),
                selectinload(LandParcel.field_verifications),
            )
        )
        result = await db.execute(stmt)
        parcels = result.scalars().all()

        features: List[GeoJsonFeature] = []
        lats: List[float] = []
        lons: List[float] = []

        for p in parcels:
            lat = float(p.centroid_latitude)
            lon = float(p.centroid_longitude)
            lats.append(lat)
            lons.append(lon)

            # Determine styling color
            if p.is_disputed or p.acquisition_status == "DISPUTED":
                style = STATUS_COLOR_MAP["DISPUTED"]
            else:
                style = STATUS_COLOR_MAP.get(
                    p.acquisition_status,
                    {"fillColor": "#94a3b8", "color": "#64748b", "label": p.acquisition_status},
                )

            v_status = "PENDING_VERIFICATION"
            if p.field_verifications:
                v_status = p.field_verifications[-1].verification_status

            area_acres = round(float(p.total_area_sqm * SQM_TO_ACRES), 2)
            acq_acres = round(float(p.acquired_area_sqm * SQM_TO_ACRES), 2)

            props = {
                "parcel_id": str(p.id),
                "khasra_number": p.khasra_number,
                "khata_number": p.khata_number,
                "village_id": p.village_id,
                "village_name": p.village.name if p.village else "",
                "total_area_acres": area_acres,
                "acquired_area_acres": acq_acres,
                "land_type": p.land_type,
                "acquisition_status": p.acquisition_status,
                "status_label": style["label"],
                "verification_status": v_status,
                "is_disputed": p.is_disputed,
                "centroid": [lat, lon],
                "current_stage": p.project.current_stage if p.project else "",
                "fillColor": style["fillColor"],
                "color": style["color"],
                "fillOpacity": 0.65,
                "weight": 2,
            }

            features.append(
                GeoJsonFeature(
                    id=str(p.id),
                    geometry=p.geojson_polygon,
                    properties=props,
                )
            )

        # Calculate bounding box & center
        if lats and lons:
            min_lat, max_lat = min(lats), max(lats)
            min_lon, max_lon = min(lons), max(lons)
            center = [(min_lat + max_lat) / 2.0, (min_lon + max_lon) / 2.0]
            bounds = [[min_lat - 0.005, min_lon - 0.005], [max_lat + 0.005, max_lon + 0.005]]
        else:
            center = [27.7050, 76.2050]
            bounds = [[27.6950, 76.1950], [27.7150, 76.2150]]

        metadata = {
            "project_id": str(project_id),
            "parcel_count": len(features),
            "center": center,
            "bounds": bounds,
        }

        return GeoJsonFeatureCollection(
            features=features,
            metadata=metadata,
        )

    @staticmethod
    async def get_parcel_geojson(
        db: AsyncSession,
        parcel_id: uuid.UUID,
        current_user: User,
    ) -> GeoJsonFeature:
        """Fetch single parcel GeoJSON feature with polygon geometry."""
        stmt = (
            select(LandParcel)
            .where(LandParcel.id == parcel_id)
            .options(
                selectinload(LandParcel.village),
                selectinload(LandParcel.field_verifications),
            )
        )
        result = await db.execute(stmt)
        parcel = result.scalar_one_or_none()

        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

        style = STATUS_COLOR_MAP.get(
            parcel.acquisition_status,
            {"fillColor": "#138808", "color": "#0d5c05", "label": parcel.acquisition_status},
        )
        if parcel.is_disputed:
            style = STATUS_COLOR_MAP["DISPUTED"]

        props = {
            "parcel_id": str(parcel.id),
            "khasra_number": parcel.khasra_number,
            "khata_number": parcel.khata_number,
            "village_name": parcel.village.name if parcel.village else "",
            "area_acres": round(float(parcel.total_area_sqm * SQM_TO_ACRES), 2),
            "acquisition_status": parcel.acquisition_status,
            "is_disputed": parcel.is_disputed,
            "centroid": [float(parcel.centroid_latitude), float(parcel.centroid_longitude)],
            "fillColor": style["fillColor"],
            "color": style["color"],
        }

        return GeoJsonFeature(
            id=str(parcel.id),
            geometry=parcel.geojson_polygon,
            properties=props,
        )
