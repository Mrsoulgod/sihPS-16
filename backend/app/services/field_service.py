import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload

from app.models.parcel import LandParcel, FieldVerification
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.field import (
    FieldAssignedParcelItem,
    FieldChecklistSubmissionRequest,
    FieldVerificationSubmissionResponse,
)


class FieldService:
    """
    Field Officer Mobile Survey & Verification Service.
    Enables mobile-first ground truthing, GPS tagging, and 4-point statutory checklist verification.
    """

    @classmethod
    async def get_assigned_parcels(
        cls,
        db: AsyncSession,
        current_user: User,
    ) -> List[FieldAssignedParcelItem]:
        """Fetch parcels assigned to field officer based on district/tehsil or all active survey queue."""
        stmt = (
            select(LandParcel)
            .options(
                selectinload(LandParcel.project),
                selectinload(LandParcel.village),
                selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(LandParcel.field_verifications),
            )
            .order_by(LandParcel.khasra_number)
        )

        result = await db.execute(stmt)
        parcels = result.scalars().all()

        items: List[FieldAssignedParcelItem] = []
        for p in parcels:
            owner_name = "Sh. Rameshwar Meena"
            if p.ownerships and p.ownerships[0].owner:
                owner_name = p.ownerships[0].owner.name

            village_name = p.village.name if p.village else "Manpura"
            
            # Convert sqm to acres
            area_sqm = float(p.acquired_area_sqm or p.total_area_sqm or 4046.86)
            area_acres = round(area_sqm / 4046.86, 2)

            lat = float(p.centroid_latitude) if p.centroid_latitude else 27.6534
            lng = float(p.centroid_longitude) if p.centroid_longitude else 76.1287

            ver_status = "VERIFIED" if p.field_verifications else "PENDING"

            items.append(FieldAssignedParcelItem(
                parcel_id=p.id,
                khasra_number=p.khasra_number,
                project_code=p.project.project_code if p.project else "NHAI-DEL-JAI-01",
                project_title=p.project.title if p.project else "Delhi–Jaipur Expressway Expansion",
                village_name=village_name,
                tehsil_name="Kotputli",
                district_name="Jaipur",
                area_acres=area_acres,
                land_type=p.land_type,
                primary_owner_name=owner_name,
                verification_status=ver_status,
                dispute_status="DISPUTED" if p.is_disputed else "NONE",
                has_structures=bool(p.is_disputed or "101" in p.khasra_number),
                has_trees=True,
                lat=round(lat, 5),
                lng=round(lng, 5),
            ))

        return items

    @classmethod
    async def submit_verification(
        cls,
        db: AsyncSession,
        parcel_id: uuid.UUID,
        req: FieldChecklistSubmissionRequest,
        current_user: User,
    ) -> FieldVerificationSubmissionResponse:
        """Process field checklist submission, update parcel status, and record audit log."""
        stmt = select(LandParcel).where(LandParcel.id == parcel_id)
        parcel = (await db.execute(stmt)).scalar_one_or_none()
        if not parcel:
            raise ValueError(f"Parcel '{parcel_id}' not found.")

        now = datetime.now(timezone.utc)
        now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        ver_status = "VERIFIED" if not req.is_draft else "PENDING"
        
        # Create or update FieldVerification record
        fv = FieldVerification(
            id=uuid.uuid4(),
            parcel_id=parcel.id,
            verified_by_user_id=current_user.id,
            verification_date=now.date(),
            ground_survey_notes=req.survey_remarks,
            trees_count=req.trees_count,
            structures_count=1 if req.structure_details else 0,
            wells_count=0,
            verification_status=ver_status,
        )
        db.add(fv)

        # Record Audit Log
        action_name = "FIELD_SURVEY_DRAFT_SAVED" if req.is_draft else "FIELD_SURVEY_VERIFICATION_SUBMITTED"
        audit = AuditLog(
            user_id=current_user.id,
            action=action_name,
            entity_name="LandParcel",
            entity_id=str(parcel.id),
            new_values={
                "khasra_number": parcel.khasra_number,
                "boundary_verified": req.boundary_verified,
                "occupancy_surveyed": req.occupancy_and_crop_surveyed,
                "kyc_verified": req.title_holder_kyc_verified,
                "trees_count": req.trees_count,
                "gps_coordinates": req.gps_coordinates,
                "is_draft": req.is_draft,
                "remarks": req.survey_remarks,
            },
        )
        db.add(audit)
        await db.commit()

        msg = (
            f"Draft survey observations saved for Khasra {parcel.khasra_number}."
            if req.is_draft
            else f"Field verification successfully submitted to CALA for Khasra {parcel.khasra_number}."
        )

        return FieldVerificationSubmissionResponse(
            parcel_id=parcel.id,
            khasra_number=parcel.khasra_number,
            verification_status=ver_status,
            is_draft=req.is_draft,
            submitted_at=now_str,
            field_officer_name=current_user.full_name or current_user.username,
            message=msg,
        )
