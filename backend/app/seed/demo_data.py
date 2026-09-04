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
            "username": "district_officer",
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
            "username": "admin_officer",
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


async def seed_all(session: AsyncSession) -> None:
    """Run full idempotent database seeding."""
    await seed_roles(session)
    await seed_locations(session)
    await seed_demo_users(session)
    await session.commit()
    logger.info("All seed data successfully applied.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def run():
        async with AsyncSessionLocal() as session:
            await seed_all(session)
    asyncio.run(run())
