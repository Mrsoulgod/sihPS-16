import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode
from app.models.randr import RAndRScheme, AffectedFamily, RAndRAllotment
from app.models.project import Project
from app.models.parcel import LandParcel, LandOwner, ParcelOwnership
from app.models.compensation import CompensationAssessment
from app.models.award import Award
from app.models.disbursement import Disbursement
from app.models.possession import Possession
from app.models.location import District, State, Village, Tehsil
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import Alert
from app.schemas.randr import (
    RAndRSchemeCreate,
    RAndRSchemeUpdate,
    RAndRSchemeStatusUpdate,
    RAndRSchemeListItem,
    RAndRSchemeDetail,
    SchemeProgressKpis,
    AffectedFamilyCreate,
    AffectedFamilyUpdate,
    AffectedFamilyListItem,
    AffectedFamilyDetail,
    EligibilityAssessmentUpdate,
    RehabilitationStatusUpdate,
    AcquisitionTraceLinkage,
    RAndRAllotmentCreate,
    RAndRAllotmentUpdate,
    RAndRAllotmentItem,
)


class RandRService:
    # =========================================================================
    # R&R SCHEMES
    # =========================================================================
    @staticmethod
    async def list_schemes(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        scheme_type: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List R&R schemes with jurisdiction scoping, filtering, and aggregated family stats."""
        stmt = (
            select(RAndRScheme)
            .join(Project, RAndRScheme.project_id == Project.id)
            .options(
                selectinload(RAndRScheme.project).selectinload(Project.primary_district).selectinload(District.state),
                selectinload(RAndRScheme.families),
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

        # 2. Filters
        if project_id:
            stmt = stmt.where(RAndRScheme.project_id == project_id)
        if district_id:
            stmt = stmt.where(Project.primary_district_id == district_id)
        elif state_id:
            stmt = stmt.join(District, Project.primary_district_id == District.id).where(
                District.state_id == state_id
            )
        if status_filter:
            stmt = stmt.where(RAndRScheme.status == status_filter)
        if scheme_type:
            stmt = stmt.where(RAndRScheme.scheme_type == scheme_type)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    RAndRScheme.scheme_title.ilike(term),
                    RAndRScheme.scheme_reference.ilike(term),
                    RAndRScheme.resettlement_site_name.ilike(term),
                    Project.project_code.ilike(term),
                    Project.title.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(RAndRScheme.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        schemes = result.scalars().all()

        items: List[RAndRSchemeListItem] = []
        for s in schemes:
            prj = s.project
            st_name = prj.primary_district.state.name if (prj and prj.primary_district and prj.primary_district.state) else None
            dst_name = prj.primary_district.name if (prj and prj.primary_district) else None

            fams = s.families or []
            total_fams = len(fams)
            eligible_fams = sum(1 for f in fams if f.eligibility_status in ("ELIGIBLE", "APPROVED"))
            assisted_fams = sum(1 for f in fams if f.rehabilitation_status in ("PLOT_ALLOTTED", "SETTLED") or f.is_grant_disbursed)

            prog = round((assisted_fams / eligible_fams * 100.0), 1) if eligible_fams > 0 else 0.0

            items.append(
                RAndRSchemeListItem(
                    id=s.id,
                    project_id=s.project_id,
                    project_code=prj.project_code if prj else None,
                    project_title=prj.title if prj else None,
                    scheme_reference=s.scheme_reference,
                    scheme_title=s.scheme_title,
                    scheme_type=s.scheme_type,
                    resettlement_site_name=s.resettlement_site_name,
                    state_name=st_name,
                    district_name=dst_name,
                    total_plots_planned=s.total_plots_planned,
                    total_plots_allotted=s.total_plots_allotted,
                    sanctioned_budget_cr=s.sanctioned_budget_cr,
                    spent_budget_cr=s.spent_budget_cr,
                    status=s.status,
                    target_completion_date=s.target_completion_date,
                    total_families_count=total_fams,
                    eligible_families_count=eligible_fams,
                    assisted_families_count=assisted_fams,
                    progress_percent=prog,
                    created_at=s.created_at,
                )
            )

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total_records,
                "total_pages": (total_records + page_size - 1) // page_size if page_size > 0 else 1,
            },
        }

    @staticmethod
    async def get_scheme_detail(
        db: AsyncSession,
        scheme_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> RAndRSchemeDetail:
        """Get 360° R&R scheme detail with covered families, allotments, and progress KPIs."""
        stmt = (
            select(RAndRScheme)
            .where(RAndRScheme.id == scheme_id)
            .options(
                selectinload(RAndRScheme.project).selectinload(Project.primary_district).selectinload(District.state),
                selectinload(RAndRScheme.approved_by),
                selectinload(RAndRScheme.families).selectinload(AffectedFamily.parcel).selectinload(LandParcel.village),
                selectinload(RAndRScheme.families).selectinload(AffectedFamily.allotments),
                selectinload(RAndRScheme.allotments).selectinload(RAndRAllotment.family),
            )
        )
        res = await db.execute(stmt)
        scheme = res.scalar_one_or_none()
        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"R&R Scheme '{scheme_id}' not found.")

        prj = scheme.project
        st_name = prj.primary_district.state.name if (prj and prj.primary_district and prj.primary_district.state) else None
        dst_name = prj.primary_district.name if (prj and prj.primary_district) else None

        fams = scheme.families or []
        total_fams = len(fams)
        eligible_fams = sum(1 for f in fams if f.eligibility_status in ("ELIGIBLE", "APPROVED"))
        approved_fams = sum(1 for f in fams if f.eligibility_status == "APPROVED")
        allocated_fams = sum(1 for f in fams if f.rehabilitation_status in ("PLOT_ALLOTTED", "SETTLED") or f.allotted_plot_number)
        completed_fams = sum(1 for f in fams if f.rehabilitation_status == "SETTLED")
        completion_pct = round((completed_fams / eligible_fams * 100.0), 1) if eligible_fams > 0 else 0.0

        kpis = SchemeProgressKpis(
            total_affected_families=total_fams,
            eligible_families=eligible_fams,
            approved_families=approved_fams,
            allocated_families=allocated_fams,
            completed_families=completed_fams,
            completion_percent=completion_pct,
        )

        # Build covered families list
        family_items: List[AffectedFamilyListItem] = []
        for f in fams:
            pcl = f.parcel
            family_items.append(
                AffectedFamilyListItem(
                    id=f.id,
                    family_reference_id=f.family_reference_id,
                    head_of_family_name=f.head_of_family_name,
                    family_type=f.family_type,
                    displacement_category=f.displacement_category,
                    social_category=f.social_category,
                    village_name=f.village_name or (pcl.village.name if pcl and pcl.village else None),
                    khasra_number=pcl.khasra_number if pcl else None,
                    parcel_id=f.parcel_id,
                    project_id=scheme.project_id,
                    project_code=prj.project_code,
                    project_title=prj.title,
                    scheme_id=scheme.id,
                    scheme_title=scheme.scheme_title,
                    scheme_reference=scheme.scheme_reference,
                    eligibility_status=f.eligibility_status,
                    eligibility_category=f.eligibility_category,
                    rehabilitation_status=f.rehabilitation_status,
                    allotted_plot_number=f.allotted_plot_number,
                    subsistence_grant_inr=f.subsistence_grant_inr,
                    is_grant_disbursed=f.is_grant_disbursed,
                    allotments_count=len(f.allotments) if hasattr(f, "allotments") and f.allotments else 0,
                    created_at=f.created_at,
                )
            )

        # Build allotments list
        allotment_items: List[RAndRAllotmentItem] = []
        for a in (scheme.allotments or []):
            allotment_items.append(
                RAndRAllotmentItem(
                    id=a.id,
                    family_id=a.family_id,
                    family_reference_id=a.family.family_reference_id if a.family else None,
                    head_of_family_name=a.family.head_of_family_name if a.family else None,
                    scheme_id=scheme.id,
                    scheme_title=scheme.scheme_title,
                    allotment_reference=a.allotment_reference,
                    entitlement_category=a.entitlement_category,
                    allotment_type=a.allotment_type,
                    asset_identifier=a.asset_identifier,
                    allotment_order_no=a.allotment_order_no,
                    allotment_date=a.allotment_date,
                    delivery_date=a.delivery_date,
                    allocated_value_inr=a.allocated_value_inr,
                    responsible_authority=a.responsible_authority,
                    status=a.status,
                    remarks=a.remarks,
                    created_at=a.created_at,
                )
            )

        return RAndRSchemeDetail(
            id=scheme.id,
            project_id=scheme.project_id,
            project_code=prj.project_code,
            project_title=prj.title,
            scheme_reference=scheme.scheme_reference,
            scheme_title=scheme.scheme_title,
            scheme_type=scheme.scheme_type,
            resettlement_site_name=scheme.resettlement_site_name,
            state_name=st_name,
            district_name=dst_name,
            total_plots_planned=scheme.total_plots_planned,
            total_plots_allotted=scheme.total_plots_allotted,
            sanctioned_budget_cr=scheme.sanctioned_budget_cr,
            spent_budget_cr=scheme.spent_budget_cr,
            status=scheme.status,
            target_completion_date=scheme.target_completion_date,
            approval_date=scheme.approval_date,
            approved_by_user=scheme.approved_by.full_name if scheme.approved_by else None,
            remarks=scheme.remarks,
            kpis=kpis,
            families=family_items,
            allotments=allotment_items,
            created_at=scheme.created_at,
            updated_at=scheme.updated_at,
        )

    @staticmethod
    async def create_scheme(
        db: AsyncSession,
        payload: RAndRSchemeCreate,
        current_user: User,
    ) -> RAndRScheme:
        """Create a new R&R Scheme under a valid acquisition project."""
        project = await db.get(Project, payload.project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project '{payload.project_id}' not found.")

        # Generate scheme reference if not provided
        ref = payload.scheme_reference
        if not ref:
            count = (await db.execute(select(func.count(RAndRScheme.id)))).scalar_one() + 1
            ref = f"RNR/{datetime.now().year}/{count:03d}"

        scheme = RAndRScheme(
            project_id=payload.project_id,
            scheme_reference=ref,
            scheme_title=payload.scheme_title,
            scheme_type=payload.scheme_type,
            resettlement_site_name=payload.resettlement_site_name,
            total_plots_planned=payload.total_plots_planned,
            total_plots_allotted=0,
            sanctioned_budget_cr=payload.sanctioned_budget_cr,
            spent_budget_cr=Decimal("0.0"),
            status="APPROVED",
            target_completion_date=payload.target_completion_date,
            approval_date=date.today(),
            approved_by_user_id=current_user.id,
            remarks=payload.remarks,
        )
        db.add(scheme)
        await db.flush()

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="CREATE_RANDR_SCHEME",
            entity_name="RAndRScheme",
            entity_id=str(scheme.id),
            new_values={
                "scheme_reference": scheme.scheme_reference,
                "scheme_title": scheme.scheme_title,
                "project_id": str(scheme.project_id),
                "sanctioned_budget_cr": str(scheme.sanctioned_budget_cr),
            },
        )
        db.add(audit)
        await db.commit()
        await db.refresh(scheme)
        return scheme

    @staticmethod
    async def update_scheme_status(
        db: AsyncSession,
        scheme_id: uuid.UUID,
        payload: RAndRSchemeStatusUpdate,
        current_user: User,
    ) -> RAndRScheme:
        """Update R&R scheme lifecycle status."""
        scheme = await db.get(RAndRScheme, scheme_id)
        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"R&R Scheme '{scheme_id}' not found.")

        old_status = scheme.status
        scheme.status = payload.status
        if payload.remarks:
            scheme.remarks = payload.remarks

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="UPDATE_SCHEME_STATUS",
            entity_name="RAndRScheme",
            entity_id=str(scheme.id),
            old_values={"status": old_status},
            new_values={"status": scheme.status, "remarks": payload.remarks},
        )
        db.add(audit)
        await db.commit()
        await db.refresh(scheme)
        return scheme

    # =========================================================================
    # AFFECTED FAMILIES & TRACEABILITY
    # =========================================================================
    @staticmethod
    async def list_affected_families(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        scheme_id: Optional[uuid.UUID] = None,
        district_id: Optional[str] = None,
        eligibility_status: Optional[str] = None,
        rehabilitation_status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List affected families with scoping, parcel references, and eligibility filters."""
        stmt = (
            select(AffectedFamily)
            .join(RAndRScheme, AffectedFamily.scheme_id == RAndRScheme.id)
            .join(Project, RAndRScheme.project_id == Project.id)
            .options(
                selectinload(AffectedFamily.scheme).selectinload(RAndRScheme.project),
                selectinload(AffectedFamily.parcel),
                selectinload(AffectedFamily.allotments),
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

        # 2. Filters
        if project_id:
            stmt = stmt.where(RAndRScheme.project_id == project_id)
        if scheme_id:
            stmt = stmt.where(AffectedFamily.scheme_id == scheme_id)
        if district_id:
            stmt = stmt.where(Project.primary_district_id == district_id)
        if eligibility_status:
            stmt = stmt.where(AffectedFamily.eligibility_status == eligibility_status)
        if rehabilitation_status:
            stmt = stmt.where(AffectedFamily.rehabilitation_status == rehabilitation_status)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    AffectedFamily.head_of_family_name.ilike(term),
                    AffectedFamily.family_reference_id.ilike(term),
                    AffectedFamily.village_name.ilike(term),
                    RAndRScheme.scheme_title.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(AffectedFamily.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        families = result.scalars().all()

        items: List[AffectedFamilyListItem] = []
        for f in families:
            scm = f.scheme
            prj = scm.project if scm else None
            pcl = f.parcel

            items.append(
                AffectedFamilyListItem(
                    id=f.id,
                    family_reference_id=f.family_reference_id,
                    head_of_family_name=f.head_of_family_name,
                    family_type=f.family_type,
                    displacement_category=f.displacement_category,
                    social_category=f.social_category,
                    village_name=f.village_name,
                    khasra_number=pcl.khasra_number if pcl else None,
                    parcel_id=f.parcel_id,
                    project_id=scm.project_id if scm else prj.id,
                    project_code=prj.project_code if prj else None,
                    project_title=prj.title if prj else None,
                    scheme_id=f.scheme_id,
                    scheme_title=scm.scheme_title if scm else None,
                    scheme_reference=scm.scheme_reference if scm else None,
                    eligibility_status=f.eligibility_status,
                    eligibility_category=f.eligibility_category,
                    rehabilitation_status=f.rehabilitation_status,
                    allotted_plot_number=f.allotted_plot_number,
                    subsistence_grant_inr=f.subsistence_grant_inr,
                    is_grant_disbursed=f.is_grant_disbursed,
                    allotments_count=len(f.allotments) if hasattr(f, "allotments") and f.allotments else 0,
                    created_at=f.created_at,
                )
            )

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_records": total_records,
                "total_pages": (total_records + page_size - 1) // page_size if page_size > 0 else 1,
            },
        }

    @staticmethod
    async def get_affected_family_detail(
        db: AsyncSession,
        family_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> AffectedFamilyDetail:
        """
        Get full 360° detail of an affected family with complete end-to-end acquisition trace:
        Family -> Project -> Land Parcel -> Ownership -> Compensation -> Award -> Disbursement -> Possession -> R&R Scheme.
        """
        stmt = (
            select(AffectedFamily)
            .where(AffectedFamily.id == family_id)
            .options(
                selectinload(AffectedFamily.scheme).selectinload(RAndRScheme.project),
                selectinload(AffectedFamily.owner),
                selectinload(AffectedFamily.parcel).selectinload(LandParcel.compensation),
                selectinload(AffectedFamily.parcel).selectinload(LandParcel.possession),
                selectinload(AffectedFamily.parcel).selectinload(LandParcel.disbursements),
                selectinload(AffectedFamily.allotments).selectinload(RAndRAllotment.scheme),
            )
        )
        res = await db.execute(stmt)
        family = res.scalar_one_or_none()
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Affected Family '{family_id}' not found.")

        scheme = family.scheme
        prj = scheme.project if scheme else None
        parcel = family.parcel
        owner = family.owner

        # Build 360° Acquisition Trace Linkage
        trace: Optional[AcquisitionTraceLinkage] = None
        if prj:
            comp = parcel.compensation if parcel else None
            poss = parcel.possession if parcel else None
            disb_list = parcel.disbursements if parcel else []
            latest_disb = disb_list[0] if disb_list else None

            # Find award if compensation is linked
            award_obj = None
            if comp and comp.award_id:
                award_obj = await db.get(Award, comp.award_id)

            trace = AcquisitionTraceLinkage(
                project_id=prj.id,
                project_code=prj.project_code,
                project_title=prj.title,
                parcel_id=parcel.id if parcel else None,
                khasra_number=parcel.khasra_number if parcel else None,
                khata_number=parcel.khata_number if parcel else None,
                parcel_area_sqm=parcel.acquired_area_sqm if parcel else None,
                parcel_status=parcel.acquisition_status if parcel else None,
                owner_id=owner.id if owner else None,
                owner_name=owner.full_name if owner else None,
                compensation_id=comp.id if comp else None,
                compensation_reference=comp.assessment_reference if comp else None,
                compensation_total_inr=comp.total_compensation_inr if comp else None,
                compensation_status=comp.status if comp else None,
                award_id=award_obj.id if award_obj else None,
                award_number=award_obj.award_number if award_obj else None,
                award_status=award_obj.status if award_obj else None,
                disbursement_id=latest_disb.id if latest_disb else None,
                disbursement_reference=latest_disb.disbursement_reference if latest_disb else None,
                disbursement_status=latest_disb.payment_status if latest_disb else None,
                disbursement_amount_inr=latest_disb.amount_inr if latest_disb else None,
                possession_id=poss.id if poss else None,
                possession_reference=poss.possession_reference if poss else None,
                possession_status=poss.status if poss else None,
            )

        # Allotments list
        allotment_items: List[RAndRAllotmentItem] = []
        for a in (family.allotments or []):
            allotment_items.append(
                RAndRAllotmentItem(
                    id=a.id,
                    family_id=family.id,
                    family_reference_id=family.family_reference_id,
                    head_of_family_name=family.head_of_family_name,
                    scheme_id=scheme.id if scheme else None,
                    scheme_title=scheme.scheme_title if scheme else None,
                    allotment_reference=a.allotment_reference,
                    entitlement_category=a.entitlement_category,
                    allotment_type=a.allotment_type,
                    asset_identifier=a.asset_identifier,
                    allotment_order_no=a.allotment_order_no,
                    allotment_date=a.allotment_date,
                    delivery_date=a.delivery_date,
                    allocated_value_inr=a.allocated_value_inr,
                    responsible_authority=a.responsible_authority,
                    status=a.status,
                    remarks=a.remarks,
                    created_at=a.created_at,
                )
            )

        return AffectedFamilyDetail(
            id=family.id,
            family_reference_id=family.family_reference_id,
            scheme_id=family.scheme_id,
            scheme_title=scheme.scheme_title if scheme else None,
            scheme_reference=scheme.scheme_reference if scheme else None,
            resettlement_site_name=scheme.resettlement_site_name if scheme else None,
            parcel_id=family.parcel_id,
            land_owner_id=family.land_owner_id,
            head_of_family_name=family.head_of_family_name,
            village_name=family.village_name,
            family_type=family.family_type,
            displacement_category=family.displacement_category,
            social_category=family.social_category,
            family_members_count=family.family_members_count,
            contact_masked=family.contact_masked,
            entitled_plot_sqyd=family.entitled_plot_sqyd,
            allotted_plot_number=family.allotted_plot_number,
            subsistence_grant_inr=family.subsistence_grant_inr,
            transportation_allowance_inr=family.transportation_allowance_inr,
            one_time_resettlement_allowance_inr=family.one_time_resettlement_allowance_inr,
            is_grant_disbursed=family.is_grant_disbursed,
            eligibility_status=family.eligibility_status,
            eligibility_category=family.eligibility_category,
            eligibility_assessment_date=family.eligibility_assessment_date,
            assessing_authority=family.assessing_authority,
            eligibility_basis=family.eligibility_basis,
            eligibility_remarks=family.eligibility_remarks,
            rehabilitation_status=family.rehabilitation_status,
            acquisition_trace=trace,
            allotments=allotment_items,
            created_at=family.created_at,
            updated_at=family.updated_at,
        )

    @staticmethod
    async def create_affected_family(
        db: AsyncSession,
        payload: AffectedFamilyCreate,
        current_user: User,
    ) -> AffectedFamily:
        """Enumerate and register an affected family under an R&R scheme."""
        scheme = await db.get(RAndRScheme, payload.scheme_id)
        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme '{payload.scheme_id}' not found.")

        # Generate fictional reference ID if not provided (e.g. AF-0019)
        ref = payload.family_reference_id
        if not ref:
            count = (await db.execute(select(func.count(AffectedFamily.id)))).scalar_one() + 1
            ref = f"AF-{count:04d}"

        family = AffectedFamily(
            scheme_id=payload.scheme_id,
            family_reference_id=ref,
            parcel_id=payload.parcel_id,
            land_owner_id=payload.land_owner_id,
            head_of_family_name=payload.head_of_family_name,
            village_name=payload.village_name,
            family_type=payload.family_type,
            displacement_category=payload.displacement_category,
            social_category=payload.social_category,
            family_members_count=payload.family_members_count,
            contact_masked=payload.contact_masked or "+91 98XXX X4200",
            entitled_plot_sqyd=payload.entitled_plot_sqyd,
            allotted_plot_number=payload.allotted_plot_number,
            subsistence_grant_inr=payload.subsistence_grant_inr,
            transportation_allowance_inr=payload.transportation_allowance_inr,
            one_time_resettlement_allowance_inr=payload.one_time_resettlement_allowance_inr,
            is_grant_disbursed=payload.is_grant_disbursed,
            eligibility_status=payload.eligibility_status,
            eligibility_category=payload.eligibility_category,
            eligibility_assessment_date=payload.eligibility_assessment_date or date.today(),
            assessing_authority=payload.assessing_authority or "Competent Authority for Land Acquisition (CALA)",
            eligibility_basis=payload.eligibility_basis,
            eligibility_remarks=payload.eligibility_remarks,
            rehabilitation_status=payload.rehabilitation_status,
        )
        db.add(family)
        await db.flush()

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="ENUMERATE_AFFECTED_FAMILY",
            entity_name="AffectedFamily",
            entity_id=str(family.id),
            new_values={
                "family_reference_id": family.family_reference_id,
                "head_of_family_name": family.head_of_family_name,
                "scheme_id": str(family.scheme_id),
                "eligibility_status": family.eligibility_status,
            },
        )
        db.add(audit)
        await db.commit()
        await db.refresh(family)
        return family

    @staticmethod
    async def update_eligibility(
        db: AsyncSession,
        family_id: uuid.UUID,
        payload: EligibilityAssessmentUpdate,
        current_user: User,
    ) -> AffectedFamily:
        """Update Configurable R&R Eligibility Assessment with mandatory audit logging."""
        family = await db.get(AffectedFamily, family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Affected Family '{family_id}' not found.")

        old_values = {
            "eligibility_status": family.eligibility_status,
            "eligibility_category": family.eligibility_category,
            "eligibility_remarks": family.eligibility_remarks,
        }

        family.eligibility_status = payload.eligibility_status
        if payload.eligibility_category:
            family.eligibility_category = payload.eligibility_category
        family.eligibility_assessment_date = payload.eligibility_assessment_date or date.today()
        if payload.assessing_authority:
            family.assessing_authority = payload.assessing_authority
        if payload.eligibility_basis:
            family.eligibility_basis = payload.eligibility_basis
        if payload.eligibility_remarks:
            family.eligibility_remarks = payload.eligibility_remarks

        # Update rehabilitation status if approved
        if payload.eligibility_status == "APPROVED" and family.rehabilitation_status == "SURVEYED":
            family.rehabilitation_status = "SCHEME_APPROVED"

        new_values = {
            "eligibility_status": family.eligibility_status,
            "eligibility_category": family.eligibility_category,
            "eligibility_remarks": family.eligibility_remarks,
            "assessing_authority": family.assessing_authority,
        }

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="ASSESS_RR_ELIGIBILITY",
            entity_name="AffectedFamily",
            entity_id=str(family.id),
            old_values=old_values,
            new_values=new_values,
        )
        db.add(audit)

        # Trigger alert if disputed
        if payload.eligibility_status == "DISPUTED":
            scheme = await db.get(RAndRScheme, family.scheme_id)
            alert = Alert(
                project_id=scheme.project_id if scheme else None,
                severity="WARNING",
                category="STATUTORY_DEADLINE",
                title=f"R&R Eligibility Disputed: {family.family_reference_id}",
                message=f"Family {family.family_reference_id} ({family.head_of_family_name}) eligibility has been disputed. Reason: {payload.eligibility_remarks or 'None provided'}",
                target_role=RoleCode.DISTRICT_OFFICER.value,
            )
            db.add(alert)

        await db.commit()
        await db.refresh(family)
        return family

    @staticmethod
    async def update_rehabilitation_status(
        db: AsyncSession,
        family_id: uuid.UUID,
        payload: RehabilitationStatusUpdate,
        current_user: User,
    ) -> AffectedFamily:
        """Update rehabilitation lifecycle status."""
        family = await db.get(AffectedFamily, family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Affected Family '{family_id}' not found.")

        old_status = family.rehabilitation_status
        family.rehabilitation_status = payload.rehabilitation_status

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="UPDATE_REHABILITATION_STATUS",
            entity_name="AffectedFamily",
            entity_id=str(family.id),
            old_values={"rehabilitation_status": old_status},
            new_values={"rehabilitation_status": family.rehabilitation_status, "remarks": payload.remarks},
        )
        db.add(audit)
        await db.commit()
        await db.refresh(family)
        return family

    # =========================================================================
    # R&R ALLOTMENTS / ASSISTANCE
    # =========================================================================
    @staticmethod
    async def create_allotment(
        db: AsyncSession,
        payload: RAndRAllotmentCreate,
        current_user: User,
    ) -> RAndRAllotment:
        """Record an R&R allotment or assistance delivery for an affected family."""
        family = await db.get(AffectedFamily, payload.family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Affected Family '{payload.family_id}' not found.")

        scheme_id = payload.scheme_id or family.scheme_id
        scheme = await db.get(RAndRScheme, scheme_id)
        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme '{scheme_id}' not found.")

        # Generate allotment reference if missing
        ref = payload.allotment_reference
        if not ref:
            count = (await db.execute(select(func.count(RAndRAllotment.id)))).scalar_one() + 1
            ref = f"ALLOT/{datetime.now().year}/{count:03d}"

        allotment = RAndRAllotment(
            family_id=payload.family_id,
            scheme_id=scheme_id,
            allotment_reference=ref,
            entitlement_category=payload.entitlement_category,
            allotment_type=payload.allotment_type,
            asset_identifier=payload.asset_identifier,
            allotment_order_no=payload.allotment_order_no,
            allotment_date=payload.allotment_date,
            delivery_date=payload.delivery_date,
            allocated_value_inr=payload.allocated_value_inr,
            responsible_authority=payload.responsible_authority or "CALA Land Acquisition Officer",
            status=payload.status,
            remarks=payload.remarks,
        )
        db.add(allotment)

        # Update family status if plot allotment
        if payload.allotment_type == "PLOT" and payload.status in ("ALLOTTED", "DELIVERED", "COMPLETED"):
            family.allotted_plot_number = payload.asset_identifier
            if family.rehabilitation_status in ("SURVEYED", "SCHEME_APPROVED"):
                family.rehabilitation_status = "PLOT_ALLOTTED"
            # Increment scheme allotted plots
            scheme.total_plots_allotted = (scheme.total_plots_allotted or 0) + 1

        # Increment scheme spent budget
        if payload.allocated_value_inr > 0:
            spent_cr = Decimal(str(scheme.spent_budget_cr or 0)) + (Decimal(str(payload.allocated_value_inr)) / Decimal("10000000"))
            scheme.spent_budget_cr = round(spent_cr, 2)

        # Audit Log
        audit = AuditLog(
            user_id=current_user.id,
            action="RECORD_RR_ALLOTMENT",
            entity_name="RAndRAllotment",
            entity_id=str(allotment.id),
            new_values={
                "allotment_reference": allotment.allotment_reference,
                "family_id": str(allotment.family_id),
                "allotment_type": allotment.allotment_type,
                "asset_identifier": allotment.asset_identifier,
                "allocated_value_inr": str(allotment.allocated_value_inr),
            },
        )
        db.add(audit)
        await db.commit()
        await db.refresh(allotment)
        return allotment
