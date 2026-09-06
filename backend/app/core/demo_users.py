import uuid
from typing import Optional, Dict, Any, List
from app.models.user import User
from app.models.role import Role
from app.models.location import State, District

ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "ROLE_CENTRAL_OFFICER": [
        "VIEW_NATIONAL_PIPELINE",
        "VIEW_ALL_STATES",
        "APPROVE_CENTRAL_SANCTIONS",
        "VIEW_ANALYTICS",
        "EXPORT_MIS_REPORTS",
        "VIEW_GIS_NATIONAL",
    ],
    "ROLE_STATE_OFFICER": [
        "VIEW_STATE_PIPELINE",
        "OVERSEE_DISTRICTS",
        "REVIEW_SECTION_19",
        "VIEW_ANALYTICS",
        "EXPORT_STATE_REPORTS",
        "VIEW_GIS_STATE",
    ],
    "ROLE_DISTRICT_OFFICER": [
        "MANAGE_DISTRICT_PROJECTS",
        "APPROVE_WORKFLOW_STAGES",
        "CONDUCT_OBJECTIONS",
        "DECLARE_SECTION_23_AWARD",
        "AUTHORIZE_PFMS_DISBURSEMENTS",
        "APPROVE_SECTION_38_POSSESSION",
        "VIEW_GIS_DISTRICT",
    ],
    "ROLE_PROJECT_AGENCY": [
        "SUBMIT_PROJECT_PROPOSALS",
        "UPLOAD_DPR",
        "DEPOSIT_COMPENSATION",
        "REQUEST_POSSESSION",
        "VIEW_PROJECT_PROGRESS",
    ],
    "ROLE_FIELD_OFFICER": [
        "VIEW_ASSIGNED_TASKS",
        "CONDUCT_GROUND_SURVEY",
        "UPLOAD_FIELD_GEOJSON",
        "VERIFY_PARCEL_ASSETS",
        "SUBMIT_SURVEY_REPORT",
    ],
    "ROLE_SOCIAL_OFFICER": [
        "MANAGE_RR_SCHEMES",
        "CONDUCT_PAF_CENSUS",
        "VALIDATE_ENTITLEMENTS",
        "APPROVE_ALLOTMENTS",
        "VIEW_RR_DASHBOARD",
    ],
    "ROLE_ADMIN": [
        "SYSTEM_ADMIN",
        "MANAGE_USERS",
        "VIEW_SECURITY_AUDIT",
        "OVERRIDE_WORKFLOW",
        "MANAGE_TAXONOMY",
        "ALL_PERMISSIONS",
    ],
    "ROLE_SUPER_ADMIN": [
        "SYSTEM_ADMIN",
        "MANAGE_USERS",
        "VIEW_SECURITY_AUDIT",
        "OVERRIDE_WORKFLOW",
        "MANAGE_TAXONOMY",
        "ALL_PERMISSIONS",
    ],
}

DEMO_USER_PROFILES = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "username": "central_admin",
        "alias_username": "central_officer",
        "email": "central@gov.demo",
        "full_name": "Shri Rajesh Kumar",
        "designation": "Joint Secretary (Land Acquisition)",
        "organization": "Ministry of Road Transport & Highways (MoRTH)",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "jurisdiction_level": "CENTRAL",
        "scope_display": "All India (National Mandate)",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
        "username": "state_rj_officer",
        "alias_username": "state_officer",
        "email": "state@gov.demo",
        "full_name": "Smt. Sunita Verma, IAS",
        "designation": "Principal Secretary (Revenue)",
        "organization": "Revenue & Colonisation Department, Govt. of Rajasthan",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Rajasthan State (IN-RJ)",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
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
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Jaipur District (DST-JAI), Rajasthan",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000005"),
        "username": "nhai_pd_jaipur",
        "alias_username": "agency_officer",
        "email": "agency@gov.demo",
        "full_name": "Er. Vikram Singh",
        "designation": "Project Director (NHAI Jaipur)",
        "organization": "National Highways Authority of India (NHAI)",
        "role_id": "ROLE_PROJECT_AGENCY",
        "role_name": "Project Implementing Agency",
        "jurisdiction_level": "PROJECT",
        "scope_display": "NHAI Jaipur Projects (PRJ-NH48-PKG4)",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
        "tehsil_id": None,
        "project_id": "PRJ-NH48-PKG4",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "username": "patwari_kotputli",
        "alias_username": "field_officer",
        "email": "field@gov.demo",
        "full_name": "Shri Ramesh Choudhary",
        "designation": "Senior Revenue Inspector & Field Surveyor (Patwari)",
        "organization": "Tehsil Kotputli Revenue Office",
        "role_id": "ROLE_FIELD_OFFICER",
        "role_name": "Field Officer / Surveyor",
        "jurisdiction_level": "FIELD",
        "scope_display": "Tehsil Kotputli (TEH-KOT), Jaipur",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
        "tehsil_id": "TEH-KOT",
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000007"),
        "username": "randr_jaipur",
        "alias_username": "social_officer",
        "email": "randr@gov.demo",
        "full_name": "Smt. Meenakshi Sundaram",
        "designation": "Social Development & R&R Officer",
        "organization": "Directorate of Resettlement & Rehabilitation, Jaipur",
        "role_id": "ROLE_SOCIAL_OFFICER",
        "role_name": "Social Development & R&R Officer",
        "jurisdiction_level": "SOCIAL",
        "scope_display": "Jaipur District R&R Schemes (DST-JAI)",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JAI",
        "district_name": "Jaipur",
        "tehsil_id": None,
        "project_id": None,
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
        "jurisdiction_level": "CENTRAL",
        "scope_display": "National Platform Infrastructure",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
]

DEMO_USERS_MAP: Dict[str, Dict[str, Any]] = {}
for p in DEMO_USER_PROFILES:
    DEMO_USERS_MAP[p["username"].lower()] = p
    DEMO_USERS_MAP[p["email"].lower()] = p
    if "alias_username" in p and p["alias_username"]:
        DEMO_USERS_MAP[p["alias_username"].lower()] = p


def get_permissions_for_role(role_id: str) -> List[str]:
    clean_role = role_id.strip().upper()
    if not clean_role.startswith("ROLE_"):
        clean_role = f"ROLE_{clean_role}"
    return ROLE_PERMISSIONS.get(clean_role, ["VIEW_GENERAL"])


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
        state_id=data.get("state_id"),
        district_id=data.get("district_id"),
        is_active=True,
    )
    r = Role(id=data["role_id"], name=data["role_name"])
    u.role = r
    if data.get("state_id"):
        u.state = State(id=data["state_id"], name=data.get("state_name") or "Rajasthan", code="RJ")
    if data.get("district_id"):
        u.district = District(id=data["district_id"], state_id=data.get("state_id") or "IN-RJ", name=data.get("district_name") or "Jaipur")
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


