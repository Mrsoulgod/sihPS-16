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
    # ==========================================
    # 1. CENTRAL LEADERSHIP SUITE (5 PROFILES)
    # ==========================================
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "username": "central_admin",
        "alias_username": "central_js",
        "email": "central@gov.demo",
        "full_name": "Shri Rajesh Kumar, IAS",
        "designation": "Joint Secretary (Land Acquisition & National Highways)",
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
        "id": uuid.UUID("00000000-0000-0000-0000-000000000011"),
        "username": "central_dg",
        "alias_username": "central_compliance",
        "email": "dg.compliance@gov.demo",
        "full_name": "Smt. Sunita Rao, IDAS",
        "designation": "Director General (Statutory Compliance & Land Audits)",
        "organization": "Department of Land Resources (DoLR), MoRD",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "jurisdiction_level": "CENTRAL",
        "scope_display": "All India (Compliance & Audits)",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000012"),
        "username": "central_nhai_member",
        "alias_username": "central_nhai",
        "email": "member.land@nhai.demo",
        "full_name": "Shri Arvind K. Mishra",
        "designation": "Member (PPP & Land Assets)",
        "organization": "National Highways Authority of India (NHAI HQ)",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "jurisdiction_level": "CENTRAL",
        "scope_display": "NHAI National Corridor Network",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000013"),
        "username": "central_cpd",
        "alias_username": "central_greenfield",
        "email": "cpd.corridors@gov.demo",
        "full_name": "Dr. S. K. Sen",
        "designation": "Chief Project Director (National Greenfield Corridors)",
        "organization": "PM GatiShakti National Master Plan Cell",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "jurisdiction_level": "CENTRAL",
        "scope_display": "National Expressways & Multi-Modal Hubs",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000014"),
        "username": "central_rr_comm",
        "alias_username": "central_social",
        "email": "commissioner.rr@gov.demo",
        "full_name": "Prof. Anuradha Menon",
        "designation": "National Social Impact & R&R Commissioner",
        "organization": "National R&R Monitoring Authority",
        "role_id": "ROLE_CENTRAL_OFFICER",
        "role_name": "Central Ministry Officer",
        "jurisdiction_level": "CENTRAL",
        "scope_display": "National Resettlement & PAF Welfare Oversight",
        "state_id": None,
        "state_name": None,
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },

    # ==========================================
    # 2. STATE PORTAL REVENUE OFFICERS (6 STATES)
    # ==========================================
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
        "id": uuid.UUID("00000000-0000-0000-0000-000000000021"),
        "username": "state_mh_officer",
        "alias_username": "state_mh",
        "email": "revenue.sec@maharashtra.demo",
        "full_name": "Shri Devendra Patil, IAS",
        "designation": "Secretary (Revenue & Forest)",
        "organization": "Revenue Department, Govt. of Maharashtra",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Maharashtra State (IN-MH)",
        "state_id": "IN-MH",
        "state_name": "Maharashtra",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000022"),
        "username": "state_up_officer",
        "alias_username": "state_up",
        "email": "board.revenue@up.demo",
        "full_name": "Shri Alok Tandon, IAS",
        "designation": "Chairman (Board of Revenue)",
        "organization": "Board of Revenue, Govt. of Uttar Pradesh",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Uttar Pradesh State (IN-UP)",
        "state_id": "IN-UP",
        "state_name": "Uttar Pradesh",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000023"),
        "username": "state_gj_officer",
        "alias_username": "state_gj",
        "email": "revenue.sec@gujarat.demo",
        "full_name": "Smt. Mona Khandhar, IAS",
        "designation": "Principal Secretary (Revenue)",
        "organization": "Revenue Department, Govt. of Gujarat",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Gujarat State (IN-GJ)",
        "state_id": "IN-GJ",
        "state_name": "Gujarat",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000024"),
        "username": "state_ka_officer",
        "alias_username": "state_ka",
        "email": "land.admin@karnataka.demo",
        "full_name": "Shri Rajeev Chawla, IAS",
        "designation": "Commissioner for Land Administration",
        "organization": "Revenue Department, Govt. of Karnataka",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Karnataka State (IN-KA)",
        "state_id": "IN-KA",
        "state_name": "Karnataka",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000025"),
        "username": "state_mp_officer",
        "alias_username": "state_mp",
        "email": "revenue.mp@mp.demo",
        "full_name": "Shri Vivek Aggarwal, IAS",
        "designation": "Principal Secretary (Revenue)",
        "organization": "Revenue Department, Govt. of Madhya Pradesh",
        "role_id": "ROLE_STATE_OFFICER",
        "role_name": "State Government Officer",
        "jurisdiction_level": "STATE",
        "scope_display": "Madhya Pradesh State (IN-MP)",
        "state_id": "IN-MP",
        "state_name": "Madhya Pradesh",
        "district_id": None,
        "district_name": None,
        "tehsil_id": None,
        "project_id": None,
    },

    # ==========================================
    # 3. DISTRICT CALA & COLLECTOR PROFILES
    # ==========================================
    # Rajasthan Districts
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
        "id": uuid.UUID("00000000-0000-0000-0000-000000000031"),
        "username": "cala_jodhpur",
        "alias_username": "district_jodhpur",
        "email": "cala.jodhpur@gov.demo",
        "full_name": "Shri Himanshu Gupta, IAS",
        "designation": "District Collector & CALA",
        "organization": "District Land Acquisition Authority, Jodhpur",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Jodhpur District (DST-JOD), Rajasthan",
        "state_id": "IN-RJ",
        "state_name": "Rajasthan",
        "district_id": "DST-JOD",
        "district_name": "Jodhpur",
        "tehsil_id": None,
        "project_id": None,
    },
    # Maharashtra Districts
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000032"),
        "username": "cala_pune",
        "alias_username": "district_pune",
        "email": "cala.pune@maharashtra.demo",
        "full_name": "Dr. Rajesh Deshmukh, IAS",
        "designation": "District Collector & CALA",
        "organization": "District Land Acquisition Cell, Pune",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Pune District (DST-PUN), Maharashtra",
        "state_id": "IN-MH",
        "state_name": "Maharashtra",
        "district_id": "DST-PUN",
        "district_name": "Pune",
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000033"),
        "username": "cala_nagpur",
        "alias_username": "district_nagpur",
        "email": "cala.nagpur@maharashtra.demo",
        "full_name": "Dr. Vipin Itankar, IAS",
        "designation": "District Collector & CALA",
        "organization": "District Land Acquisition Cell, Nagpur",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Nagpur District (DST-NAG), Maharashtra",
        "state_id": "IN-MH",
        "state_name": "Maharashtra",
        "district_id": "DST-NAG",
        "district_name": "Nagpur",
        "tehsil_id": None,
        "project_id": None,
    },
    # Uttar Pradesh Districts
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000034"),
        "username": "cala_lucknow",
        "alias_username": "district_lucknow",
        "email": "cala.lucknow@up.demo",
        "full_name": "Shri Surya Pal Gangwar, IAS",
        "designation": "District Magistrate & CALA",
        "organization": "Collectorate Land Acquisition Branch, Lucknow",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Lucknow District (DST-LKO), Uttar Pradesh",
        "state_id": "IN-UP",
        "state_name": "Uttar Pradesh",
        "district_id": "DST-LKO",
        "district_name": "Lucknow",
        "tehsil_id": None,
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000035"),
        "username": "cala_noida",
        "alias_username": "district_noida",
        "email": "cala.noida@up.demo",
        "full_name": "Shri Manish Verma, IAS",
        "designation": "District Magistrate & CALA",
        "organization": "District Collectorate, Gautam Buddha Nagar (Noida)",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Gautam Buddha Nagar (DST-GBN), Uttar Pradesh",
        "state_id": "IN-UP",
        "state_name": "Uttar Pradesh",
        "district_id": "DST-GBN",
        "district_name": "Gautam Buddha Nagar",
        "tehsil_id": None,
        "project_id": None,
    },
    # Gujarat Districts
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000036"),
        "username": "cala_ahmedabad",
        "alias_username": "district_ahmedabad",
        "email": "cala.ahmedabad@gujarat.demo",
        "full_name": "Smt. Praveena D.K., IAS",
        "designation": "District Collector & CALA",
        "organization": "District Land Acquisition Office, Ahmedabad",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Ahmedabad District (DST-AHM), Gujarat",
        "state_id": "IN-GJ",
        "state_name": "Gujarat",
        "district_id": "DST-AHM",
        "district_name": "Ahmedabad",
        "tehsil_id": None,
        "project_id": None,
    },
    # Karnataka Districts
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000037"),
        "username": "cala_bengaluru",
        "alias_username": "district_bengaluru",
        "email": "cala.bengaluru@karnataka.demo",
        "full_name": "Shri N. Manjunatha Prasad, IAS",
        "designation": "Special Deputy Commissioner (Land Acquisition)",
        "organization": "Bengaluru Rural District Administration",
        "role_id": "ROLE_DISTRICT_OFFICER",
        "role_name": "District CALA / Collector",
        "jurisdiction_level": "DISTRICT",
        "scope_display": "Bengaluru Rural (DST-BLR), Karnataka",
        "state_id": "IN-KA",
        "state_name": "Karnataka",
        "district_id": "DST-BLR",
        "district_name": "Bengaluru Rural",
        "tehsil_id": None,
        "project_id": None,
    },

    # ==========================================
    # 4. FIELD SURVEYORS & PATWARIS
    # ==========================================
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
        "id": uuid.UUID("00000000-0000-0000-0000-000000000041"),
        "username": "patwari_pune",
        "alias_username": "field_pune",
        "email": "patwari.pune@maharashtra.demo",
        "full_name": "Shri Santosh Shinde",
        "designation": "Talathi & Ground Cadastral Inspector",
        "organization": "Haveli Tehsil Land Revenue Branch, Pune",
        "role_id": "ROLE_FIELD_OFFICER",
        "role_name": "Field Officer / Surveyor",
        "jurisdiction_level": "FIELD",
        "scope_display": "Haveli Tehsil (TEH-HAV), Pune, Maharashtra",
        "state_id": "IN-MH",
        "state_name": "Maharashtra",
        "district_id": "DST-PUN",
        "district_name": "Pune",
        "tehsil_id": "TEH-HAV",
        "project_id": None,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000042"),
        "username": "patwari_lucknow",
        "alias_username": "field_lucknow",
        "email": "lekhpal.lucknow@up.demo",
        "full_name": "Shri Suresh Yadav",
        "designation": "Senior Lekhpal & Cadastral Surveyor",
        "organization": "Mohanlalganj Tehsil Revenue Office, Lucknow",
        "role_id": "ROLE_FIELD_OFFICER",
        "role_name": "Field Officer / Surveyor",
        "jurisdiction_level": "FIELD",
        "scope_display": "Mohanlalganj Tehsil (TEH-MOH), Lucknow, UP",
        "state_id": "IN-UP",
        "state_name": "Uttar Pradesh",
        "district_id": "DST-LKO",
        "district_name": "Lucknow",
        "tehsil_id": "TEH-MOH",
        "project_id": None,
    },

    # ==========================================
    # 5. SOCIAL DEVELOPMENT & R&R OFFICERS
    # ==========================================
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
        "id": uuid.UUID("00000000-0000-0000-0000-000000000051"),
        "username": "randr_pune",
        "alias_username": "social_pune",
        "email": "rr.pune@maharashtra.demo",
        "full_name": "Smt. Anjali Kadam",
        "designation": "District Social Welfare & Resettlement Officer",
        "organization": "Social Justice & Special Assistance Dept, Pune",
        "role_id": "ROLE_SOCIAL_OFFICER",
        "role_name": "Social Development & R&R Officer",
        "jurisdiction_level": "SOCIAL",
        "scope_display": "Pune District R&R Schemes (DST-PUN)",
        "state_id": "IN-MH",
        "state_name": "Maharashtra",
        "district_id": "DST-PUN",
        "district_name": "Pune",
        "tehsil_id": None,
        "project_id": None,
    },

    # ==========================================
    # 6. PROJECT IMPLEMENTING AGENCIES
    # ==========================================
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

    # ==========================================
    # 7. SYSTEM ADMINISTRATOR
    # ==========================================
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
        st_code = data["state_id"].replace("IN-", "")
        u.state = State(id=data["state_id"], name=data.get("state_name") or "State", code=st_code)
    if data.get("district_id"):
        u.district = District(id=data["district_id"], state_id=data.get("state_id") or "IN-RJ", name=data.get("district_name") or "District")
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


