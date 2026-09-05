import asyncio
import hashlib
import os
import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.enums import (
    RoleCode,
    AcquisitionStatus,
    AssessmentStatus,
    AwardStatus,
    DisbursementStatus,
    PossessionStatus,
    PossessionType,
)
from app.models.project import Project
from app.models.parcel import LandParcel, ParcelOwnership, LandOwner, FieldVerification
from app.models.compensation import CompensationAssessment, AssetValuation
from app.models.award import Award
from app.models.disbursement import Disbursement
from app.models.possession import Possession
from app.models.user import User
from app.models.audit import AuditLog
from app.models.document import Document
from app.services.compensation_service import CompensationService


async def seed_phase5():
    async with AsyncSessionLocal() as session:
        print("Starting Phase 5 Seeding: Compensation, Awards, Disbursements, and Possession...")

        # 1. Fetch benchmark project PRJ-NH48-PKG4
        p_stmt = select(Project).where(Project.project_code == "PRJ-NH48-PKG4")
        project = (await session.execute(p_stmt)).scalar_one_or_none()
        if not project:
            print("Benchmark project PRJ-NH48-PKG4 not found! Exiting.")
            return

        # Fetch officers
        cala_stmt = select(User).where(User.username.in_(["cala_jaipur", "district_officer"]))
        cala_user = (await session.execute(cala_stmt)).scalar_one_or_none()
        if not cala_user:
            cala_user = (await session.execute(select(User))).scalars().first()

        agency_stmt = select(User).where(User.username == "agency_officer")
        agency_user = (await session.execute(agency_stmt)).scalar_one_or_none()
        if not agency_user:
            agency_user = cala_user

        field_stmt = select(User).where(User.username == "field_officer")
        field_user = (await session.execute(field_stmt)).scalar_one_or_none()
        if not field_user:
            field_user = cala_user

        # Fetch parcels under this project
        parcels_stmt = (
            select(LandParcel)
            .where(LandParcel.project_id == project.id)
            .options(
                selectinload(LandParcel.ownerships).selectinload(ParcelOwnership.owner),
                selectinload(LandParcel.field_verifications),
            )
            .order_by(LandParcel.khasra_number.asc())
        )
        parcels = (await session.execute(parcels_stmt)).scalars().all()
        parcels_by_khasra = {p.khasra_number: p for p in parcels}

        today = date.today()
        now = datetime.now(timezone.utc)
        sec11_date = today - timedelta(days=240)
        award_1_date = today - timedelta(days=60)
        award_2_date = today - timedelta(days=30)

        # 2. Configure assessments for parcels 101/1, 101/2, 102, 103/A, 104, 105/1, 201, 202/A, 203
        assessment_configs = [
            {
                "khasra": "101/1",
                "trees": 24, "structures": 1, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1850000.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 1,
                "disb_status": DisbursementStatus.DISBURSED.value,
                "possession_status": PossessionStatus.TAKEN.value,
            },
            {
                "khasra": "101/2",
                "trees": 18, "structures": 0, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("0.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 1,
                "disb_status": DisbursementStatus.DISBURSED.value,
                "possession_status": PossessionStatus.TAKEN.value,
            },
            {
                "khasra": "102",
                "trees": 30, "structures": 2, "wells": 2,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1200000.00"), "well_rate": Decimal("250000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 1,
                "disb_status": DisbursementStatus.DISBURSED.value,
                "possession_status": PossessionStatus.SCHEDULED.value,
            },
            {
                "khasra": "103/A",
                "trees": 15, "structures": 1, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1500000.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 1,
                "disb_status": DisbursementStatus.DISBURSED.value,
                "possession_status": PossessionStatus.SCHEDULED.value,
            },
            {
                "khasra": "104",
                "trees": 5, "structures": 4, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("4000000.00"), "well_rate": Decimal("300000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 2,
                "disb_status": DisbursementStatus.PROCESSING.value,
                "possession_status": None,
            },
            {
                "khasra": "105/1",
                "trees": 22, "structures": 1, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1600000.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 2,
                "disb_status": DisbursementStatus.PROCESSING.value,
                "possession_status": None,
            },
            {
                "khasra": "201",
                "trees": 35, "structures": 2, "wells": 2,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1400000.00"), "well_rate": Decimal("250000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 2,
                "disb_status": DisbursementStatus.PENDING.value,
                "possession_status": None,
            },
            {
                "khasra": "202/A",
                "trees": 12, "structures": 0, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("0.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.APPROVED.value,
                "award_batch": 2,
                "disb_status": DisbursementStatus.PENDING.value,
                "possession_status": None,
            },
            {
                "khasra": "203",
                "trees": 8, "structures": 3, "wells": 1,
                "tree_rate": Decimal("4500.00"), "struct_rate": Decimal("1800000.00"), "well_rate": Decimal("240000.00"),
                "status": AssessmentStatus.UNDER_REVIEW.value,
                "award_batch": None,
                "disb_status": None,
                "possession_status": None,
            },
        ]

        # 3. Create Awards first so we can link them
        award_1 = Award(
            project_id=project.id,
            award_number="AWARD/NH48/2026/PKG4-01",
            award_date=award_1_date,
            total_parcels_count=4,
            total_area_acres=Decimal("140.0000"),
            total_award_amount_inr=Decimal("0.0"),  # Will accumulate below
            cala_user_id=cala_user.id,
            digital_sign_hash=hashlib.sha256(f"AWARD/NH48/2026/PKG4-01:{award_1_date}:{cala_user.id}".encode()).hexdigest(),
            status=AwardStatus.ISSUED.value,
            remarks="Section 23/30 Statutory Award issued by Competent Authority (CALA Jaipur) for Package IV Manpura segment.",
            approved_by_user_id=cala_user.id,
            approval_date=now - timedelta(days=60),
        )
        session.add(award_1)

        award_2 = Award(
            project_id=project.id,
            award_number="AWARD/NH48/2026/PKG4-02",
            award_date=award_2_date,
            total_parcels_count=4,
            total_area_acres=Decimal("180.0000"),
            total_award_amount_inr=Decimal("0.0"),  # Will accumulate below
            cala_user_id=cala_user.id,
            digital_sign_hash=hashlib.sha256(f"AWARD/NH48/2026/PKG4-02:{award_2_date}:{cala_user.id}".encode()).hexdigest(),
            status=AwardStatus.ISSUED.value,
            remarks="Section 23/30 Statutory Award issued by Competent Authority (CALA Jaipur) for Package IV Paota segment.",
            approved_by_user_id=cala_user.id,
            approval_date=now - timedelta(days=30),
        )
        session.add(award_2)
        await session.flush()

        award_1_total = Decimal("0.0")
        award_2_total = Decimal("0.0")
        total_assessed_overall = Decimal("0.0")
        total_disbursed_overall = Decimal("0.0")
        total_possession_acres_overall = Decimal("0.0")

        # 4. Process each assessment config
        for idx, cfg in enumerate(assessment_configs):
            parcel = parcels_by_khasra.get(cfg["khasra"])
            if not parcel:
                continue

            # Calculate asset valuation
            assets_sum = (
                Decimal(str(cfg["trees"])) * cfg["tree_rate"]
                + Decimal(str(cfg["structures"])) * cfg["struct_rate"]
                + Decimal(str(cfg["wells"])) * cfg["well_rate"]
            )

            # Target award
            target_award = None
            if cfg["award_batch"] == 1:
                target_award = award_1
                target_award_date = award_1_date
            elif cfg["award_batch"] == 2:
                target_award = award_2
                target_award_date = award_2_date
            else:
                target_award_date = today

            breakdown = CompensationService.calculate_configurable_breakdown(
                area_sqm=parcel.acquired_area_sqm,
                circle_rate_per_sqm=parcel.circle_rate_per_sqm,
                multiplier_factor=parcel.market_multiplier,
                assets_value_inr=assets_sum,
                sec11_publication_date=sec11_date,
                award_date=target_award_date,
            )

            # Check if assessment exists
            ca_check = await session.execute(select(CompensationAssessment).where(CompensationAssessment.parcel_id == parcel.id))
            ca = ca_check.scalar_one_or_none()

            ref = f"COMP/NH48/{parcel.khasra_number.replace('/', '-')}/2026"
            if not ca:
                ca = CompensationAssessment(
                    parcel_id=parcel.id,
                    assessment_reference=ref,
                    status=cfg["status"],
                    base_land_value_inr=breakdown.base_land_value_inr,
                    multiplier_factor=breakdown.multiplier_factor,
                    market_value_land_inr=breakdown.market_value_land_inr,
                    assets_value_inr=breakdown.assets_value_inr,
                    solatium_inr=breakdown.solatium_inr,
                    additional_market_value_inr=breakdown.additional_market_value_inr,
                    total_compensation_inr=breakdown.total_compensation_inr,
                    is_approved_by_cala=(cfg["status"] == AssessmentStatus.APPROVED.value),
                    approval_date=now - timedelta(days=65) if cfg["status"] == AssessmentStatus.APPROVED.value else None,
                    assessing_officer_id=cala_user.id,
                    award_id=target_award.id if target_award else None,
                    remarks=f"Configurable compensation assessment determined for Khasra {parcel.khasra_number}.",
                )
                session.add(ca)
                await session.flush()
            else:
                ca.award_id = target_award.id if target_award else None
                ca.status = cfg["status"]

            # Add asset valuations line items if trees / structures / wells exist
            if cfg["trees"] > 0:
                av_tree = AssetValuation(
                    assessment_id=ca.id,
                    asset_category="FRUIT_BEARING_TREE",
                    description=f"{cfg['trees']} mature fruit bearing trees (Sheesham / Khejri)",
                    quantity=Decimal(str(cfg["trees"])),
                    unit="TREES",
                    unit_rate_inr=cfg["tree_rate"],
                    total_asset_value_inr=Decimal(str(cfg["trees"])) * cfg["tree_rate"],
                    depreciation_inr=Decimal("0.0"),
                    net_asset_value_inr=Decimal(str(cfg["trees"])) * cfg["tree_rate"],
                )
                session.add(av_tree)

            if cfg["structures"] > 0:
                av_struct = AssetValuation(
                    assessment_id=ca.id,
                    asset_category="RESIDENTIAL_STRUCTURE" if "RESIDENTIAL" in parcel.land_type else "COMMERCIAL_STRUCTURE",
                    description=f"{cfg['structures']} pucca boundary wall & farm structure",
                    quantity=Decimal(str(cfg["structures"])),
                    unit="UNITS",
                    unit_rate_inr=cfg["struct_rate"],
                    total_asset_value_inr=Decimal(str(cfg["structures"])) * cfg["struct_rate"],
                    depreciation_inr=Decimal("0.0"),
                    net_asset_value_inr=Decimal(str(cfg["structures"])) * cfg["struct_rate"],
                )
                session.add(av_struct)

            if cfg["wells"] > 0:
                av_well = AssetValuation(
                    assessment_id=ca.id,
                    asset_category="TUBEWELL_PUMP",
                    description=f"{cfg['wells']} operational irrigation tube-well & pump-set",
                    quantity=Decimal(str(cfg["wells"])),
                    unit="UNITS",
                    unit_rate_inr=cfg["well_rate"],
                    total_asset_value_inr=Decimal(str(cfg["wells"])) * cfg["well_rate"],
                    depreciation_inr=Decimal("0.0"),
                    net_asset_value_inr=Decimal(str(cfg["wells"])) * cfg["well_rate"],
                )
                session.add(av_well)

            total_assessed_overall += breakdown.total_compensation_inr

            # Accumulate award totals
            if cfg["award_batch"] == 1:
                award_1_total += breakdown.total_compensation_inr
            elif cfg["award_batch"] == 2:
                award_2_total += breakdown.total_compensation_inr

            # 5. Handle Disbursements if awarded
            if target_award and cfg["disb_status"]:
                for po in parcel.ownerships:
                    if not po.owner:
                        continue
                    share_pct = po.ownership_share_percent / Decimal("100.0")
                    owner_amt = (breakdown.total_compensation_inr * share_pct).quantize(Decimal("0.01"))

                    d_status = cfg["disb_status"]
                    utr = f"SBIN26048{1000 + idx}" if d_status == DisbursementStatus.DISBURSED.value else None
                    disb_date = now - timedelta(days=45) if d_status == DisbursementStatus.DISBURSED.value else None

                    disb = Disbursement(
                        award_id=target_award.id,
                        parcel_id=parcel.id,
                        owner_id=po.owner.id,
                        disbursement_reference=f"DISB/NH48/{parcel.khasra_number.replace('/', '-')}/{po.owner.id.hex[:4].upper()}",
                        amount_inr=owner_amt,
                        payment_method="PFMS_DBT",
                        pfms_batch_reference=f"PFMS-2026-BAT-PKG4-0{cfg['award_batch']}",
                        payment_status=d_status,
                        bank_utr_number=utr,
                        disbursed_at=disb_date,
                        remarks="Direct Benefit Transfer via PFMS-compatible simulated gateway.",
                        processed_by_user_id=cala_user.id,
                    )
                    session.add(disb)

                    if d_status == DisbursementStatus.DISBURSED.value:
                        total_disbursed_overall += owner_amt

            # 6. Handle Possession
            if cfg["possession_status"]:
                acres = (Decimal(str(parcel.acquired_area_sqm)) / Decimal("4046.8564224")).quantize(Decimal("0.0001"))
                poss_ref = f"POSS/NH48/{parcel.khasra_number.replace('/', '-')}/2026"
                poss_date = (today - timedelta(days=20)) if cfg["possession_status"] == PossessionStatus.TAKEN.value else (today + timedelta(days=15))

                possession = Possession(
                    project_id=project.id,
                    parcel_id=parcel.id,
                    possession_reference=poss_ref,
                    possession_date=poss_date,
                    possession_type=PossessionType.SECTION_38_REGULAR.value,
                    status=cfg["possession_status"],
                    is_encumbrance_free=True,
                    taken_by_agency_officer_id=agency_user.id,
                    handed_over_by_cala_id=cala_user.id,
                    award_id=target_award.id if target_award else None,
                    remarks="Section 38 Land Handover executed following statutory compensation award and disbursement.",
                )
                session.add(possession)

                if cfg["possession_status"] == PossessionStatus.TAKEN.value:
                    total_possession_acres_overall += acres

        # Finalize Awards
        award_1.total_award_amount_inr = award_1_total
        award_2.total_award_amount_inr = award_2_total

        # Update Project summary financial KPIs in Cr
        project.compensation_assessed_cr = Decimal(str(round(float(total_assessed_overall) / 1e7, 2)))
        project.compensation_disbursed_cr = Decimal(str(round(float(total_disbursed_overall) / 1e7, 2)))
        project.total_possession_acres = Decimal(str(round(float(total_possession_acres_overall), 2)))

        # Commit everything
        await session.commit()
        print("Phase 5 Seeding Complete!")
        print(f"  Award 1 Total: INR {award_1_total:,.2f} (~INR {float(award_1_total)/1e7:.2f} Cr)")
        print(f"  Award 2 Total: INR {award_2_total:,.2f} (~INR {float(award_2_total)/1e7:.2f} Cr)")
        print(f"  Total Assessed: INR {total_assessed_overall:,.2f} (~INR {float(total_assessed_overall)/1e7:.2f} Cr)")
        print(f"  Total Disbursed: INR {total_disbursed_overall:,.2f} (~INR {float(total_disbursed_overall)/1e7:.2f} Cr)")
        print(f"  Possession Acres: {total_possession_acres_overall:.2f} acres")


if __name__ == "__main__":
    asyncio.run(seed_phase5())
