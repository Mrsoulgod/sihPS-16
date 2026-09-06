import { apiClient } from "./client";
import { LoginCredentials, LoginResponseData, UserSummary } from "../types/auth";
import { ApiSuccessResponse } from "../types/api";

const TOKEN_KEY = "nlams_access_token";
const USER_KEY = "nlams_user_profile";

export const FRONTEND_DEMO_USERS: Record<string, UserSummary> = {
  central_admin: {
    id: "00000000-0000-0000-0000-000000000001",
    username: "central_admin",
    email: "central@gov.demo",
    full_name: "Shri Rajesh Kumar",
    display_name: "Shri Rajesh Kumar (Joint Secretary)",
    designation: "Joint Secretary (Land Acquisition)",
    organization: "Ministry of Road Transport & Highways (MoRTH)",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "CENTRAL",
      scope_display: "All India (National Mandate)",
    },
    permissions: [
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_ALL_STATES",
      "APPROVE_CENTRAL_SANCTIONS",
      "VIEW_ANALYTICS",
      "EXPORT_MIS_REPORTS",
      "VIEW_GIS_NATIONAL",
    ],
    is_active: true,
  },
  central_officer: {
    id: "00000000-0000-0000-0000-000000000001",
    username: "central_admin",
    email: "central@gov.demo",
    full_name: "Shri Rajesh Kumar",
    display_name: "Shri Rajesh Kumar (Joint Secretary)",
    designation: "Joint Secretary (Land Acquisition)",
    organization: "Ministry of Road Transport & Highways (MoRTH)",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "CENTRAL",
      scope_display: "All India (National Mandate)",
    },
    permissions: [
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_ALL_STATES",
      "APPROVE_CENTRAL_SANCTIONS",
      "VIEW_ANALYTICS",
      "EXPORT_MIS_REPORTS",
      "VIEW_GIS_NATIONAL",
    ],
    is_active: true,
  },
  state_rj_officer: {
    id: "00000000-0000-0000-0000-000000000004",
    username: "state_rj_officer",
    email: "state@gov.demo",
    full_name: "Smt. Sunita Verma, IAS",
    display_name: "Smt. Sunita Verma, IAS (Principal Secretary)",
    designation: "Principal Secretary (Revenue)",
    organization: "Revenue & Colonisation Department, Govt. of Rajasthan",
    role_id: "ROLE_STATE_OFFICER",
    role_name: "State Government Officer",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "STATE",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      scope_display: "Rajasthan State (IN-RJ)",
    },
    permissions: [
      "VIEW_STATE_PIPELINE",
      "OVERSEE_DISTRICTS",
      "REVIEW_SECTION_19",
      "VIEW_ANALYTICS",
      "EXPORT_STATE_REPORTS",
      "VIEW_GIS_STATE",
    ],
    is_active: true,
  },
  state_officer: {
    id: "00000000-0000-0000-0000-000000000004",
    username: "state_rj_officer",
    email: "state@gov.demo",
    full_name: "Smt. Sunita Verma, IAS",
    display_name: "Smt. Sunita Verma, IAS (Principal Secretary)",
    designation: "Principal Secretary (Revenue)",
    organization: "Revenue & Colonisation Department, Govt. of Rajasthan",
    role_id: "ROLE_STATE_OFFICER",
    role_name: "State Government Officer",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "STATE",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      scope_display: "Rajasthan State (IN-RJ)",
    },
    permissions: [
      "VIEW_STATE_PIPELINE",
      "OVERSEE_DISTRICTS",
      "REVIEW_SECTION_19",
      "VIEW_ANALYTICS",
      "EXPORT_STATE_REPORTS",
      "VIEW_GIS_STATE",
    ],
    is_active: true,
  },
  cala_jaipur: {
    id: "00000000-0000-0000-0000-000000000002",
    username: "cala_jaipur",
    email: "district@gov.demo",
    full_name: "Dr. Amit Sharma, IAS",
    display_name: "Dr. Amit Sharma, IAS (District Collector & CALA)",
    designation: "District Collector & CALA",
    organization: "District Land Acquisition Authority, Jaipur",
    role_id: "ROLE_DISTRICT_OFFICER",
    role_name: "District CALA / Collector",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "DISTRICT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      scope_display: "Jaipur District (DST-JAI), Rajasthan",
    },
    permissions: [
      "MANAGE_DISTRICT_PROJECTS",
      "APPROVE_WORKFLOW_STAGES",
      "CONDUCT_OBJECTIONS",
      "DECLARE_SECTION_23_AWARD",
      "AUTHORIZE_PFMS_DISBURSEMENTS",
      "APPROVE_SECTION_38_POSSESSION",
      "VIEW_GIS_DISTRICT",
    ],
    is_active: true,
  },
  district_officer: {
    id: "00000000-0000-0000-0000-000000000002",
    username: "cala_jaipur",
    email: "district@gov.demo",
    full_name: "Dr. Amit Sharma, IAS",
    display_name: "Dr. Amit Sharma, IAS (District Collector & CALA)",
    designation: "District Collector & CALA",
    organization: "District Land Acquisition Authority, Jaipur",
    role_id: "ROLE_DISTRICT_OFFICER",
    role_name: "District CALA / Collector",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "DISTRICT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      scope_display: "Jaipur District (DST-JAI), Rajasthan",
    },
    permissions: [
      "MANAGE_DISTRICT_PROJECTS",
      "APPROVE_WORKFLOW_STAGES",
      "CONDUCT_OBJECTIONS",
      "DECLARE_SECTION_23_AWARD",
      "AUTHORIZE_PFMS_DISBURSEMENTS",
      "APPROVE_SECTION_38_POSSESSION",
      "VIEW_GIS_DISTRICT",
    ],
    is_active: true,
  },
  nhai_pd_jaipur: {
    id: "00000000-0000-0000-0000-000000000005",
    username: "nhai_pd_jaipur",
    email: "agency@gov.demo",
    full_name: "Er. Vikram Singh",
    display_name: "Er. Vikram Singh (Project Director NHAI)",
    designation: "Project Director (NHAI Jaipur)",
    organization: "National Highways Authority of India (NHAI)",
    role_id: "ROLE_PROJECT_AGENCY",
    role_name: "Project Implementing Agency",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "PROJECT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      project_id: "PRJ-NH48-PKG4",
      scope_display: "NHAI Jaipur Projects (PRJ-NH48-PKG4)",
    },
    permissions: [
      "SUBMIT_PROJECT_PROPOSALS",
      "UPLOAD_DPR",
      "DEPOSIT_COMPENSATION",
      "REQUEST_POSSESSION",
      "VIEW_PROJECT_PROGRESS",
    ],
    is_active: true,
  },
  agency_officer: {
    id: "00000000-0000-0000-0000-000000000005",
    username: "nhai_pd_jaipur",
    email: "agency@gov.demo",
    full_name: "Er. Vikram Singh",
    display_name: "Er. Vikram Singh (Project Director NHAI)",
    designation: "Project Director (NHAI Jaipur)",
    organization: "National Highways Authority of India (NHAI)",
    role_id: "ROLE_PROJECT_AGENCY",
    role_name: "Project Implementing Agency",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "PROJECT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      project_id: "PRJ-NH48-PKG4",
      scope_display: "NHAI Jaipur Projects (PRJ-NH48-PKG4)",
    },
    permissions: [
      "SUBMIT_PROJECT_PROPOSALS",
      "UPLOAD_DPR",
      "DEPOSIT_COMPENSATION",
      "REQUEST_POSSESSION",
      "VIEW_PROJECT_PROGRESS",
    ],
    is_active: true,
  },
  patwari_kotputli: {
    id: "00000000-0000-0000-0000-000000000003",
    username: "patwari_kotputli",
    email: "field@gov.demo",
    full_name: "Shri Ramesh Choudhary",
    display_name: "Shri Ramesh Choudhary (Senior Revenue Inspector)",
    designation: "Senior Revenue Inspector & Field Surveyor (Patwari)",
    organization: "Tehsil Kotputli Revenue Office",
    role_id: "ROLE_FIELD_OFFICER",
    role_name: "Field Officer / Surveyor",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "FIELD",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      tehsil_id: "TEH-KOT",
      scope_display: "Tehsil Kotputli (TEH-KOT), Jaipur",
    },
    permissions: [
      "VIEW_ASSIGNED_TASKS",
      "CONDUCT_GROUND_SURVEY",
      "UPLOAD_FIELD_GEOJSON",
      "VERIFY_PARCEL_ASSETS",
      "SUBMIT_SURVEY_REPORT",
    ],
    is_active: true,
  },
  field_officer: {
    id: "00000000-0000-0000-0000-000000000003",
    username: "patwari_kotputli",
    email: "field@gov.demo",
    full_name: "Shri Ramesh Choudhary",
    display_name: "Shri Ramesh Choudhary (Senior Revenue Inspector)",
    designation: "Senior Revenue Inspector & Field Surveyor (Patwari)",
    organization: "Tehsil Kotputli Revenue Office",
    role_id: "ROLE_FIELD_OFFICER",
    role_name: "Field Officer / Surveyor",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "FIELD",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      tehsil_id: "TEH-KOT",
      scope_display: "Tehsil Kotputli (TEH-KOT), Jaipur",
    },
    permissions: [
      "VIEW_ASSIGNED_TASKS",
      "CONDUCT_GROUND_SURVEY",
      "UPLOAD_FIELD_GEOJSON",
      "VERIFY_PARCEL_ASSETS",
      "SUBMIT_SURVEY_REPORT",
    ],
    is_active: true,
  },
  randr_jaipur: {
    id: "00000000-0000-0000-0000-000000000007",
    username: "randr_jaipur",
    email: "randr@gov.demo",
    full_name: "Smt. Meenakshi Sundaram",
    display_name: "Smt. Meenakshi Sundaram (Social Development Officer)",
    designation: "Social Development & R&R Officer",
    organization: "Directorate of Resettlement & Rehabilitation, Jaipur",
    role_id: "ROLE_SOCIAL_OFFICER",
    role_name: "Social Development & R&R Officer",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "SOCIAL",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      scope_display: "Jaipur District R&R Schemes (DST-JAI)",
    },
    permissions: [
      "MANAGE_RR_SCHEMES",
      "CONDUCT_PAF_CENSUS",
      "VALIDATE_ENTITLEMENTS",
      "APPROVE_ALLOTMENTS",
      "VIEW_RR_DASHBOARD",
    ],
    is_active: true,
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000006",
    username: "admin",
    email: "admin@gov.demo",
    full_name: "Principal Systems Administrator",
    display_name: "Lead System Architect (NLAMS Central)",
    designation: "Lead System Architect",
    organization: "National Land Acquisition & Management System (NLAMS)",
    role_id: "ROLE_ADMIN",
    role_name: "System Administrator",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "CENTRAL",
      scope_display: "National Platform Infrastructure",
    },
    permissions: [
      "SYSTEM_ADMIN",
      "MANAGE_USERS",
      "VIEW_SECURITY_AUDIT",
      "OVERRIDE_WORKFLOW",
      "MANAGE_TAXONOMY",
      "ALL_PERMISSIONS",
    ],
    is_active: true,
  },
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): UserSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserSummary): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function removeStoredUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

