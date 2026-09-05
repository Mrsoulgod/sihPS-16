import asyncio
import logging
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.location import State, District, Tehsil, Village
from app.models.user import User
from app.models.project import Project
from app.models.audit import AuditLog
from app.models.enums import RoleCode

logger = logging.getLogger(__name__)


async def seed_roles(session: AsyncSession) -> None:
    """Seed initial system roles."""
    roles_data = [
        {"id": RoleCode.CENTRAL_OFFICER.value, "name": "Central Ministry Officer", "description": "National project pipeline monitoring, sanctioning, and cross-state coordination."},
        {"id": RoleCode.STATE_OFFICER.value, "name": "State Government Officer", "description": "State-level gazette oversight, inter-district coordination, and Section 19 reviews."},
        {"id": RoleCode.DISTRICT_OFFICER.value, "name": "District CALA / Collector", "description": "Competent Authority for Land Acquisition, objection hearings, Section 23 awards, and DBT approvals."},
        {"id": RoleCode.PROJECT_AGENCY.value, "name": "Project Implementing Agency", "description": "DPR upload, alignment submission, compensation deposits, and taking physical possession."},
        {"id": RoleCode.FIELD_OFFICER.value, "name": "Field Officer / Surveyor", "description": "Ground truthing, asset valuation (trees/structures), and KYC verification."},
        {"id": RoleCode.ADMIN.value, "name": "System Administrator", "description": "System configuration, user provisioning, security, and audit management."},
    ]

    for r in roles_data:
        existing = await session.get(Role, r["id"])
        if not existing:
            session.add(Role(**r))
    await session.flush()
    logger.info("Roles seeded successfully.")


async def seed_locations(session: AsyncSession) -> None:
    """Seed sample administrative hierarchy (States, Districts, Tehsils, Villages)."""
    # States
    states = [
        {"id": "IN-RJ", "name": "Rajasthan", "code": "RJ"},
        {"id": "IN-HR", "name": "Haryana", "code": "HR"},
        {"id": "IN-DL", "name": "Delhi (NCT)", "code": "DL"},
    ]
    for s in states:
        existing = await session.get(State, s["id"])
        if not existing:
            session.add(State(**s))
    await session.flush()

    # Districts
    districts = [
        {"id": "DST-JAI", "state_id": "IN-RJ", "name": "Jaipur", "lgd_code": "0801"},
        {"id": "DST-ALW", "state_id": "IN-RJ", "name": "Alwar", "lgd_code": "0802"},
        {"id": "DST-GUR", "state_id": "IN-HR", "name": "Gurugram", "lgd_code": "0601"},
        {"id": "DST-REW", "state_id": "IN-HR", "name": "Rewari", "lgd_code": "0602"},
        {"id": "DST-DEL", "state_id": "IN-DL", "name": "North Delhi", "lgd_code": "0701"},
    ]
    for d in districts:
        existing = await session.get(District, d["id"])
        if not existing:
            session.add(District(**d))
    await session.flush()

    # Tehsils
    tehsils = [
        {"id": "TEH-KOT", "district_id": "DST-JAI", "name": "Kotputli"},
        {"id": "TEH-SHA", "district_id": "DST-JAI", "name": "Shahpura"},
    ]
    for t in tehsils:
        existing = await session.get(Tehsil, t["id"])
        if not existing:
            session.add(Tehsil(**t))
    await session.flush()

    # Villages
    villages = [
        {"id": "VIL-MAN-01", "tehsil_id": "TEH-KOT", "name": "Manpura", "census_code": "0801001", "circle_rate_rural_factor": Decimal("1.50")},
        {"id": "VIL-PAW-02", "tehsil_id": "TEH-KOT", "name": "Paota", "census_code": "0801002", "circle_rate_rural_factor": Decimal("1.25")},
    ]
    for v in villages:
        existing = await session.get(Village, v["id"])
        if not existing:
            session.add(Village(**v))
    await session.flush()
    logger.info("Administrative locations seeded successfully.")


