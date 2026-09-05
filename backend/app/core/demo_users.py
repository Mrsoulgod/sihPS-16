import uuid
from typing import Optional, Dict, Any
from app.models.user import User
from app.models.role import Role
from app.models.location import State, District

DEMO_USER_PROFILES = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "username": "central_officer",
        "alias_username": "central_admin",
        "email": "central@gov.demo",
        "full_name": "Shri Rajesh Kumar",
        "designation": "Joint Secretary (Land Acquisition)",
        "organization": "Ministry of Road Transport & Highways",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
        "username": "cala_jaipur",
        "alias_username": "district_officer",
        "email": "district@gov.demo",
        "full_name": "Dr. Amit Sharma, IAS",
        "designation": "District Collector & CALA",
        "organization": "District Land Acquisition Authority, Jaipur",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "username": "field_officer",
        "alias_username": "field",
        "email": "field@gov.demo",
        "full_name": "Shri Ramesh Choudhary",
        "designation": "Senior Revenue Inspector & Field Surveyor",
        "organization": "Tehsil Kotputli Revenue Office",
        "role_id": "ROLE_FIELD_OFFICER",
        "role_name": "Field Officer / Surveyor",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
        "username": "state_officer",
        "alias_username": "state",
        "email": "state@gov.demo",
        "full_name": "Smt. Sunita Verma, IAS",
        "designation": "Principal Secretary (Revenue)",
        "organization": "Revenue & Colonisation Department, Govt. of Rajasthan",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": None,
        "district_name": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000005"),
        "username": "agency_officer",
        "alias_username": "agency",
        "email": "agency@gov.demo",
        "full_name": "Er. Vikram Singh",
        "designation": "Chief General Manager (Technical)",
        "organization": "National Highways Authority of India (NHAI)",
        "role_id": "ROLE_PROJECT_AGENCY",
        "role_name": "Project Implementing Agency",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000006"),
        "username": "admin",
        "alias_username": "sysadmin",
        "email": "admin@gov.demo",
        "full_name": "Principal Systems Administrator",
        "designation": "Lead System Architect",
        "organization": "National Land Acquisition & Management System (NLAMS)",
        "role_id": "ROLE_ADMIN",
        "role_name": "System Administrator",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
    },
]

DEMO_USERS_MAP: Dict[str, Dict[str, Any]] = {}
for p in DEMO_USER_PROFILES:
    DEMO_USERS_MAP[p["username"].lower()] = p
    DEMO_USERS_MAP[p["email"].lower()] = p
    if "alias_username" in p:
        DEMO_USERS_MAP[p["alias_username"].lower()] = p


def get_canonical_demo_data(identifier: str) -> Optional[Dict[str, Any]]:
    clean_id = identifier.strip().lower()
    return DEMO_USERS_MAP.get(clean_id)


def create_demo_user_model(data: Dict[str, Any]) -> User:
    u = User(
        id=data["id"],
        role_id=data["role_id"],
        email=data["email"],
        username=data["username"],
        hashed_password="",
        full_name=data["full_name"],
        designation=data["designation"],
        organization=data["organization"],
        state_id=data["state_id"],
        district_id=data["district_id"],
        is_active=True,
    )
    r = Role(id=data["role_id"], name=data["role_name"])
    u.role = r
    if data["state_id"]:
        u.state = State(id=data["state_id"], name=data["state_name"] or "Rajasthan", code="RJ")
    if data["district_id"]:
        u.district = District(id=data["district_id"], state_id=data["state_id"] or "IN-RJ", name=data["district_name"] or "Jaipur")
    return u


def get_demo_user_by_uuid(user_uuid: uuid.UUID) -> Optional[User]:
    for p in DEMO_USER_PROFILES:
        if p["id"] == user_uuid:
            return create_demo_user_model(p)
    return None


def get_demo_user_by_role(role_id: str) -> Optional[User]:
    clean_role = role_id.strip().upper()
    if not clean_role.startswith("ROLE_"):
        clean_role = f"ROLE_{clean_role}"
    for p in DEMO_USER_PROFILES:
        if p["role_id"] == clean_role:
            return create_demo_user_model(p)
    return None


def get_demo_user(identifier: str) -> Optional[User]:
    data = get_canonical_demo_data(identifier)
    if data:
        return create_demo_user_model(data)
    return None

