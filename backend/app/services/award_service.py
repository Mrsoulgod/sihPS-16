import hashlib
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, AcquisitionStatus, AwardStatus
from app.models.award import Award
from app.models.compensation import CompensationAssessment
from app.models.parcel import LandParcel, ParcelOwnership, LandOwner
from app.models.project import Project
from app.models.location import District, State
from app.models.user import User
from app.models.audit import AuditLog
from app.models.disbursement import Disbursement
from app.schemas.award import (
    AwardCreate,
    AwardListItem,
    AwardDetail,
    AwardParcelSummary,
    AwardStatusUpdate,
)


class AwardService:
    @staticmethod
    async def list_awards(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List Section 23/30 Awards with scoping and filtering."""
        stmt = (
            select(Award)
            .join(Project, Award.project_id == Project.id)
            .options(
                selectinload(Award.project),
                selectinload(Award.cala_user),
            )
        )

        user_role = current_user.role_id if current_user else None

        # 1. RBAC Jurisdiction Scoping
        if current_user and user_role:
            if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
                stmt = stmt.where(Project.primary_district_id == current_user.district_id)
            elif user_role == RoleCode.STATE_OFFICER.value and current_user.state_id:
                stmt = stmt.join(District, Project.primary_district_id == District.id).where(
                    District.state_id == current_user.state_id
                )
            elif user_role == RoleCode.PROJECT_AGENCY.value and current_user.organization:
                stmt = stmt.where(Project.implementing_agency.ilike(f"%{current_user.organization}%"))

        # 2. Query Filters
        if project_id:
            stmt = stmt.where(Award.project_id == project_id)
        if status:
            stmt = stmt.where(Award.status == status)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Award.award_number.ilike(term),
                    Project.project_code.ilike(term),
                    Project.title.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(Award.award_date.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        awards = result.scalars().all()

        items: List[AwardListItem] = []
        for aw in awards:
            items.append(
                AwardListItem(
                    id=aw.id,
                    award_number=aw.award_number,
                    project_id=aw.project_id,
                    project_title=aw.project.title if aw.project else "N/A",
                    project_code=aw.project.project_code if aw.project else "N/A",
                    award_date=aw.award_date,
                    total_parcels_count=aw.total_parcels_count,
                    total_area_acres=aw.total_area_acres,
                    total_award_amount_inr=aw.total_award_amount_inr,
                    cala_user_name=aw.cala_user.full_name if aw.cala_user else "Competent Authority",
                    status=aw.status,
                    has_demo_esign=bool(aw.digital_sign_hash),
                    created_at=aw.created_at,
                )
            )

        total_pages = (total_records + page_size - 1) // page_size if page_size > 0 else 1

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total_records,
                "total_pages": total_pages,
            },
        }

    @staticmethod
    async def get_award_detail(
        db: AsyncSession,
        award_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> AwardDetail:
        """Fetch 360° detail for an Award including covered parcels and financial reconciliation."""
        stmt = (
            select(Award)
            .where(Award.id == award_id)
            .options(
                selectinload(Award.project).selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Award.cala_user),
                selectinload(Award.approved_by),
                selectinload(Award.compensation_assessments).selectinload(CompensationAssessment.parcel).selectinload(LandParcel.village),
                selectinload(Award.compensation_assessments).selectinload(CompensationAssessment.parcel).selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(Award.disbursements),
            )
        )
        result = await db.execute(stmt)
        aw = result.scalar_one_or_none()

        if not aw:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award record not found")

        prj = aw.project
        dist = prj.primary_district if prj else None
        st = dist.state if dist else None

        # Build parcel summaries
        parcel_summaries: List[AwardParcelSummary] = []
        for ca in aw.compensation_assessments:
            parcel = ca.parcel
            if parcel:
                owners = [po.owner.full_name for po in parcel.ownerships if po.owner]
                parcel_summaries.append(
                    AwardParcelSummary(
                        parcel_id=parcel.id,
                        khasra_number=parcel.khasra_number,
                        village_name=parcel.village.name if parcel.village else "N/A",
                        acquired_area_sqm=parcel.acquired_area_sqm,
                        compensation_assessment_id=ca.id,
                        assessment_reference=ca.assessment_reference,
                        assessed_amount_inr=ca.total_compensation_inr,
                        owner_names=owners,
                    )
                )

        # Calculate disbursements reconciliation
        disbursed_sum = sum(d.amount_inr for d in aw.disbursements if d.payment_status in ("DISBURSED", "SUCCESS_CREDITED"))
        awarded_total = aw.total_award_amount_inr
        remaining = max(Decimal("0.0"), awarded_total - disbursed_sum)
        disb_pct = (disbursed_sum / awarded_total * Decimal("100.0")).quantize(Decimal("0.1")) if awarded_total > 0 else Decimal("0.0")

        return AwardDetail(
            id=aw.id,
            award_number=aw.award_number,
            project_id=prj.id if prj else uuid.uuid4(),
            project_title=prj.title if prj else "N/A",
            project_code=prj.project_code if prj else "N/A",
            district_name=dist.name if dist else "N/A",
            state_name=st.name if st else "N/A",
            award_date=aw.award_date,
            total_parcels_count=aw.total_parcels_count,
            total_area_acres=aw.total_area_acres,
            total_award_amount_inr=aw.total_award_amount_inr,
            status=aw.status,
            cala_user_id=aw.cala_user_id,
            cala_user_name=aw.cala_user.full_name if aw.cala_user else "Competent Authority",
            cala_designation=aw.cala_user.designation if aw.cala_user else "CALA & ADM",
            digital_sign_hash=aw.digital_sign_hash,
            approval_stamp_label="Demo e-Sign / Approval Stamp (Simulation)",
            approved_by_user_name=aw.approved_by.full_name if aw.approved_by else None,
            approval_date=aw.approval_date,
            remarks=aw.remarks,
            parcels=parcel_summaries,
            total_disbursed_inr=disbursed_sum,
            remaining_inr=remaining,
            disbursement_percent=disb_pct,
            created_at=aw.created_at,
            updated_at=aw.updated_at,
        )

    @staticmethod
    async def create_award(
        db: AsyncSession,
        data: AwardCreate,
        current_user: User,
    ) -> Award:
        """Create a Section 23/30 Award linking verified compensation assessments."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Competent Authority (CALA / District Officer) can declare statutory land acquisition awards",
            )

        project = await db.get(Project, data.project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Statutory Guard: Check that all requested parcels have finalized compensation assessments
        ca_stmt = (
            select(CompensationAssessment)
            .join(LandParcel, CompensationAssessment.parcel_id == LandParcel.id)
            .where(
                LandParcel.id.in_(data.parcel_ids),
                LandParcel.project_id == data.project_id,
            )
            .options(selectinload(CompensationAssessment.parcel))
        )
        result = await db.execute(ca_stmt)
        assessments = result.scalars().all()

        if len(assessments) != len(data.parcel_ids):
            found_ids = {ca.parcel_id for ca in assessments}
            missing = [str(pid) for pid in data.parcel_ids if pid not in found_ids]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot declare award: {len(missing)} parcel(s) lack valid compensation assessments ({missing[:3]})",
            )

        total_amount = sum(ca.total_compensation_inr for ca in assessments)
        total_sqm = sum(ca.parcel.acquired_area_sqm for ca in assessments if ca.parcel)
        total_acres = (Decimal(str(total_sqm)) / Decimal("4046.8564224")).quantize(Decimal("0.0001"))

        now = datetime.now(timezone.utc)
        aw_num = data.award_number or f"AWARD/{project.project_code}/{now.year}/{str(uuid.uuid4())[:6].upper()}"

        # Generate Demo e-Sign / Approval Stamp hash
        seed_str = f"{aw_num}:{total_amount}:{current_user.id}:{now.isoformat()}"
        sign_hash = hashlib.sha256(seed_str.encode()).hexdigest()

        award = Award(
            project_id=project.id,
            award_number=aw_num,
            award_date=data.award_date or now.date(),
            total_parcels_count=len(assessments),
            total_area_acres=total_acres,
            total_award_amount_inr=total_amount,
            cala_user_id=current_user.id,
            digital_sign_hash=sign_hash,
            status=AwardStatus.ISSUED.value,
            remarks=data.remarks,
            approved_by_user_id=current_user.id,
            approval_date=now,
        )
        db.add(award)
        await db.flush()

        # Link assessments and update parcel statuses
        for ca in assessments:
            ca.award_id = award.id
            if ca.parcel:
                ca.parcel.acquisition_status = AcquisitionStatus.AWARD_PASSED.value

        # Log audit
        audit = AuditLog(
            user_id=current_user.id,
            action="AWARD_DECLARED",
            entity_type="award",
            entity_id=str(award.id),
            details={
                "award_number": aw_num,
                "total_amount_inr": float(total_amount),
                "parcels_count": len(assessments),
                "approval_stamp": "Demo e-Sign / Approval Stamp",
            },
        )
        db.add(audit)

        await db.commit()
        await db.refresh(award)
        return award

    @staticmethod
    async def update_award_status(
        db: AsyncSession,
        award_id: uuid.UUID,
        status_update: AwardStatusUpdate,
        current_user: User,
    ) -> Award:
        """Update the status of an award with state transition checks."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to modify statutory award status")

        aw = await db.get(Award, award_id)
        if not aw:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")

        aw.status = status_update.status
        if status_update.remarks:
            aw.remarks = (aw.remarks or "") + f" | Status update to {status_update.status}: {status_update.remarks}"

        audit = AuditLog(
            user_id=current_user.id,
            action=f"AWARD_STATUS_{status_update.status}",
            entity_type="award",
            entity_id=str(aw.id),
            details={"status": status_update.status, "remarks": status_update.remarks},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(aw)
        return aw

    @staticmethod
    async def apply_demo_esign(
        db: AsyncSession,
        award_id: uuid.UUID,
        current_user: User,
        remarks: Optional[str] = None,
    ) -> Award:
        """Apply Demo e-Sign / Approval Stamp to an award."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only CALA or Admin can stamp award approval")

        aw = await db.get(Award, award_id)
        if not aw:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")

        now = datetime.now(timezone.utc)
        seed_str = f"{aw.award_number}:{aw.total_award_amount_inr}:{current_user.id}:{now.isoformat()}"
        aw.digital_sign_hash = hashlib.sha256(seed_str.encode()).hexdigest()
        aw.approval_date = now
        aw.approved_by_user_id = current_user.id
        aw.status = AwardStatus.ISSUED.value
        if remarks:
            aw.remarks = (aw.remarks or "") + f" | Demo e-Sign applied: {remarks}"

        audit = AuditLog(
            user_id=current_user.id,
            action="AWARD_DEMO_ESIGN_APPLIED",
            entity_type="award",
            entity_id=str(aw.id),
            details={"approval_stamp": "Demo e-Sign / Approval Stamp (Simulation)"},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(aw)
        return aw