async def seed_demo_users(session: AsyncSession) -> None:
    """Seed safe, fictional demonstration accounts for each role."""
    hashed_pwd = get_password_hash(settings.DEMO_USER_PASSWORD)

    demo_users = [
        {
            "username": "central_officer",
            "email": "central@gov.demo",
            "full_name": "Shri Rajesh Kumar",
            "designation": "Joint Secretary (Land Acquisition)",
            "organization": "Ministry of Road Transport & Highways",
            "role_id": RoleCode.CENTRAL_OFFICER.value,
            "state_id": None,
            "district_id": None,
        },
        {
            "username": "state_officer",
            "email": "state@gov.demo",
            "full_name": "Smt. Sunita Verma, IAS",
            "designation": "Principal Secretary (Revenue)",
            "organization": "Revenue & Colonisation Department, Govt. of Rajasthan",
            "role_id": RoleCode.STATE_OFFICER.value,
            "state_id": "IN-RJ",
            "district_id": None,
        },
        {
            "username": "cala_jaipur",
            "email": "district@gov.demo",
            "full_name": "Dr. Amit Sharma, IAS",
            "designation": "District Collector & CALA",
            "organization": "District Land Acquisition Authority, Jaipur",
            "role_id": RoleCode.DISTRICT_OFFICER.value,
            "state_id": "IN-RJ",
            "district_id": "DST-JAI",
        },
        {
            "username": "agency_officer",
            "email": "agency@gov.demo",
            "full_name": "Er. Vikram Singh",
            "designation": "Chief General Manager (Technical)",
            "organization": "National Highways Authority of India (NHAI)",
            "role_id": RoleCode.PROJECT_AGENCY.value,
            "state_id": None,
            "district_id": None,
        },
        {
            "username": "field_officer",
            "email": "field@gov.demo",
            "full_name": "Shri Ramesh Choudhary",
            "designation": "Senior Revenue Inspector & Field Surveyor",
            "organization": "Tehsil Kotputli Revenue Office",
            "role_id": RoleCode.FIELD_OFFICER.value,
            "state_id": "IN-RJ",
            "district_id": "DST-JAI",
        },
        {
            "username": "admin",
            "email": "admin@gov.demo",
            "full_name": "Principal Systems Administrator",
            "designation": "Lead System Architect",
            "organization": "National Land Acquisition & Management System (NLAMS)",
            "role_id": RoleCode.ADMIN.value,
            "state_id": None,
            "district_id": None,
        },
    ]

    for u_data in demo_users:
        stmt = select(User).where(User.username == u_data["username"])
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if not existing:
            user = User(
                **u_data,
                hashed_password=hashed_pwd,
                is_active=True,
            )
            session.add(user)
    await session.flush()
    logger.info("Demo users seeded successfully.")


