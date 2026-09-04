import asyncio
import sys
import os
import uuid

sys.path.insert(0, os.path.abspath("."))
from decimal import Decimal
from datetime import datetime, date, timedelta, timezone
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.elements import WKTElement

from app.core.database import AsyncSessionLocal
from app.models.enums import RoleCode, StageStatus, TransitionDecision
from app.models.project import Project, ProjectStage, StageTransitionHistory, WorkflowTask
from app.models.parcel import LandParcel, LandOwner, ParcelOwnership, FieldVerification
from app.models.user import User
from app.models.alert import Alert
from app.services.workflow_engine import WORKFLOW_STAGE_SPECS, STAGE_SPECS_BY_CODE

PARCEL_SEEDS = [
    # Manpura Village Parcels (Kotputli Tehsil, Jaipur District)
    {
        "khasra": "101/1",
        "khata": "45",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("141640.00"),  # ~35 acres
        "acq_sqm": Decimal("141640.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1800.00"),
        "multiplier": Decimal("1.25"),
        "status": "POSSESSION_TAKEN",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7020"),
        "centroid_lon": Decimal("76.2010"),
        "coords": [
            [76.1980, 27.7000],
            [76.2040, 27.7000],
            [76.2040, 27.7040],
            [76.1980, 27.7040],
            [76.1980, 27.7000],
        ],
        "owner_name": "Shri Ramswaroop Meena",
        "trees": 24,
        "structures": 1,
        "wells": 1,
    },
    {
        "khasra": "101/2",
        "khata": "45",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("121405.00"),  # ~30 acres
        "acq_sqm": Decimal("121405.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1800.00"),
        "multiplier": Decimal("1.25"),
        "status": "POSSESSION_TAKEN",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7060"),
        "centroid_lon": Decimal("76.2010"),
        "coords": [
            [76.1980, 27.7040],
            [76.2040, 27.7040],
            [76.2040, 27.7080],
            [76.1980, 27.7080],
            [76.1980, 27.7040],
        ],
        "owner_name": "Smt. Kamala Devi",
        "trees": 18,
        "structures": 0,
        "wells": 1,
    },
    {
        "khasra": "102",
        "khata": "48",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("161875.00"),  # ~40 acres
        "acq_sqm": Decimal("161875.00"),
        "land_type": "AGRICULTURAL_UNIRRIGATED",
        "circle_rate": Decimal("1500.00"),
        "multiplier": Decimal("1.25"),
        "status": "DISBURSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7020"),
        "centroid_lon": Decimal("76.2070"),
        "coords": [
            [76.2040, 27.7000],
            [76.2100, 27.7000],
            [76.2100, 27.7040],
            [76.2040, 27.7040],
            [76.2040, 27.7000],
        ],
        "owner_name": "Shri Harphool Singh Gurjar",
        "trees": 30,
        "structures": 2,
        "wells": 2,
    },
    {
        "khasra": "103/A",
        "khata": "52",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("141640.00"),  # ~35 acres
        "acq_sqm": Decimal("141640.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1800.00"),
        "multiplier": Decimal("1.25"),
        "status": "DISBURSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7060"),
        "centroid_lon": Decimal("76.2070"),
        "coords": [
            [76.2040, 27.7040],
            [76.2100, 27.7040],
            [76.2100, 27.7080],
            [76.2040, 27.7080],
            [76.2040, 27.7040],
        ],
        "owner_name": "Shri Jagdish Prasad Sharma",
        "trees": 15,
        "structures": 1,
        "wells": 1,
    },
    {
        "khasra": "104",
        "khata": "56",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("182108.00"),  # ~45 acres
        "acq_sqm": Decimal("182108.00"),
        "land_type": "COMMERCIAL",
        "circle_rate": Decimal("3500.00"),
        "multiplier": Decimal("1.00"),
        "status": "AWARD_PASSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7020"),
        "centroid_lon": Decimal("76.2130"),
        "coords": [
            [76.2100, 27.7000],
            [76.2160, 27.7000],
            [76.2160, 27.7040],
            [76.2100, 27.7040],
            [76.2100, 27.7000],
        ],
        "owner_name": "M/s Highway Commercial Logistics Ltd",
        "trees": 5,
        "structures": 4,
        "wells": 1,
    },
    {
        "khasra": "105/1",
        "khata": "60",
        "village_id": "VIL-MAN-01",
        "total_sqm": Decimal("161875.00"),  # ~40 acres
        "acq_sqm": Decimal("161875.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1800.00"),
        "multiplier": Decimal("1.25"),
        "status": "AWARD_PASSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7060"),
        "centroid_lon": Decimal("76.2130"),
        "coords": [
            [76.2100, 27.7040],
            [76.2160, 27.7040],
            [76.2160, 27.7080],
            [76.2100, 27.7080],
            [76.2100, 27.7040],
        ],
        "owner_name": "Shri Mohan Lal Yadav",
        "trees": 22,
        "structures": 1,
        "wells": 1,
    },
    # Paota Village Parcels (Kotputli Tehsil, Jaipur District)
    {
        "khasra": "201",
        "khata": "12",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("202343.00"),  # ~50 acres
        "acq_sqm": Decimal("202343.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1600.00"),
        "multiplier": Decimal("1.25"),
        "status": "AWARD_PASSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7100"),
        "centroid_lon": Decimal("76.2010"),
        "coords": [
            [76.1980, 27.7080],
            [76.2040, 27.7080],
            [76.2040, 27.7120],
            [76.1980, 27.7120],
            [76.1980, 27.7080],
        ],
        "owner_name": "Shri Bhagwan Das Saini",
        "trees": 35,
        "structures": 2,
        "wells": 2,
    },
    {
        "khasra": "202/A",
        "khata": "18",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("182108.00"),  # ~45 acres
        "acq_sqm": Decimal("182108.00"),
        "land_type": "AGRICULTURAL_UNIRRIGATED",
        "circle_rate": Decimal("1400.00"),
        "multiplier": Decimal("1.25"),
        "status": "AWARD_PASSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7100"),
        "centroid_lon": Decimal("76.2070"),
        "coords": [
            [76.2040, 27.7080],
            [76.2100, 27.7080],
            [76.2100, 27.7120],
            [76.2040, 27.7120],
            [76.2040, 27.7080],
        ],
        "owner_name": "Shri Suraj Mal Choudhary",
        "trees": 12,
        "structures": 0,
        "wells": 1,
    },
    {
        "khasra": "203",
        "khata": "22",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("161875.00"),  # ~40 acres
        "acq_sqm": Decimal("161875.00"),
        "land_type": "RESIDENTIAL",
        "circle_rate": Decimal("2400.00"),
        "multiplier": Decimal("1.00"),
        "status": "VERIFIED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7100"),
        "centroid_lon": Decimal("76.2130"),
        "coords": [
            [76.2100, 27.7080],
            [76.2160, 27.7080],
            [76.2160, 27.7120],
            [76.2100, 27.7120],
            [76.2100, 27.7080],
        ],
        "owner_name": "Smt. Shanti Devi Agarwal",
        "trees": 8,
        "structures": 3,
        "wells": 1,
    },
    {
        "khasra": "204/1",
        "khata": "28",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("141640.00"),  # ~35 acres
        "acq_sqm": Decimal("0.00"),
        "land_type": "AGRICULTURAL_IRRIGATED",
        "circle_rate": Decimal("1600.00"),
        "multiplier": Decimal("1.25"),
        "status": "DISPUTED",
        "is_disputed": True,
        "centroid_lat": Decimal("27.7140"),
        "centroid_lon": Decimal("76.2010"),
        "coords": [
            [76.1980, 27.7120],
            [76.2040, 27.7120],
            [76.2040, 27.7160],
            [76.1980, 27.7160],
            [76.1980, 27.7120],
        ],
        "owner_name": "Shri Mahaveer Singh (In Dispute)",
        "trees": 14,
        "structures": 1,
        "wells": 1,
    },
    {
        "khasra": "205",
        "khata": "32",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("141640.00"),  # ~35 acres
        "acq_sqm": Decimal("0.00"),
        "land_type": "AGRICULTURAL_UNIRRIGATED",
        "circle_rate": Decimal("1400.00"),
        "multiplier": Decimal("1.25"),
        "status": "NOTIFIED_SEC11",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7140"),
        "centroid_lon": Decimal("76.2070"),
        "coords": [
            [76.2040, 27.7120],
            [76.2100, 27.7120],
            [76.2100, 27.7160],
            [76.2040, 27.7160],
            [76.2040, 27.7120],
        ],
        "owner_name": "Shri Gopal Lal Verma",
        "trees": 6,
        "structures": 0,
        "wells": 0,
    },
    {
        "khasra": "206",
        "khata": "36",
        "village_id": "VIL-PAW-02",
        "total_sqm": Decimal("40468.00"),  # ~10 acres
        "acq_sqm": Decimal("0.00"),
        "land_type": "GOVERNMENT_WASTE",
        "circle_rate": Decimal("1000.00"),
        "multiplier": Decimal("1.00"),
        "status": "PROPOSED",
        "is_disputed": False,
        "centroid_lat": Decimal("27.7140"),
        "centroid_lon": Decimal("76.2130"),
        "coords": [
            [76.2100, 27.7120],
            [76.2160, 27.7120],
            [76.2160, 27.7160],
            [76.2100, 27.7160],
            [76.2100, 27.7120],
        ],
        "owner_name": "Gram Panchayat Manpura (Common Land)",
        "trees": 0,
        "structures": 0,
        "wells": 0,
    },
]


