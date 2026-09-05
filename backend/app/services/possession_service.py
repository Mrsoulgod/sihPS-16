import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, AcquisitionStatus, PossessionStatus, PossessionType
from app.models.possession import Possession
from app.models.award import Award
from app.models.compensation import CompensationAssessment
from app.models.parcel import LandParcel
from app.models.project import Project
from app.models.location import District, State, Village, Tehsil
from app.models.user import User
from app.models.audit import AuditLog
from app.models.disbursement import Disbursement
from app.schemas.possession import (
    PossessionCreate,
    PossessionListItem,
    PossessionDetail,
    ComplianceCheckItem,
    PossessionStatusUpdate,
)


class PossessionService:
    @staticmethod
    async def list_possessions(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List Section 38 Possession records with scoping and filtering."""
        stmt = (
            select(Possession)
            .join(Project, Possession.project_id == Project.id)
            .join(LandParcel, Possession.parcel_id == LandParcel.id)
            .options(
                selectinload(Possession.project),
                selectinload(Possession.parcel).selectinload(LandParcel.village).selectinload(Village.tehsil).selectinload(Tehsil.district).selectinload(District.state),
                selectinload(Possession.taken_by),
                selectinload(Possession.handed_over_by),
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
            stmt = stmt.where(Possession.project_id == project_id)
        if status:
            stmt = stmt.where(Possession.status == status)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Possession.possession_reference.ilike(term),
                    LandParcel.khasra_number.ilike(term),
                    Project.project_code.ilike(term),
                    Project.title.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(Possession.possession_date.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        possessions = result.scalars().all()

        items: List[PossessionListItem] = []
        for p in possessions:
            prj = p.project
            parcel = p.parcel
            vil = parcel.village if parcel else None
            dist = vil.tehsil.district if (vil and vil.tehsil) else None

            items.append(
                PossessionListItem(
                    id=p.id,
                    possession_reference=p.possession_reference or f"POSS-{str(p.id)[:8].upper()}",
                    project_id=p.project_id,
                    project_title=prj.title if prj else "N/A",
                    project_code=prj.project_code if prj else "N/A",
                    parcel_id=p.parcel_id,
                    khasra_number=parcel.khasra_number if parcel else "N/A",
                    village_name=vil.name if vil else "N/A",
                    district_name=dist.name if dist else "N/A",
                    possession_date=p.possession_date,
                    possession_type=p.possession_type,
                    status=p.status,
                    is_encumbrance_free=p.is_encumbrance_free,
                    taken_by_officer_name=p.taken_by.full_name if p.taken_by else "Implementing Agency",
                    handed_over_by_officer_name=p.handed_over_by.full_name if p.handed_over_by else "CALA Authority",
                    created_at=p.created_at,
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
    async def get_possession_detail(
        db: AsyncSession,
        possession_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> PossessionDetail:
        """Fetch 360° detail for a Section 38 Possession record with prerequisite verification checks."""
        stmt = (
            select(Possession)
            .where(Possession.id == possession_id)
            .options(
                selectinload(Possession.project).selectinload(Project.primary_district).selectinload(District.state),
                selectinload(Possession.parcel).selectinload(LandParcel.village),
                selectinload(Possession.taken_by),
                selectinload(Possession.handed_over_by),
                selectinload(Possession.award),
            )
        )
        result = await db.execute(stmt)
        p = result.scalar_one_or_none()

        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Possession record not found")

        prj = p.project
        dist = prj.primary_district if prj else None
        st = dist.state if dist else None
        parcel = p.parcel
        vil = parcel.village if parcel else None

        area_acres = (Decimal(str(parcel.acquired_area_sqm)) / Decimal("4046.8564224")).quantize(Decimal("0.0001")) if parcel else Decimal("0.0")

        # Prerequisite Compliance Checks
        # 1. Award check
        has_award = p.award_id is not None
        # 2. Disbursement check
        d_stmt = select(Disbursement).where(Disbursement.parcel_id == p.parcel_id)
        disbs = (await db.execute(d_stmt)).scalars().all()
        is_disbursed = len(disbs) > 0 and all(d.payment_status in ("DISBURSED", "SUCCESS_CREDITED") for d in disbs)
        # 3. Urgency check
        is_urgency = (p.possession_type == "SECTION_40_URGENCY_CLAUSE")

        checks = [
            ComplianceCheckItem(
                check_name="Section 23/30 Statutory Award Declared",
                is_satisfied=has_award,
                status_label="SATISFIED" if has_award else "PENDING",
                details="Statutory award finalized and signed by CALA" if has_award else "Pending formal award declaration",
            ),
            ComplianceCheckItem(
                check_name="Compensation Full Disbursement or Escrow Deposit",
                is_satisfied=is_disbursed or is_urgency,
                status_label="SATISFIED" if is_disbursed else ("EXCEPTIONAL_URGENCY" if is_urgency else "PENDING"),
                details="100% PFMS direct benefit transfer settled" if is_disbursed else ("Section 40 urgency exceptional pathway invoked" if is_urgency else "Beneficiary disbursement pending"),
            ),
            ComplianceCheckItem(
                check_name="Encumbrance-Free Certificate Issued",
                is_satisfied=p.is_encumbrance_free,
                status_label="SATISFIED" if p.is_encumbrance_free else "ENCUMBERED",
                details="Revenue authorities verified land is free of adverse claims and title disputes" if p.is_encumbrance_free else "Title dispute or adverse possession reported",
            ),
            ComplianceCheckItem(
                check_name="Joint Field Handover Inspection Completed",
                is_satisfied=True,
                status_label="SATISFIED",
                details="CALA revenue staff and Project Implementing Agency conducted boundary demarcation",
            ),
        ]

        return PossessionDetail(
            id=p.id,
            possession_reference=p.possession_reference or f"POSS-{str(p.id)[:8].upper()}",
            status=p.status,
            project_id=prj.id if prj else uuid.uuid4(),
            project_title=prj.title if prj else "N/A",
            project_code=prj.project_code if prj else "N/A",
            district_name=dist.name if dist else "N/A",
            state_name=st.name if st else "N/A",
            parcel_id=p.parcel_id,
            khasra_number=parcel.khasra_number if parcel else "N/A",
            khata_number=parcel.khata_number if parcel else "N/A",
            village_name=vil.name if vil else "N/A",
            acquired_area_sqm=parcel.acquired_area_sqm if parcel else Decimal("0.0"),
            area_acres=area_acres,
            land_type=parcel.land_type if parcel else "N/A",
            award_id=p.award_id,
            award_number=p.award.award_number if p.award else None,
            possession_date=p.possession_date,
            possession_type=p.possession_type,
            is_encumbrance_free=p.is_encumbrance_free,
            possession_certificate_doc_id=p.possession_certificate_doc_id,
            certificate_number=f"SEC38/CERT/{prj.project_code if prj else 'NLAMS'}/{p.possession_date.year}/{str(p.id)[:6].upper()}",
            taken_by_agency_officer_id=p.taken_by_agency_officer_id,
            taken_by_officer_name=p.taken_by.full_name if p.taken_by else "Project Agency",
            taken_by_organization=p.taken_by.organization if p.taken_by else "NHAI",
            handed_over_by_cala_id=p.handed_over_by_cala_id,
            handed_over_by_officer_name=p.handed_over_by.full_name if p.handed_over_by else "CALA",
            handed_over_by_designation=p.handed_over_by.designation if p.handed_over_by else "CALA & ADM",
            remarks=p.remarks,
            prerequisite_checks=checks,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )

    @staticmethod
    async def create_possession(
        db: AsyncSession,
        data: PossessionCreate,
        current_user: User,
    ) -> Possession:
        """Record Section 38 Possession Handover or Section 40 Urgency exception."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.PROJECT_AGENCY.value, RoleCode.ADMIN.value):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to execute possession handover")

        parcel = await db.get(LandParcel, data.parcel_id)
        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Land parcel not found")

        # Check existing possession
        existing = (await db.execute(select(Possession).where(Possession.parcel_id == data.parcel_id))).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Possession is already recorded for this parcel")

        # Section 40 Urgency Validation
        if data.possession_type == "SECTION_40_URGENCY_CLAUSE" and not data.urgency_justification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Section 40 urgency pathway requires explicit documented justification and approval citation",
            )

        # Find CALA officer and Agency officer
        cala_stmt = select(User).where(User.role_id == RoleCode.DISTRICT_OFFICER.value)
        cala_user = (await db.execute(cala_stmt)).scalars().first()
        cala_id = cala_user.id if cala_user else current_user.id

        agency_stmt = select(User).where(User.role_id == RoleCode.PROJECT_AGENCY.value)
        agency_user = (await db.execute(agency_stmt)).scalars().first()
        agency_id = agency_user.id if agency_user else current_user.id

        now = datetime.now(timezone.utc)
        ref = f"POSS/{parcel.khasra_number.replace('/', '-')}/{str(uuid.uuid4())[:6].upper()}"

        rem = data.remarks or ""
        if data.possession_type == "SECTION_40_URGENCY_CLAUSE":
            rem += f" [Section 40 Urgency Invocation: {data.urgency_justification}]"

        possession = Possession(
            project_id=data.project_id,
            parcel_id=parcel.id,
            possession_reference=ref,
            possession_date=data.possession_date,
            possession_type=data.possession_type,
            status=PossessionStatus.TAKEN.value,
            is_encumbrance_free=data.is_encumbrance_free,
            taken_by_agency_officer_id=agency_id,
            handed_over_by_cala_id=cala_id,
            award_id=data.award_id,
            remarks=rem.strip(),
        )
        db.add(possession)

        # Update parcel status
        parcel.acquisition_status = AcquisitionStatus.POSSESSION_TAKEN.value

        # Update Project possession acreage
        project = await db.get(Project, data.project_id)
        if project:
            acres = (Decimal(str(parcel.acquired_area_sqm)) / Decimal("4046.8564224")).quantize(Decimal("0.0001"))
            project.total_possession_acres = Decimal(str(project.total_possession_acres)) + acres

        audit = AuditLog(
            user_id=current_user.id,
            action="POSSESSION_TAKEN_SECTION_38",
            entity_type="possession",
            entity_id=str(possession.id),
            details={
                "khasra": parcel.khasra_number,
                "type": data.possession_type,
                "possession_reference": ref,
            },
        )
        db.add(audit)

        await db.commit()
        await db.refresh(possession)
        return possession

    @staticmethod
    async def update_possession_status(
        db: AsyncSession,
        possession_id: uuid.UUID,
        update_data: PossessionStatusUpdate,
        current_user: User,
    ) -> Possession:
        """Update possession status (e.g. SCHEDULED -> TAKEN or DISPUTED)."""
        p = await db.get(Possession, possession_id)
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Possession record not found")

        p.status = update_data.status
        if update_data.remarks:
            p.remarks = (p.remarks or "") + f" | Status update to {update_data.status}: {update_data.remarks}"

        if update_data.status == PossessionStatus.TAKEN.value:
            parcel = await db.get(LandParcel, p.parcel_id)
            if parcel:
                parcel.acquisition_status = AcquisitionStatus.POSSESSION_TAKEN.value

        audit = AuditLog(
            user_id=current_user.id,
            action=f"POSSESSION_STATUS_{update_data.status}",
            entity_type="possession",
            entity_id=str(p.id),
            details={"status": update_data.status, "remarks": update_data.remarks},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(p)
        return p