function findDemoUser(identifier: string): UserSummary | null {
  const clean = identifier.trim().toLowerCase();
  if (FRONTEND_DEMO_USERS[clean]) {
    return FRONTEND_DEMO_USERS[clean];
  }
  for (const u of Object.values(FRONTEND_DEMO_USERS)) {
    if (u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) {
      return u;
    }
  }
  return null;
}

export async function loginUser(credentials: LoginCredentials): Promise<ApiSuccessResponse<LoginResponseData>> {
  try {
    const res = await apiClient<LoginResponseData>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.data?.access_token) {
      setStoredToken(res.data.access_token);
    }
    if (res.data?.user) {
      setStoredUser(res.data.user);
    }
    return res;
  } catch (err: any) {
    // If backend is unreachable or local development fallback
    const demoUser = findDemoUser(credentials.username_or_email);
    if (demoUser && (credentials.password === "Password@123" || credentials.password === "DemoPass@123")) {
      const mockToken = `demo_token_${demoUser.id}`;
      setStoredToken(mockToken);
      setStoredUser(demoUser);
      const mockResponse: ApiSuccessResponse<LoginResponseData> = {
        success: true,
        data: {
          access_token: mockToken,
          token_type: "bearer",
          expires_in_seconds: 3600,
          user: demoUser,
        },
        message: `Welcome, ${demoUser.full_name}. Login successful.`,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `req-demo-${Date.now()}`,
        },
      };
      return mockResponse;
    }
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<ApiSuccessResponse<UserSummary>> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No active session credentials found.");
  }
  try {
    const res = await apiClient<UserSummary>("/api/v1/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data) {
      setStoredUser(res.data);
    }
    return res;
  } catch (err) {
    const stored = getStoredUser();
    if (stored && token.startsWith("demo_token_")) {
      return {
        success: true,
        data: stored,
        message: "Cached demo profile retrieved.",
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `req-cached-${Date.now()}`,
        },
      };
    }
    removeStoredToken();
    removeStoredUser();
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await apiClient<null>("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Ignore backend logout errors to ensure clean client wipe
  } finally {
    removeStoredToken();
    removeStoredUser();
  }
}