async def seed_projects(session: AsyncSession) -> None:
    """Seed benchmark national infrastructure projects."""
    agency_stmt = select(User).where(User.username == "agency_officer")
    agency_user = (await session.execute(agency_stmt)).scalar_one_or_none()
    creator_id = agency_user.id if agency_user else None

    if not creator_id:
        admin_stmt = select(User).where(User.username == "admin_officer")
        admin_user = (await session.execute(admin_stmt)).scalar_one_or_none()
        creator_id = admin_user.id if admin_user else None

    projects_data = [
        {
            "project_code": "PRJ-NH48-PKG4",
            "title": "Delhi–Jaipur Expressway Expansion (NH-48 Package IV)",
            "description": "Six-laning corridor expansion under Bharatmala Pariyojana covering Jaipur, Kotputli, and Behror revenue stretches.",
            "sponsoring_ministry": "Ministry of Road Transport and Highways",
            "implementing_agency": "National Highways Authority of India (NHAI)",
            "current_stage": "COMPENSATION_DISBURSEMENT",
            "primary_district_id": "DST-JAI",
            "total_land_proposed_acres": Decimal("500.0000"),
            "total_land_acquired_acres": Decimal("420.0000"),
            "total_possession_acres": Decimal("395.0000"),
            "estimated_budget_inr_cr": Decimal("1250.00"),
            "compensation_assessed_cr": Decimal("620.00"),
            "compensation_disbursed_cr": Decimal("570.00"),
            "total_paf_count": 1240,
            "total_pdf_count": 380,
            "randr_completion_percent": Decimal("72.00"),
            "risk_score": 68,
            "created_by_user_id": creator_id,
        },
        {
            "project_code": "PRJ-WDFC-ALW",
            "title": "Western Dedicated Freight Corridor (Rewari–Alwar Section)",
            "description": "Heavy-haul electric freight railway track acquisition across Haryana-Rajasthan border corridor.",
            "sponsoring_ministry": "Ministry of Railways",
            "implementing_agency": "Dedicated Freight Corridor Corporation of India (DFCCIL)",
            "current_stage": "POSSESSION",
            "primary_district_id": "DST-ALW",
            "total_land_proposed_acres": Decimal("320.0000"),
            "total_land_acquired_acres": Decimal("310.0000"),
            "total_possession_acres": Decimal("295.0000"),
            "estimated_budget_inr_cr": Decimal("850.00"),
            "compensation_assessed_cr": Decimal("410.00"),
            "compensation_disbursed_cr": Decimal("398.00"),
            "total_paf_count": 650,
            "total_pdf_count": 190,
            "randr_completion_percent": Decimal("88.00"),
            "risk_score": 24,
            "created_by_user_id": creator_id,
        },
        {
            "project_code": "PRJ-GUR-METRO",
            "title": "Gurugram Metro Rail Rapid Transit Corridor Extension",
            "description": "Rapid transit corridor extension connecting Millennium City Centre to Cyber City loop.",
            "sponsoring_ministry": "Ministry of Housing and Urban Affairs",
            "implementing_agency": "Delhi Metro Rail Corporation (DMRC)",
            "current_stage": "LAND_IDENTIFICATION",
            "primary_district_id": "DST-GUR",
            "total_land_proposed_acres": Decimal("140.0000"),
            "total_land_acquired_acres": Decimal("35.0000"),
            "total_possession_acres": Decimal("0.0000"),
            "estimated_budget_inr_cr": Decimal("2100.00"),
            "compensation_assessed_cr": Decimal("85.00"),
            "compensation_disbursed_cr": Decimal("20.00"),
            "total_paf_count": 310,
            "total_pdf_count": 85,
            "randr_completion_percent": Decimal("15.00"),
            "risk_score": 78,
            "created_by_user_id": creator_id,
        },
        {
            "project_code": "PRJ-DAK-REW",
            "title": "Delhi–Amritsar–Katra Expressway (Haryana Spur)",
            "description": "Access-controlled greenfield expressway connecting Delhi metropolitan ring to Rewari interchange.",
            "sponsoring_ministry": "Ministry of Road Transport and Highways",
            "implementing_agency": "National Highways Authority of India (NHAI)",
            "current_stage": "AWARD",
            "primary_district_id": "DST-REW",
            "total_land_proposed_acres": Decimal("450.0000"),
            "total_land_acquired_acres": Decimal("390.0000"),
            "total_possession_acres": Decimal("340.0000"),
            "estimated_budget_inr_cr": Decimal("1600.00"),
            "compensation_assessed_cr": Decimal("520.00"),
            "compensation_disbursed_cr": Decimal("480.00"),
            "total_paf_count": 890,
            "total_pdf_count": 260,
            "randr_completion_percent": Decimal("65.00"),
            "risk_score": 32,
            "created_by_user_id": creator_id,
        },
        {
            "project_code": "PRJ-MMLP-DEL",
            "title": "Delhi Multi-Modal Logistics Park (MMLP Narela)",
            "description": "State-of-the-art intermodal freight logistics hub with direct rail and highway connectivity.",
            "sponsoring_ministry": "Ministry of Road Transport and Highways",
            "implementing_agency": "National Highways Logistics Management Limited (NHLML)",
            "current_stage": "COMPLETION",
            "primary_district_id": "DST-DEL",
            "total_land_proposed_acres": Decimal("280.0000"),
            "total_land_acquired_acres": Decimal("280.0000"),
            "total_possession_acres": Decimal("280.0000"),
            "estimated_budget_inr_cr": Decimal("980.00"),
            "compensation_assessed_cr": Decimal("340.00"),
            "compensation_disbursed_cr": Decimal("340.00"),
            "total_paf_count": 420,
            "total_pdf_count": 0,
            "randr_completion_percent": Decimal("100.00"),
            "risk_score": 10,
            "created_by_user_id": creator_id,
        },
    ]

    for p_data in projects_data:
        stmt = select(Project).where(Project.project_code == p_data["project_code"])
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if not existing:
            project = Project(**p_data)
            session.add(project)
    await session.flush()
    logger.info("Benchmark projects seeded successfully.")