async def seed_stages_and_tasks(session: AsyncSession) -> None:
    """Seed 12 statutory stages for each benchmark project."""
    projects_res = await session.execute(select(Project))
    projects = projects_res.scalars().all()

    today = date.today()
    now = datetime.now(timezone.utc)

    cala_stmt = select(User).where(User.username == "district_officer")
    cala_user = (await session.execute(cala_stmt)).scalar_one_or_none()

    agency_stmt = select(User).where(User.username == "agency_officer")
    agency_user = (await session.execute(agency_stmt)).scalar_one_or_none()

    field_stmt = select(User).where(User.username == "field_officer")
    field_user = (await session.execute(field_stmt)).scalar_one_or_none()

    for p in projects:
        # Check if project already has stages
        st_res = await session.execute(select(ProjectStage).where(ProjectStage.project_id == p.id))
        existing_stages = st_res.scalars().all()
        if existing_stages:
            continue

        curr_spec = STAGE_SPECS_BY_CODE.get(p.current_stage)
        curr_seq = curr_spec["sequence_order"] if curr_spec else 1

        for spec in WORKFLOW_STAGE_SPECS:
            code = spec["stage_code"]
            seq = spec["sequence_order"]

            if seq < curr_seq:
                st_status = StageStatus.COMPLETED.value
                started = now - timedelta(days=(curr_seq - seq + 1) * 20)
                completed = started + timedelta(days=spec["sla_days"] - 5)
                due = started.date() + timedelta(days=spec["sla_days"])
                comments = f"Stage {spec['stage_name']} concluded with statutory approval."
                rejection = None
            elif seq == curr_seq:
                st_status = StageStatus.IN_PROGRESS.value
                started = now - timedelta(days=10)
                completed = None
                # Let Gurugram Metro have an overdue stage for testing SLA tracking!
                if p.project_code == "PRJ-GUR-METRO":
                    due = today - timedelta(days=4)
                else:
                    due = today + timedelta(days=spec["sla_days"] - 10)
                comments = f"Stage actively in progress under {spec['primary_role']}."
                rejection = None
            else:
                st_status = StageStatus.PENDING.value
                started = None
                completed = None
                due = None
                comments = None
                rejection = None

            ps = ProjectStage(
                project_id=p.id,
                stage_code=code,
                status=st_status,
                started_at=started,
                due_date=due,
                completed_at=completed,
                sla_deadline_days=spec["sla_days"],
                assigned_role=spec["primary_role"],
                assigned_user_id=cala_user.id if "DISTRICT" in spec["primary_role"] and cala_user else (agency_user.id if agency_user else None),
                comments=comments,
                rejection_reason=rejection,
                required_documents=spec["required_documents"],
            )
            session.add(ps)

        # Seed realistic StageTransitionHistory
        if curr_seq > 1:
            prev_spec = WORKFLOW_STAGE_SPECS[curr_seq - 2]
            hist = StageTransitionHistory(
                project_id=p.id,
                from_stage=prev_spec["stage_code"],
                to_stage=curr_spec["stage_code"],
                triggered_by_user_id=cala_user.id if cala_user else p.created_by_user_id,
                decision="APPROVED",
                remarks=f"Statutory requirements satisfied. Transition to {curr_spec['stage_name']} authorized.",
                snapshot_metrics_json={
                    "land_acquired_acres": float(p.total_land_acquired_acres),
                    "compensation_disbursed_cr": float(p.compensation_disbursed_cr),
                },
                created_at=now - timedelta(days=10),
            )
            session.add(hist)

    await session.flush()
    print("All project stages and transition histories seeded successfully.")


