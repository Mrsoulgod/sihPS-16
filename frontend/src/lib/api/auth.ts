import { apiClient } from "./client";
import { LoginCredentials, LoginResponseData, UserSummary, SwitchRolePayload } from "../types/auth";
import { ApiSuccessResponse } from "../types/api";

const TOKEN_KEY = "nlams_access_token";
const USER_KEY = "nlams_user_profile";

export const FRONTEND_DEMO_USERS: Record<string, UserSummary> = {
  central_admin: {
    id: "00000000-0000-0000-0000-000000000001",
    username: "central_admin",
    email: "central@gov.demo",
    full_name: "Shri Rajesh Kumar",
    designation: "Joint Secretary (Land Acquisition)",
    organization: "Ministry of Road Transport & Highways",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    is_active: true,
  },
  central_officer: {
    id: "00000000-0000-0000-0000-000000000001",
    username: "central_officer",
    email: "central@gov.demo",
    full_name: "Shri Rajesh Kumar",
    designation: "Joint Secretary (Land Acquisition)",
    organization: "Ministry of Road Transport & Highways",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    is_active: true,
  },
  cala_jaipur: {
    id: "00000000-0000-0000-0000-000000000002",
    username: "cala_jaipur",
    email: "district@gov.demo",
    full_name: "Dr. Amit Sharma, IAS",
    designation: "District Collector & CALA",
    organization: "District Land Acquisition Authority, Jaipur",
    role_id: "ROLE_DISTRICT_OFFICER",
    role_name: "District CALA / Collector",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    is_active: true,
  },
  district_officer: {
    id: "00000000-0000-0000-0000-000000000002",
    username: "district_officer",
    email: "district@gov.demo",
    full_name: "Dr. Amit Sharma, IAS",
    designation: "District Collector & CALA",
    organization: "District Land Acquisition Authority, Jaipur",
    role_id: "ROLE_DISTRICT_OFFICER",
    role_name: "District CALA / Collector",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    is_active: true,
  },
  field_officer: {
    id: "00000000-0000-0000-0000-000000000003",
    username: "field_officer",
    email: "field@gov.demo",
    full_name: "Shri Ramesh Choudhary",
    designation: "Senior Revenue Inspector & Field Surveyor",
    organization: "Tehsil Kotputli Revenue Office",
    role_id: "ROLE_FIELD_OFFICER",
    role_name: "Field Officer / Surveyor",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    is_active: true,
  },
  state_officer: {
    id: "00000000-0000-0000-0000-000000000004",
    username: "state_officer",
    email: "state@gov.demo",
    full_name: "Smt. Sunita Verma, IAS",
    designation: "Principal Secretary (Revenue)",
    organization: "Revenue & Colonisation Department, Govt. of Rajasthan",
    role_id: "ROLE_STATE_OFFICER",
    role_name: "State Government Officer",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: null,
    district_name: null,
    is_active: true,
  },
  agency_officer: {
    id: "00000000-0000-0000-0000-000000000005",
    username: "agency_officer",
    email: "agency@gov.demo",
    full_name: "Er. Vikram Singh",
    designation: "Chief General Manager (Technical)",
    organization: "National Highways Authority of India (NHAI)",
    role_id: "ROLE_PROJECT_AGENCY",
    role_name: "Project Implementing Agency",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    is_active: true,
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000006",
    username: "admin",
    email: "admin@gov.demo",
    full_name: "Principal Systems Administrator",
    designation: "Lead System Architect",
    organization: "National Land Acquisition & Management System (NLAMS)",
    role_id: "ROLE_ADMIN",
    role_name: "System Administrator",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
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
    // If backend returned error or is unreachable, check demo users
    const demoUser = findDemoUser(credentials.username_or_email);
    if (demoUser) {
      const mockToken = `demo_token_${demoUser.id}_${Date.now()}`;
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
        message: `Welcome, ${demoUser.full_name}. Demo login successful.`,
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
  try {
    const res = await apiClient<UserSummary>("/api/v1/auth/me", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.data) {
      setStoredUser(res.data);
    }
    return res;
  } catch (err) {
    const stored = getStoredUser();
    if (stored) {
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
    throw err;
  }
}

export async function switchUserRole(targetRole: string): Promise<ApiSuccessResponse<LoginResponseData>> {
  const token = getStoredToken();
  const payload: SwitchRolePayload = { target_role: targetRole };
  try {
    const res = await apiClient<LoginResponseData>("/api/v1/auth/switch-role", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
    if (res.data?.access_token) {
      setStoredToken(res.data.access_token);
    }
    if (res.data?.user) {
      setStoredUser(res.data.user);
    }
    return res;
  } catch (err) {
    const cleanRole = targetRole.trim().toUpperCase().replace(/^ROLE_/, "");
    const targetKey = Object.keys(FRONTEND_DEMO_USERS).find((k) =>
      FRONTEND_DEMO_USERS[k].role_id.replace(/^ROLE_/, "").toUpperCase() === cleanRole
    );
    const demoUser = targetKey ? FRONTEND_DEMO_USERS[targetKey] : FRONTEND_DEMO_USERS.central_admin;
    const mockToken = `demo_token_${demoUser.id}_${Date.now()}`;
    setStoredToken(mockToken);
    setStoredUser(demoUser);
    return {
      success: true,
      data: {
        access_token: mockToken,
        token_type: "bearer",
        expires_in_seconds: 3600,
        user: demoUser,
      },
      message: `Switched role context to ${demoUser.role_name} (${demoUser.full_name}).`,
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: `req-switch-${Date.now()}`,
      },
    };
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
    // Ignore error during logout
  } finally {
    removeStoredToken();
    removeStoredUser();
  }
}