async def seed_activity(session: AsyncSession) -> None:
    """Seed initial realistic statutory audit logs for activity feeds."""
    cala_stmt = select(User).where(User.username.in_(["cala_jaipur", "district_officer"]))
    cala_user = (await session.execute(cala_stmt)).scalar_one_or_none()
    cala_id = cala_user.id if cala_user else None

    agency_stmt = select(User).where(User.username == "agency_officer")
    agency_user = (await session.execute(agency_stmt)).scalar_one_or_none()
    agency_id = agency_user.id if agency_user else None

    field_stmt = select(User).where(User.username == "field_officer")
    field_user = (await session.execute(field_stmt)).scalar_one_or_none()
    field_id = field_user.id if field_user else None

    # Check if we already seeded sample activities
    check_stmt = select(AuditLog).where(AuditLog.action.in_([
        "NOTIFICATION_PUBLISHED", "CALA_HEARING_SCHEDULED", "PFMS_BATCH_APPROVED", "POSSESSION_EXECUTED"
    ]))
    existing = (await session.execute(check_stmt)).first()
    if not existing:
        sample_activities = [
            AuditLog(
                user_id=cala_id,
                action="PFMS_BATCH_APPROVED",
                entity_name="Disbursement",
                entity_id="BATCH-PFMS-2026-088",
                new_values={
                    "project_code": "PRJ-NH48-PKG4",
                    "amount_cr": 42.50,
                    "beneficiaries": 84,
                    "description": "PFMS Direct Benefit Transfer batch of ₹42.50 Cr authorized for Kotputli Tehsil."
                },
            ),
            AuditLog(
                user_id=cala_id,
                action="CALA_HEARING_SCHEDULED",
                entity_name="Notification",
                entity_id="NOTIF-SEC15-JAI-04",
                new_values={
                    "project_code": "PRJ-NH48-PKG4",
                    "khasras": ["142", "143", "144/1"],
                    "description": "Section 15 objection hearing scheduled before CALA Jaipur for village Manpura."
                },
            ),
            AuditLog(
                user_id=agency_id,
                action="POSSESSION_EXECUTED",
                entity_name="Possession",
                entity_id="POSS-WDFC-2026-019",
                new_values={
                    "project_code": "PRJ-WDFC-ALW",
                    "acres": 295.0,
                    "description": "Section 38 Panchnama executed; 295.00 acres handed over encumbrance-free to DFCCIL."
                },
            ),
            AuditLog(
                user_id=field_id,
                action="FIELD_VERIFICATION_SUBMITTED",
                entity_name="LandParcel",
                entity_id="PARCEL-MAN-0012",
                new_values={
                    "project_code": "PRJ-NH48-PKG4",
                    "village": "Manpura",
                    "description": "Cadastral ground truthing and tree enumeration report completed for Khasra 88/2."
                },
            ),
            AuditLog(
                user_id=agency_id,
                action="PROPOSAL_DPR_SUBMITTED",
                entity_name="Project",
                entity_id="PRJ-GUR-METRO",
                new_values={
                    "project_code": "PRJ-GUR-METRO",
                    "description": "Detailed Project Report and KML alignment corridor submitted for Gurugram Metro Extension."
                },
            ),
        ]
        session.add_all(sample_activities)
        await session.flush()
        logger.info("Initial statutory activities seeded successfully.")


async def seed_all(session: AsyncSession) -> None:
    """Run full idempotent database seeding."""
    await seed_roles(session)
    await seed_locations(session)
    await seed_demo_users(session)
    await seed_projects(session)
    await seed_activity(session)
    from app.seed.seed_phase4 import seed_stages_and_tasks, seed_parcels
    await seed_stages_and_tasks(session)
    await seed_parcels(session)
    await session.commit()
    logger.info("All seed data successfully applied.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def run():
        async with AsyncSessionLocal() as session:
            await seed_all(session)
    asyncio.run(run())