async def seed_parcels(session: AsyncSession) -> None:
    """Seed 12 realistic PostGIS cadastral parcels for the main demo project."""
    # Find PRJ-NH48-PKG4
    stmt = select(Project).where(Project.project_code == "PRJ-NH48-PKG4")
    project = (await session.execute(stmt)).scalar_one_or_none()

    if not project:
        print("Project PRJ-NH48-PKG4 not found!")
        return

    # Check if parcels already exist
    p_check = await session.execute(select(LandParcel).where(LandParcel.project_id == project.id))
    existing_parcels = p_check.scalars().all()
    if existing_parcels:
        print("Parcels already seeded for PRJ-NH48-PKG4.")
        return

    field_stmt = select(User).where(User.username == "field_officer")
    field_user = (await session.execute(field_stmt)).scalar_one_or_none()

    cala_stmt = select(User).where(User.username == "district_officer")
    cala_user = (await session.execute(cala_stmt)).scalar_one_or_none()

    for idx, p_seed in enumerate(PARCEL_SEEDS):
        # 1. Build GeoJSON Polygon
        geojson_poly = {
            "type": "Polygon",
            "coordinates": [p_seed["coords"]],
        }

        # 2. Build WKT String: "POLYGON((lon lat, lon lat, ...))"
        wkt_coords = ", ".join([f"{c[0]} {c[1]}" for c in p_seed["coords"]])
        wkt_str = f"POLYGON(({wkt_coords}))"
        geom_wkt = WKTElement(wkt_str, srid=4326)

        parcel = LandParcel(
            project_id=project.id,
            village_id=p_seed["village_id"],
            khasra_number=p_seed["khasra"],
            khata_number=p_seed["khata"],
            total_area_sqm=p_seed["total_sqm"],
            acquired_area_sqm=p_seed["acq_sqm"],
            land_type=p_seed["land_type"],
            circle_rate_per_sqm=p_seed["circle_rate"],
            market_multiplier=p_seed["multiplier"],
            acquisition_status=p_seed["status"],
            geojson_polygon=geojson_poly,
            geometry=geom_wkt,
            centroid_latitude=p_seed["centroid_lat"],
            centroid_longitude=p_seed["centroid_lon"],
            is_disputed=p_seed["is_disputed"],
        )
        session.add(parcel)
        await session.flush()

        # 3. Create Landowner
        owner = LandOwner(
            full_name=p_seed["owner_name"],
            relative_name=f"Late S/o Ramji Lal",
            aadhaar_hash=f"89347592810{idx:02d}",
            pan_number=f"ABCDE{1000 + idx}F",
            bank_account_no=f"91823746501{idx:02d}",
            bank_ifsc_code="SBIN0001234",
            bank_name="State Bank of India (Kotputli)",
            phone_number=f"+91 98290 {10000 + idx}",
            social_category="OBC" if idx % 2 == 0 else "GEN",
            is_kyc_verified=True,
        )
        session.add(owner)
        await session.flush()

        # 4. Map Ownership
        ownership = ParcelOwnership(
            parcel_id=parcel.id,
            owner_id=owner.id,
            ownership_share_percent=Decimal("100.00"),
            extent_area_sqm=p_seed["total_sqm"],
            mutation_date=date(2021, 5, 12),
            is_primary_contact=True,
        )
        session.add(ownership)

        # 5. Field Verification for verified parcels
        if p_seed["status"] in ("POSSESSION_TAKEN", "DISBURSED", "AWARD_PASSED", "VERIFIED"):
            fv = FieldVerification(
                parcel_id=parcel.id,
                verified_by_user_id=field_user.id if field_user else project.created_by_user_id,
                verification_date=date(2026, 7, 15),
                ground_survey_notes=f"Physical inspection verified boundaries. Enumerated {p_seed['trees']} mature timber trees, {p_seed['structures']} masonry pucca structures, and {p_seed['wells']} functional borewell.",
                trees_count=p_seed["trees"],
                structures_count=p_seed["structures"],
                wells_count=p_seed["wells"],
                verification_status="VERIFIED",
            )
            session.add(fv)

        # 6. Workflow Tasks for pending/disputed parcels
        if p_seed["status"] == "DISPUTED":
            task = WorkflowTask(
                project_id=project.id,
                parcel_id=parcel.id,
                task_type="OBJECTION_HEARING_PENDING",
                title=f"Resolve Title Dispute on Khasra {p_seed['khasra']}",
                description=f"Section 15 dispute notice pending CALA disposal order before final award apportionment.",
                assigned_role=RoleCode.DISTRICT_OFFICER.value,
                assigned_user_id=cala_user.id if cala_user else None,
                status="PENDING",
                priority="HIGH",
                due_date=date.today() + timedelta(days=12),
                action_url=f"/projects/{project.id}",
                created_at=datetime.now(timezone.utc),
            )
            session.add(task)

        elif p_seed["status"] in ("NOTIFIED_SEC11", "PROPOSED"):
            task = WorkflowTask(
                project_id=project.id,
                parcel_id=parcel.id,
                task_type="FIELD_VERIFICATION_PENDING",
                title=f"Ground Truthing Required for Khasra {p_seed['khasra']}",
                description=f"Complete on-site asset enumeration and tree census for village {p_seed['village_id']}.",
                assigned_role=RoleCode.FIELD_OFFICER.value,
                assigned_user_id=field_user.id if field_user else None,
                status="PENDING",
                priority="NORMAL",
                due_date=date.today() + timedelta(days=7),
                action_url=f"/land-parcels/{parcel.id}",
                created_at=datetime.now(timezone.utc),
            )
            session.add(task)

    await session.commit()
    print("All 12 cadastral parcels, owners, verifications, and tasks seeded successfully.")


async def main():
    async with AsyncSessionLocal() as session:
        await seed_stages_and_tasks(session)
        await seed_parcels(session)


if __name__ == "__main__":
    asyncio.run(main())
