import random
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, AcquisitionStatus, DisbursementStatus
from app.models.disbursement import Disbursement
from app.models.award import Award
from app.models.compensation import CompensationAssessment
from app.models.parcel import LandParcel, ParcelOwnership, LandOwner
from app.models.project import Project
from app.models.location import District, State
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.disbursement import (
    DisbursementListItem,
    DisbursementDetail,
    FinancialReconciliationSummary,
    DisbursementInitiateBatch,
)


def mask_identifier(val: Optional[str], keep_end: int = 4) -> str:
    if not val:
        return "Not Provided"
    s = str(val).strip()
    if len(s) <= keep_end:
        return "••••"
    return "•" * (len(s) - keep_end) + s[-keep_end:]


class DisbursementService:
    @staticmethod
    async def list_disbursements(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        award_id: Optional[uuid.UUID] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List disbursement transactions with PFMS status and masked beneficiary details."""
        stmt = (
            select(Disbursement)
            .join(Award, Disbursement.award_id == Award.id)
            .join(Project, Award.project_id == Project.id)
            .join(LandParcel, Disbursement.parcel_id == LandParcel.id)
            .join(LandOwner, Disbursement.owner_id == LandOwner.id)
            .options(
                selectinload(Disbursement.award).selectinload(Award.project),
                selectinload(Disbursement.parcel),
                selectinload(Disbursement.owner),
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
        if award_id:
            stmt = stmt.where(Disbursement.award_id == award_id)
        if payment_status:
            stmt = stmt.where(Disbursement.payment_status == payment_status)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Disbursement.disbursement_reference.ilike(term),
                    Disbursement.pfms_batch_reference.ilike(term),
                    Disbursement.bank_utr_number.ilike(term),
                    LandOwner.full_name.ilike(term),
                    LandParcel.khasra_number.ilike(term),
                    Award.award_number.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(Disbursement.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        disbursements = result.scalars().all()

        items: List[DisbursementListItem] = []
        for d in disbursements:
            aw = d.award
            prj = aw.project if aw else None
            parcel = d.parcel
            owner = d.owner

            items.append(
                DisbursementListItem(
                    id=d.id,
                    disbursement_reference=d.disbursement_reference or f"DISB-{str(d.id)[:8].upper()}",
                    pfms_batch_reference=d.pfms_batch_reference,
                    award_id=d.award_id,
                    award_number=aw.award_number if aw else "N/A",
                    project_id=prj.id if prj else uuid.uuid4(),
                    project_title=prj.title if prj else "N/A",
                    parcel_id=d.parcel_id,
                    khasra_number=parcel.khasra_number if parcel else "N/A",
                    owner_id=d.owner_id,
                    owner_name=owner.full_name if owner else "N/A",
                    masked_bank_account=mask_identifier(owner.bank_account_no, 4) if owner else "••••",
                    masked_ifsc=mask_identifier(owner.bank_ifsc_code, 4) if owner else "••••",
                    amount_inr=d.amount_inr,
                    payment_method=d.payment_method,
                    payment_status=d.payment_status,
                    bank_utr_number=d.bank_utr_number,
                    disbursed_at=d.disbursed_at,
                    created_at=d.created_at,
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
    async def get_disbursement_detail(
        db: AsyncSession,
        disbursement_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> DisbursementDetail:
        """Fetch 360° detail for a single disbursement transaction with masked PII."""
        stmt = (
            select(Disbursement)
            .where(Disbursement.id == disbursement_id)
            .options(
                selectinload(Disbursement.award).selectinload(Award.project).selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Disbursement.parcel),
                selectinload(Disbursement.owner),
                selectinload(Disbursement.processed_by),
            )
        )
        result = await db.execute(stmt)
        d = result.scalar_one_or_none()

        if not d:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disbursement record not found")

        aw = d.award
        prj = aw.project if aw else None
        dist = prj.primary_district if prj else None
        st = dist.state if dist else None
        parcel = d.parcel
        owner = d.owner

        return DisbursementDetail(
            id=d.id,
            disbursement_reference=d.disbursement_reference or f"DISB-{str(d.id)[:8].upper()}",
            pfms_batch_reference=d.pfms_batch_reference,
            payment_workflow_label="PFMS-Compatible / Simulated Payment Workflow",
            award_id=d.award_id,
            award_number=aw.award_number if aw else "N/A",
            award_amount_inr=aw.total_award_amount_inr if aw else Decimal("0.0"),
            project_id=prj.id if prj else uuid.uuid4(),
            project_title=prj.title if prj else "N/A",
            project_code=prj.project_code if prj else "N/A",
            district_name=dist.name if dist else "N/A",
            state_name=st.name if st else "N/A",
            parcel_id=d.parcel_id,
            khasra_number=parcel.khasra_number if parcel else "N/A",
            owner_id=d.owner_id,
            owner_name=owner.full_name if owner else "N/A",
            relative_name=owner.relative_name if owner else None,
            masked_bank_account=mask_identifier(owner.bank_account_no, 4) if owner else "••••",
            masked_ifsc=mask_identifier(owner.bank_ifsc_code, 4) if owner else "••••",
            bank_name=owner.bank_name if owner else "Designated Bank",
            social_category=owner.social_category if owner else "GEN",
            is_kyc_verified=owner.is_kyc_verified if owner else False,
            amount_inr=d.amount_inr,
            payment_method=d.payment_method,
            payment_status=d.payment_status,
            bank_utr_number=d.bank_utr_number,
            disbursed_at=d.disbursed_at,
            failure_reason=d.failure_reason,
            remarks=d.remarks,
            processed_by_user_name=d.processed_by.full_name if d.processed_by else None,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )

    @staticmethod
    async def initiate_batch(
        db: AsyncSession,
        data: DisbursementInitiateBatch,
        current_user: User,
    ) -> List[Disbursement]:
        """Initiate PFMS-compatible simulated DBT batch for beneficiaries under an award."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only District Officer (CALA) or Admin can initiate compensation disbursements",
            )

        award = await db.get(Award, data.award_id)
        if not award:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")

        # Query assessments under award
        ca_stmt = (
            select(CompensationAssessment)
            .where(CompensationAssessment.award_id == award.id)
            .options(
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner)
            )
        )
        result = await db.execute(ca_stmt)
        assessments = result.scalars().all()

        if not assessments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No compensation assessments linked to this award to disburse",
            )

        now = datetime.now(timezone.utc)
        batch_ref = data.pfms_batch_reference or f"PFMS-{now.year}-BAT-{str(uuid.uuid4())[:6].upper()}"

        created_disbursements: List[Disbursement] = []
        for ca in assessments:
            parcel = ca.parcel
            if not parcel or not parcel.ownerships:
                continue

            if data.parcel_ids and parcel.id not in data.parcel_ids:
                continue

            for po in parcel.ownerships:
                if not po.owner:
                    continue

                # Check if disbursement already exists for this award, parcel, owner
                d_check = await db.execute(
                    select(Disbursement).where(
                        Disbursement.award_id == award.id,
                        Disbursement.parcel_id == parcel.id,
                        Disbursement.owner_id == po.owner.id,
                    )
                )
                existing_d = d_check.scalar_one_or_none()
                if existing_d:
                    continue

                # Calculate owner's share of total assessed compensation
                share_pct = po.ownership_share_percent / Decimal("100.0")
                owner_amount = (ca.total_compensation_inr * share_pct).quantize(Decimal("0.01"))

                d_ref = f"DISB/{parcel.khasra_number.replace('/', '-')}/{str(uuid.uuid4())[:6].upper()}"
                disb = Disbursement(
                    award_id=award.id,
                    parcel_id=parcel.id,
                    owner_id=po.owner.id,
                    disbursement_reference=d_ref,
                    amount_inr=owner_amount,
                    payment_method="PFMS_DBT",
                    pfms_batch_reference=batch_ref,
                    payment_status=DisbursementStatus.PROCESSING.value,
                    remarks=data.remarks,
                    processed_by_user_id=current_user.id,
                )
                db.add(disb)
                created_disbursements.append(disb)

        audit = AuditLog(
            user_id=current_user.id,
            action="DISBURSEMENT_BATCH_INITIATED",
            entity_type="award",
            entity_id=str(award.id),
            details={
                "batch_reference": batch_ref,
                "disbursements_count": len(created_disbursements),
                "workflow": "PFMS-Compatible / Simulated Payment Workflow",
            },
        )
        db.add(audit)

        await db.commit()
        return created_disbursements

    @staticmethod
    async def process_simulation(
        db: AsyncSession,
        disbursement_id: uuid.UUID,
        target_status: str,
        current_user: User,
        bank_utr_number: Optional[str] = None,
        failure_reason: Optional[str] = None,
    ) -> Disbursement:
        """Simulate bank credit callback (PFMS DBT settlement)."""
        disb = await db.get(Disbursement, disbursement_id)
        if not disb:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disbursement not found")

        now = datetime.now(timezone.utc)
        if target_status in ("DISBURSED", "SUCCESS_CREDITED"):
            disb.payment_status = DisbursementStatus.DISBURSED.value
            disb.disbursed_at = now
            disb.bank_utr_number = bank_utr_number or f"SBIN{now.strftime('%y%m%d')}{random.randint(100000, 999999)}"
            disb.failure_reason = None

            # Check if all disbursements for this parcel are now paid
            other_stmt = select(Disbursement).where(Disbursement.parcel_id == disb.parcel_id)
            all_parcel_disbs = (await db.execute(other_stmt)).scalars().all()
            if all(d.payment_status in ("DISBURSED", "SUCCESS_CREDITED") for d in all_parcel_disbs):
                parcel = await db.get(LandParcel, disb.parcel_id)
                if parcel and parcel.acquisition_status != AcquisitionStatus.POSSESSION_TAKEN.value:
                    parcel.acquisition_status = AcquisitionStatus.DISBURSED.value

        else:
            disb.payment_status = DisbursementStatus.FAILED.value
            disb.failure_reason = failure_reason or "Account validation failure at beneficiary bank (Demo)"

        audit = AuditLog(
            user_id=current_user.id,
            action=f"DISBURSEMENT_{target_status}",
            entity_type="disbursement",
            entity_id=str(disb.id),
            details={"utr": disb.bank_utr_number, "status": disb.payment_status},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(disb)
        return disb

    @staticmethod
    async def get_reconciliation_summary(
        db: AsyncSession,
        project_or_award_id: uuid.UUID,
    ) -> FinancialReconciliationSummary:
        """Calculate authoritative financial reconciliation (Awarded vs Disbursed vs Outstanding)."""
        # Check if project
        project = await db.get(Project, project_or_award_id)
        if project:
            # Query all awards under project
            aw_stmt = select(Award).where(Award.project_id == project.id)
            awards = (await db.execute(aw_stmt)).scalars().all()
            award_ids = [aw.id for aw in awards]

            total_awarded = sum(aw.total_award_amount_inr for aw in awards)

            # Query all assessments under project
            ca_stmt = (
                select(func.coalesce(func.sum(CompensationAssessment.total_compensation_inr), 0))
                .join(LandParcel, CompensationAssessment.parcel_id == LandParcel.id)
                .where(LandParcel.project_id == project.id)
            )
            total_assessed = Decimal(str((await db.execute(ca_stmt)).scalar_one()))

            # Query disbursements
            if award_ids:
                d_stmt = select(Disbursement).where(Disbursement.award_id.in_(award_ids))
                all_disbs = (await db.execute(d_stmt)).scalars().all()
            else:
                all_disbs = []

            ref_title = f"{project.project_code} - {project.title}"
        else:
            # Check if award
            award = await db.get(Award, project_or_award_id)
            if not award:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project or Award not found")

            total_awarded = award.total_award_amount_inr
            total_assessed = total_awarded
            d_stmt = select(Disbursement).where(Disbursement.award_id == award.id)
            all_disbs = (await db.execute(d_stmt)).scalars().all()
            ref_title = f"Award {award.award_number}"

        total_disbursed = sum(d.amount_inr for d in all_disbs if d.payment_status in ("DISBURSED", "SUCCESS_CREDITED"))
        outstanding = max(Decimal("0.0"), total_awarded - total_disbursed)
        pct = (total_disbursed / total_awarded * Decimal("100.0")).quantize(Decimal("0.1")) if total_awarded > 0 else Decimal("0.0")

        total_ben = len(all_disbs)
        paid_ben = len([d for d in all_disbs if d.payment_status in ("DISBURSED", "SUCCESS_CREDITED")])
        pending_ben = total_ben - paid_ben

        return FinancialReconciliationSummary(
            reference_id=project_or_award_id,
            reference_title=ref_title,
            total_assessed_inr=total_assessed,
            total_awarded_inr=total_awarded,
            total_disbursed_inr=total_disbursed,
            outstanding_inr=outstanding,
            disbursement_percent=pct,
            total_beneficiaries_count=total_ben,
            disbursed_beneficiaries_count=paid_ben,
            pending_beneficiaries_count=pending_ben,
            reconciliation_status="BALANCED" if total_disbursed <= total_awarded else "DISCREPANCY_ALERT",
        )
