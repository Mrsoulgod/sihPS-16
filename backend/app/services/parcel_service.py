import uuid
from decimal import Decimal
from datetime import date, datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, AcquisitionStatus
from app.models.parcel import LandParcel, LandOwner, ParcelOwnership, FieldVerification
from app.models.project import Project, WorkflowTask
from app.models.location import Village, District, Tehsil, State
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.parcel import (
    ParcelListItem,
    ParcelDetailResponse,
    ParcelListResponse,
    LandownerSummaryItem,
    FieldVerificationItem,
    FieldVerificationCreateRequest,
)

SQM_TO_ACRES = Decimal("0.000247105")


class ParcelService:
    @staticmethod
    async def list_parcels(
        db: AsyncSession,
        current_user: User,
        project_id: Optional[uuid.UUID] = None,
        village_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        is_disputed: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ParcelListResponse:
        """List cadastral parcels with jurisdiction scoping, search, and filtering."""
        stmt = (
            select(LandParcel)
            .join(LandParcel.project)
            .join(LandParcel.village)
            .join(Village.tehsil)
            .join(Tehsil.district)
            .options(
                selectinload(LandParcel.project),
                selectinload(LandParcel.village).selectinload(Village.tehsil).selectinload(Tehsil.district).selectinload(District.state),
                selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(LandParcel.field_verifications),
                selectinload(LandParcel.possession),
            )
        )

        # 1. Scoping by User Jurisdiction
        user_role = current_user.role_id
        if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
            stmt = stmt.where(Tehsil.district_id == current_user.district_id)
        elif user_role == RoleCode.STATE_OFFICER.value and current_user.state_id:
            stmt = stmt.where(District.state_id == current_user.state_id)
        elif user_role == RoleCode.PROJECT_AGENCY.value and current_user.organization:
            stmt = stmt.where(Project.implementing_agency.ilike(f"%{current_user.organization}%"))

        # 2. Query Filters
        if project_id:
            stmt = stmt.where(LandParcel.project_id == project_id)
        if village_id:
            stmt = stmt.where(LandParcel.village_id == village_id)
        if status_filter:
            stmt = stmt.where(LandParcel.acquisition_status == status_filter)
        if is_disputed is not None:
            stmt = stmt.where(LandParcel.is_disputed == is_disputed)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    LandParcel.khasra_number.ilike(term),
                    LandParcel.khata_number.ilike(term),
                    Village.name.ilike(term),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar() or 0

        # Pagination
        offset = (page - 1) * page_size
        stmt = stmt.order_by(LandParcel.khasra_number.asc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        parcels = result.scalars().all()

        items: List[ParcelListItem] = []
        for p in parcels:
            total_acres = round(float(p.total_area_sqm * SQM_TO_ACRES), 2)
            acq_acres = round(float(p.acquired_area_sqm * SQM_TO_ACRES), 2)

            # Verification status
            v_status = "PENDING_VERIFICATION"
            if p.field_verifications:
                v_status = p.field_verifications[-1].verification_status

            # Primary owner name
            primary_owner = None
            if p.ownerships:
                primary = next((o.owner.full_name for o in p.ownerships if o.is_primary_contact), None)
                primary_owner = primary or p.ownerships[0].owner.full_name

            # Possession status
            poss_status = "PENDING_HANDOVER"
            if p.possession or p.acquisition_status == "POSSESSION_TAKEN":
                poss_status = "POSSESSION_TAKEN"

            village_name = p.village.name if p.village else "Unknown"
            dist_name = p.village.tehsil.district.name if (p.village and p.village.tehsil and p.village.tehsil.district) else "District"
            state_name = p.village.tehsil.district.state.name if (p.village and p.village.tehsil and p.village.tehsil.district and p.village.tehsil.district.state) else "State"

            items.append(
                ParcelListItem(
                    id=p.id,
                    project_id=p.project_id,
                    project_code=p.project.project_code if p.project else "",
                    project_title=p.project.title if p.project else "",
                    village_id=p.village_id,
                    village_name=village_name,
                    district_name=dist_name,
                    state_name=state_name,
                    khasra_number=p.khasra_number,
                    khata_number=p.khata_number,
                    total_area_acres=total_acres,
                    acquired_area_acres=acq_acres,
                    land_type=p.land_type,
                    acquisition_status=p.acquisition_status,
                    verification_status=v_status,
                    is_disputed=p.is_disputed,
                    owner_count=len(p.ownerships),
                    primary_owner_name=primary_owner,
                    possession_status=poss_status,
                    centroid=[float(p.centroid_latitude), float(p.centroid_longitude)],
                )
            )

        total_pages = max(1, (total_records + page_size - 1) // page_size)

        return ParcelListResponse(
            items=items,
            total_records=total_records,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_parcel_detail(
        db: AsyncSession,
        parcel_id: uuid.UUID,
        current_user: User,
    ) -> ParcelDetailResponse:
        """Fetch 360° detail of single parcel with masked PII and verification history."""
        stmt = (
            select(LandParcel)
            .where(LandParcel.id == parcel_id)
            .options(
                selectinload(LandParcel.project).selectinload(Project.primary_district),
                selectinload(LandParcel.village).selectinload(Village.tehsil).selectinload(Tehsil.district).selectinload(District.state),
                selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(LandParcel.field_verifications).selectinload(FieldVerification.verified_by).selectinload(User.role),
                selectinload(LandParcel.possession),
            )
        )
        result = await db.execute(stmt)
        parcel = result.scalar_one_or_none()

        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Land parcel not found")

        # Check jurisdiction
        user_role = current_user.role_id
        if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
            if parcel.village and parcel.village.tehsil and parcel.village.tehsil.district_id != current_user.district_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parcel is outside your district jurisdiction.")

        # Total acres
        total_acres = round(float(parcel.total_area_sqm * SQM_TO_ACRES), 2)
        acq_acres = round(float(parcel.acquired_area_sqm * SQM_TO_ACRES), 2)

        # Verification status
        v_status = "PENDING_VERIFICATION"
        if parcel.field_verifications:
            v_status = parcel.field_verifications[-1].verification_status

        # Masked Owners
        owners_list: List[LandownerSummaryItem] = []
        for own in parcel.ownerships:
            o = own.owner
            extent_acres = round(float(own.extent_area_sqm * SQM_TO_ACRES), 2)

            # Aadhaar & Bank Masking
            # Show e.g. "XXXX-XXXX-4589"
            masked_aadhaar = "XXXX-XXXX-" + o.aadhaar_hash[-4:] if len(o.aadhaar_hash) >= 4 else "XXXX-XXXX-0000"
            masked_bank = "XXXXXX" + o.bank_account_no[-4:] if len(o.bank_account_no) >= 4 else "XXXXXX0000"

            owners_list.append(
                LandownerSummaryItem(
                    id=o.id,
                    full_name=o.full_name,
                    relative_name=o.relative_name,
                    social_category=o.social_category,
                    is_kyc_verified=o.is_kyc_verified,
                    masked_aadhaar=masked_aadhaar,
                    masked_bank_account=masked_bank,
                    bank_name=o.bank_name,
                    ownership_share_percent=float(own.ownership_share_percent),
                    extent_area_acres=extent_acres,
                    is_primary_contact=own.is_primary_contact,
                )
            )

        # Field verifications history
        verifications_list: List[FieldVerificationItem] = []
        for fv in parcel.field_verifications:
            v_name = fv.verified_by.full_name if fv.verified_by else "Field Officer"
            v_role = fv.verified_by.role.name if (fv.verified_by and fv.verified_by.role) else "Field Surveyor"
            verifications_list.append(
                FieldVerificationItem(
                    id=fv.id,
                    verification_date=fv.verification_date,
                    verified_by_name=v_name,
                    verified_by_role=v_role,
                    ground_survey_notes=fv.ground_survey_notes,
                    trees_count=fv.trees_count,
                    structures_count=fv.structures_count,
                    wells_count=fv.wells_count,
                    verification_status=fv.verification_status,
                )
            )

        # Fetch recent audit logs for this parcel
        audit_stmt = (
            select(AuditLog)
            .where(AuditLog.entity_name == "LandParcel", AuditLog.entity_id == str(parcel.id))
            .order_by(AuditLog.timestamp.desc())
            .limit(5)
        )
        audit_records = (await db.execute(audit_stmt)).scalars().all()
        recent_activity: List[Dict[str, Any]] = [
            {
                "id": a.id,
                "action": a.action,
                "timestamp": a.timestamp.isoformat(),
                "details": a.new_values,
            }
            for a in audit_records
        ]

        can_verify = current_user.role_id in (
            RoleCode.FIELD_OFFICER.value,
            RoleCode.DISTRICT_OFFICER.value,
            RoleCode.ADMIN.value,
        )

        village_name = parcel.village.name if parcel.village else "Unknown"
        tehsil_name = parcel.village.tehsil.name if (parcel.village and parcel.village.tehsil) else "Unknown"
        district_name = parcel.village.tehsil.district.name if (parcel.village and parcel.village.tehsil and parcel.village.tehsil.district) else "Unknown"
        state_name = parcel.village.tehsil.district.state.name if (parcel.village and parcel.village.tehsil and parcel.village.tehsil.district and parcel.village.tehsil.district.state) else "Unknown"

        return ParcelDetailResponse(
            id=parcel.id,
            project_id=parcel.project_id,
            project_code=parcel.project.project_code if parcel.project else "",
            project_title=parcel.project.title if parcel.project else "",
            sponsoring_ministry=parcel.project.sponsoring_ministry if parcel.project else "",
            implementing_agency=parcel.project.implementing_agency if parcel.project else "",
            village_id=parcel.village_id,
            village_name=village_name,
            tehsil_name=tehsil_name,
            district_name=district_name,
            state_name=state_name,
            khasra_number=parcel.khasra_number,
            khata_number=parcel.khata_number,
            total_area_acres=total_acres,
            acquired_area_acres=acq_acres,
            land_type=parcel.land_type,
            circle_rate_per_sqm=float(parcel.circle_rate_per_sqm),
            market_multiplier=float(parcel.market_multiplier),
            acquisition_status=parcel.acquisition_status,
            verification_status=v_status,
            current_workflow_stage=parcel.project.current_stage if parcel.project else "UNKNOWN",
            is_disputed=parcel.is_disputed,
            centroid_latitude=float(parcel.centroid_latitude),
            centroid_longitude=float(parcel.centroid_longitude),
            geojson_polygon=parcel.geojson_polygon,
            owners=owners_list,
            field_verifications=verifications_list,
            recent_activity=recent_activity,
            can_verify=can_verify,
        )

    @staticmethod
    async def record_field_verification(
        db: AsyncSession,
        parcel_id: uuid.UUID,
        current_user: User,
        data: FieldVerificationCreateRequest,
    ) -> FieldVerificationItem:
        """Submit ground survey verification for a land parcel."""
        # 1. Authorization check
        if current_user.role_id not in (
            RoleCode.FIELD_OFFICER.value,
            RoleCode.DISTRICT_OFFICER.value,
            RoleCode.ADMIN.value,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Field Officers, CALA Officers, or Administrators can record ground verifications.",
            )

        # 2. Fetch parcel
        stmt = select(LandParcel).where(LandParcel.id == parcel_id)
        result = await db.execute(stmt)
        parcel = result.scalar_one_or_none()

        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

        # 3. Create FieldVerification record
        now = datetime.now(timezone.utc)
        verification = FieldVerification(
            parcel_id=parcel.id,
            verified_by_user_id=current_user.id,
            verification_date=date.today(),
            ground_survey_notes=data.ground_survey_notes,
            trees_count=data.trees_count,
            structures_count=data.structures_count,
            wells_count=data.wells_count,
            verification_status=data.verification_status,
        )
        db.add(verification)

        # 4. Update parcel status if appropriate
        old_status = parcel.acquisition_status
        if data.verification_status == "VERIFIED" and parcel.acquisition_status == "PROPOSED":
            parcel.acquisition_status = "VERIFIED"

        # 5. Log audit trail
        audit = AuditLog(
            user_id=current_user.id,
            action="FIELD_VERIFICATION_SUBMITTED",
            entity_name="LandParcel",
            entity_id=str(parcel.id),
            new_values={
                "khasra": parcel.khasra_number,
                "trees": data.trees_count,
                "structures": data.structures_count,
                "wells": data.wells_count,
                "notes": data.ground_survey_notes,
                "status": data.verification_status,
            },
            timestamp=now,
        )
        db.add(audit)

        # 6. Complete any pending verification workflow tasks for this parcel
        task_stmt = select(WorkflowTask).where(
            WorkflowTask.parcel_id == parcel.id,
            WorkflowTask.status != "COMPLETED",
        )
        tasks = (await db.execute(task_stmt)).scalars().all()
        for t in tasks:
            t.status = "COMPLETED"
            t.completed_at = now

        await db.commit()

        return FieldVerificationItem(
            id=verification.id,
            verification_date=verification.verification_date,
            verified_by_name=current_user.full_name,
            verified_by_role=current_user.role.name if current_user.role else current_user.role_id,
            ground_survey_notes=verification.ground_survey_notes,
            trees_count=verification.trees_count,
            structures_count=verification.structures_count,
            wells_count=verification.wells_count,
            verification_status=verification.verification_status,
        )
