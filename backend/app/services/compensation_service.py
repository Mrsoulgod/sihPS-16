import uuid
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.enums import RoleCode, AcquisitionStatus, AssessmentStatus
from app.models.compensation import CompensationAssessment, AssetValuation
from app.models.parcel import LandParcel, LandOwner, ParcelOwnership, FieldVerification
from app.models.project import Project
from app.models.location import Village, Tehsil, District, State
from app.models.user import User
from app.models.audit import AuditLog
from app.models.alert import Alert
from app.schemas.compensation import (
    CompensationCalculationRequest,
    CompensationCalculationBreakdown,
    StatutoryComponentDetail,
    CompensationAssessmentListItem,
    CompensationAssessmentDetail,
    AssetValuationItem,
    MaskedOwnerItem,
)


def mask_identifier(val: Optional[str], keep_end: int = 4) -> str:
    if not val:
        return "Not Provided"
    s = str(val).strip()
    if len(s) <= keep_end:
        return "••••"
    return "•" * (len(s) - keep_end) + s[-keep_end:]


class CompensationService:
    @staticmethod
    def calculate_configurable_breakdown(
        area_sqm: Decimal,
        circle_rate_per_sqm: Decimal,
        multiplier_factor: Decimal = Decimal("1.25"),
        assets_value_inr: Decimal = Decimal("0.0"),
        solatium_percent: Decimal = Decimal("100.0"),
        statutory_additional_rate_percent: Decimal = Decimal("12.0"),
        sec11_publication_date: Optional[date] = None,
        award_date: Optional[date] = None,
    ) -> CompensationCalculationBreakdown:
        """
        Pure calculation engine adhering strictly to the Configurable Compensation Assessment framework.
        """
        area = Decimal(str(area_sqm))
        rate = Decimal(str(circle_rate_per_sqm))
        mult = Decimal(str(multiplier_factor))
        assets = Decimal(str(assets_value_inr))
        sol_pct = Decimal(str(solatium_percent))
        stat_pct = Decimal(str(statutory_additional_rate_percent))

        # 1. Market / Base Land Value
        base_land_value = (area * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 2. Applicable Land Value Factors (Rural/Urban distance factor effect)
        market_value_land = (base_land_value * mult).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        factor_addition = market_value_land - base_land_value

        # 3. Applicable Solatium (100% on Market Value of Land + Assets)
        solatium_base = market_value_land + assets
        solatium_amount = (solatium_base * (sol_pct / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 4. Applicable Statutory Additional Amount (Condition-based 12% p.a. from Sec 11 to Award)
        if sec11_publication_date and award_date and award_date > sec11_publication_date:
            days = (award_date - sec11_publication_date).days
        else:
            days = 180  # Configurable statutory demo benchmark window (approx. 6 months)

        additional_statutory_amount = (
            market_value_land * (stat_pct / Decimal("100.0")) * (Decimal(days) / Decimal("365.0"))
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 5. Configurable Compensation Assessment Total
        total_assessed = (market_value_land + assets + solatium_amount + additional_statutory_amount).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        components = [
            StatutoryComponentDetail(
                component_name="Base Land Value",
                statutory_basis="Determined base circle rate per square meter × acquired land extent",
                amount_inr=base_land_value,
                formula_description=f"{area:,.2f} sq.m × ₹{rate:,.2f}/sq.m",
            ),
            StatutoryComponentDetail(
                component_name="Applicable Land Value Factor",
                statutory_basis="Configurable rural/urban location multiplier factor",
                amount_inr=factor_addition,
                percentage_or_rate=mult,
                formula_description=f"Base Land Value × ({mult:.2f}x multiplier - 1.00)",
            ),
            StatutoryComponentDetail(
                component_name="Asset / Structure Valuation",
                statutory_basis="Itemized field verification & net replacement value for buildings, trees & wells",
                amount_inr=assets,
                formula_description="Sum of itemized net asset valuations post depreciation",
            ),
            StatutoryComponentDetail(
                component_name="Applicable Statutory Additional Amount",
                statutory_basis=f"Statutory condition-based {stat_pct:.1f}% p.a. computed for {days} statutory days (Sec 11 to Award)",
                amount_inr=additional_statutory_amount,
                percentage_or_rate=stat_pct,
                formula_description=f"Market Land Value × {stat_pct:.1f}% p.a. × ({days} days / 365)",
            ),
            StatutoryComponentDetail(
                component_name="Applicable Solatium",
                statutory_basis=f"Statutory solatium grant at {sol_pct:.0f}% on combined Land Market Value + Asset Value",
                amount_inr=solatium_amount,
                percentage_or_rate=sol_pct,
                formula_description=f"(₹{market_value_land:,.2f} + ₹{assets:,.2f}) × {sol_pct:.0f}%",
            ),
        ]

        return CompensationCalculationBreakdown(
            area_sqm=area,
            circle_rate_per_sqm=rate,
            base_land_value_inr=base_land_value,
            multiplier_factor=mult,
            market_value_land_inr=market_value_land,
            assets_value_inr=assets,
            solatium_rate_percent=sol_pct,
            solatium_inr=solatium_amount,
            statutory_additional_rate_percent=stat_pct,
            statutory_period_days=days,
            additional_market_value_inr=additional_statutory_amount,
            total_compensation_inr=total_assessed,
            components=components,
            calculation_summary="Configurable Compensation Assessment determined with transparent statutory breakdown components.",
        )

    @staticmethod
    async def list_assessments(
        db: AsyncSession,
        current_user: Optional[User] = None,
        project_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List compensation assessments with RBAC jurisdiction scoping and filtering."""
        stmt = (
            select(CompensationAssessment)
            .join(LandParcel, CompensationAssessment.parcel_id == LandParcel.id)
            .join(Project, LandParcel.project_id == Project.id)
            .join(Village, LandParcel.village_id == Village.id)
            .join(Tehsil, Village.tehsil_id == Tehsil.id)
            .join(District, Tehsil.district_id == District.id)
            .join(State, District.state_id == State.id)
            .options(
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.project),
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.village).selectinload(Village.tehsil).selectinload(Tehsil.district).selectinload(District.state),
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(CompensationAssessment.assessing_officer),
            )
        )

        user_role = current_user.role_id if current_user else None

        # 1. RBAC Jurisdiction Scoping
        if current_user and user_role:
            if user_role in (RoleCode.DISTRICT_OFFICER.value, RoleCode.FIELD_OFFICER.value) and current_user.district_id:
                stmt = stmt.where(District.id == current_user.district_id)
            elif user_role == RoleCode.STATE_OFFICER.value and current_user.state_id:
                stmt = stmt.where(State.id == current_user.state_id)
            elif user_role == RoleCode.PROJECT_AGENCY.value and current_user.organization:
                stmt = stmt.where(Project.implementing_agency.ilike(f"%{current_user.organization}%"))

        # 2. Query Filters
        if project_id:
            stmt = stmt.where(LandParcel.project_id == project_id)
        if status:
            stmt = stmt.where(CompensationAssessment.status == status)
        if district_id:
            stmt = stmt.where(District.id == district_id)
        elif state_id:
            stmt = stmt.where(State.id == state_id)

        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    CompensationAssessment.assessment_reference.ilike(term),
                    LandParcel.khasra_number.ilike(term),
                    Project.project_code.ilike(term),
                    Project.title.ilike(term),
                    Village.name.ilike(term),
                )
            )

        # Count total records
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_records = (await db.execute(count_stmt)).scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        stmt = stmt.order_by(CompensationAssessment.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        assessments = result.scalars().all()

        items: List[CompensationAssessmentListItem] = []
        for a in assessments:
            parcel = a.parcel
            prj = parcel.project if parcel else None
            vil = parcel.village if parcel else None
            teh = vil.tehsil if vil else None
            dist = teh.district if teh else None
            st = dist.state if dist else None

            owner_names = [o.owner.full_name for o in parcel.ownerships if o.owner] if parcel and parcel.ownerships else []

            items.append(
                CompensationAssessmentListItem(
                    id=a.id,
                    assessment_reference=a.assessment_reference or f"COMP-{str(a.id)[:8].upper()}",
                    project_id=prj.id if prj else uuid.uuid4(),
                    project_title=prj.title if prj else "N/A",
                    parcel_id=parcel.id if parcel else uuid.uuid4(),
                    khasra_number=parcel.khasra_number if parcel else "N/A",
                    village_name=vil.name if vil else "N/A",
                    district_name=dist.name if dist else "N/A",
                    state_name=st.name if st else "N/A",
                    owner_names=owner_names,
                    acquired_area_sqm=parcel.acquired_area_sqm if parcel else Decimal("0.0"),
                    total_compensation_inr=a.total_compensation_inr,
                    status=a.status,
                    is_approved_by_cala=a.is_approved_by_cala,
                    approval_date=a.approval_date,
                    assessing_officer_name=a.assessing_officer.full_name if a.assessing_officer else None,
                    created_at=a.created_at,
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
    async def get_assessment_detail(
        db: AsyncSession,
        assessment_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> CompensationAssessmentDetail:
        """Fetch 360° detail for a Configurable Compensation Assessment with masked owner data."""
        stmt = (
            select(CompensationAssessment)
            .where(CompensationAssessment.id == assessment_id)
            .options(
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.project),
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.village).selectinload(Village.tehsil).selectinload(Tehsil.district).selectinload(District.state),
                selectinload(CompensationAssessment.parcel).selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(CompensationAssessment.asset_valuations),
                selectinload(CompensationAssessment.assessing_officer),
                selectinload(CompensationAssessment.award),
            )
        )
        result = await db.execute(stmt)
        a = result.scalar_one_or_none()

        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compensation assessment not found")

        parcel = a.parcel
        prj = parcel.project if parcel else None
        vil = parcel.village if parcel else None
        teh = vil.tehsil if vil else None
        dist = teh.district if teh else None
        st = dist.state if dist else None

        # Masked owner list
        masked_owners: List[MaskedOwnerItem] = []
        if parcel and parcel.ownerships:
            for po in parcel.ownerships:
                if po.owner:
                    masked_owners.append(
                        MaskedOwnerItem(
                            id=po.owner.id,
                            full_name=po.owner.full_name,
                            relative_name=po.owner.relative_name,
                            ownership_share_percent=po.ownership_share_percent,
                            masked_bank_account=mask_identifier(po.owner.bank_account_no, 4),
                            masked_bank_ifsc=mask_identifier(po.owner.bank_ifsc_code, 4),
                            is_kyc_verified=po.owner.is_kyc_verified,
                        )
                    )

        # Asset valuations list
        assets_list = [
            AssetValuationItem(
                id=av.id,
                assessment_id=av.assessment_id,
                asset_category=av.asset_category,
                description=av.description,
                quantity=av.quantity,
                unit=av.unit,
                unit_rate_inr=av.unit_rate_inr,
                total_asset_value_inr=av.total_asset_value_inr,
                depreciation_inr=av.depreciation_inr,
                net_asset_value_inr=av.net_asset_value_inr,
            )
            for av in a.asset_valuations
        ]

        # Re-derive breakdown components for transparent view
        breakdown = CompensationService.calculate_configurable_breakdown(
            area_sqm=parcel.acquired_area_sqm if parcel else Decimal("0.0"),
            circle_rate_per_sqm=parcel.circle_rate_per_sqm if parcel else Decimal("0.0"),
            multiplier_factor=a.multiplier_factor,
            assets_value_inr=a.assets_value_inr,
        )

        return CompensationAssessmentDetail(
            id=a.id,
            assessment_reference=a.assessment_reference or f"COMP-{str(a.id)[:8].upper()}",
            status=a.status,
            project_id=prj.id if prj else uuid.uuid4(),
            project_code=prj.project_code if prj else "N/A",
            project_title=prj.title if prj else "N/A",
            parcel_id=parcel.id if parcel else uuid.uuid4(),
            khasra_number=parcel.khasra_number if parcel else "N/A",
            khata_number=parcel.khata_number if parcel else "N/A",
            village_name=vil.name if vil else "N/A",
            tehsil_name=teh.name if teh else None,
            district_name=dist.name if dist else "N/A",
            state_name=st.name if st else "N/A",
            land_type=parcel.land_type if parcel else "N/A",
            acquired_area_sqm=parcel.acquired_area_sqm if parcel else Decimal("0.0"),
            circle_rate_per_sqm=parcel.circle_rate_per_sqm if parcel else Decimal("0.0"),
            multiplier_factor=a.multiplier_factor,
            base_land_value_inr=a.base_land_value_inr,
            market_value_land_inr=a.market_value_land_inr,
            assets_value_inr=a.assets_value_inr,
            solatium_inr=a.solatium_inr,
            additional_market_value_inr=a.additional_market_value_inr,
            total_compensation_inr=a.total_compensation_inr,
            breakdown=breakdown,
            asset_valuations=assets_list,
            owners=masked_owners,
            is_approved_by_cala=a.is_approved_by_cala,
            approval_date=a.approval_date,
            assessing_officer_name=a.assessing_officer.full_name if a.assessing_officer else None,
            award_id=a.award_id,
            award_number=a.award.award_number if a.award else None,
            remarks=a.remarks,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )

    @staticmethod
    async def create_or_finalize_assessment(
        db: AsyncSession,
        parcel_id: uuid.UUID,
        current_user: User,
        multiplier_factor: Optional[Decimal] = None,
        solatium_percent: Optional[Decimal] = None,
        statutory_additional_rate_percent: Optional[Decimal] = None,
        sec11_publication_date: Optional[date] = None,
        award_date: Optional[date] = None,
        remarks: Optional[str] = None,
    ) -> CompensationAssessment:
        """Create or finalize a Configurable Compensation Assessment for a cadastral parcel."""
        parcel = await db.get(LandParcel, parcel_id)
        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Land parcel not found")

        # Sum assets if any exist
        av_stmt = select(func.coalesce(func.sum(AssetValuation.net_asset_value_inr), 0)).where(
            AssetValuation.assessment_id == CompensationAssessment.id,
            CompensationAssessment.parcel_id == parcel_id,
        )
        # Check existing assessment
        existing_stmt = select(CompensationAssessment).where(CompensationAssessment.parcel_id == parcel_id)
        existing = (await db.execute(existing_stmt)).scalar_one_or_none()

        assets_val = Decimal("0.0")
        if existing:
            av_sum = await db.execute(
                select(func.coalesce(func.sum(AssetValuation.net_asset_value_inr), 0)).where(
                    AssetValuation.assessment_id == existing.id
                )
            )
            assets_val = Decimal(str(av_sum.scalar_one()))

        mult = multiplier_factor or parcel.market_multiplier or Decimal("1.25")
        sol_pct = solatium_percent or Decimal("100.0")
        stat_pct = statutory_additional_rate_percent or Decimal("12.0")

        breakdown = CompensationService.calculate_configurable_breakdown(
            area_sqm=parcel.acquired_area_sqm,
            circle_rate_per_sqm=parcel.circle_rate_per_sqm,
            multiplier_factor=mult,
            assets_value_inr=assets_val,
            solatium_percent=sol_pct,
            statutory_additional_rate_percent=stat_pct,
            sec11_publication_date=sec11_publication_date,
            award_date=award_date,
        )

        if existing:
            existing.multiplier_factor = breakdown.multiplier_factor
            existing.base_land_value_inr = breakdown.base_land_value_inr
            existing.market_value_land_inr = breakdown.market_value_land_inr
            existing.assets_value_inr = breakdown.assets_value_inr
            existing.solatium_inr = breakdown.solatium_inr
            existing.additional_market_value_inr = breakdown.additional_market_value_inr
            existing.total_compensation_inr = breakdown.total_compensation_inr
            existing.remarks = remarks or existing.remarks
            existing.assessing_officer_id = current_user.id
            target = existing
        else:
            ref = f"COMP/{parcel.khasra_number.replace('/', '-')}/{str(uuid.uuid4())[:6].upper()}"
            target = CompensationAssessment(
                parcel_id=parcel.id,
                assessment_reference=ref,
                status=AssessmentStatus.APPROVED.value if current_user.role_id in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value) else AssessmentStatus.UNDER_REVIEW.value,
                base_land_value_inr=breakdown.base_land_value_inr,
                multiplier_factor=breakdown.multiplier_factor,
                market_value_land_inr=breakdown.market_value_land_inr,
                assets_value_inr=breakdown.assets_value_inr,
                solatium_inr=breakdown.solatium_inr,
                additional_market_value_inr=breakdown.additional_market_value_inr,
                total_compensation_inr=breakdown.total_compensation_inr,
                is_approved_by_cala=(current_user.role_id in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value)),
                approval_date=datetime.now(timezone.utc) if current_user.role_id in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value) else None,
                assessing_officer_id=current_user.id,
                remarks=remarks,
            )
            db.add(target)

        # Update parcel status if proposed/verified
        if parcel.acquisition_status in (AcquisitionStatus.PROPOSED.value, AcquisitionStatus.VERIFIED.value):
            parcel.acquisition_status = AcquisitionStatus.VALUATION_COMPLETED.value

        # Log audit
        audit = AuditLog(
            user_id=current_user.id,
            action="COMPENSATION_ASSESSMENT_RECORDED",
            entity_type="compensation_assessment",
            entity_id=str(target.id),
            details={
                "parcel_id": str(parcel.id),
                "khasra": parcel.khasra_number,
                "total_assessed_inr": float(breakdown.total_compensation_inr),
            },
        )
        db.add(audit)

        await db.commit()
        await db.refresh(target)
        return target

    @staticmethod
    async def approve_assessment(
        db: AsyncSession,
        assessment_id: uuid.UUID,
        current_user: User,
        decision: str = "APPROVED",
        remarks: Optional[str] = None,
    ) -> CompensationAssessment:
        """CALA statutory review and approval of assessment."""
        if current_user.role_id not in (RoleCode.DISTRICT_OFFICER.value, RoleCode.ADMIN.value):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Statutory approval requires Competent Authority (CALA / District Officer) credentials",
            )

        a = await db.get(CompensationAssessment, assessment_id)
        if not a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

        now = datetime.now(timezone.utc)
        if decision == "APPROVED":
            a.is_approved_by_cala = True
            a.approval_date = now
            a.status = AssessmentStatus.APPROVED.value
        else:
            a.is_approved_by_cala = False
            a.status = AssessmentStatus.REJECTED.value

        if remarks:
            a.remarks = (a.remarks or "") + f" | CALA Decision: {decision} - {remarks}"

        audit = AuditLog(
            user_id=current_user.id,
            action=f"COMPENSATION_ASSESSMENT_{decision}",
            entity_type="compensation_assessment",
            entity_id=str(a.id),
            details={"decision": decision, "remarks": remarks},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(a)
        return a
