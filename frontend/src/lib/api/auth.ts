import { apiClient } from "./client";
import { LoginCredentials, LoginResponseData, UserSummary, SwitchRolePayload } from "../types/auth";
import { ApiSuccessResponse } from "../types/api";

const TOKEN_KEY = "nlams_access_token";

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

export async function loginUser(credentials: LoginCredentials): Promise<ApiSuccessResponse<LoginResponseData>> {
  const res = await apiClient<LoginResponseData>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (res.data?.access_token) {
    setStoredToken(res.data.access_token);
  }
  return res;
}

export async function fetchCurrentUser(): Promise<ApiSuccessResponse<UserSummary>> {
  const token = getStoredToken();
  return apiClient<UserSummary>("/api/v1/auth/me", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function switchUserRole(targetRole: string): Promise<ApiSuccessResponse<LoginResponseData>> {
  const token = getStoredToken();
  const payload: SwitchRolePayload = { target_role: targetRole };
  const res = await apiClient<LoginResponseData>("/api/v1/auth/switch-role", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
  if (res.data?.access_token) {
    setStoredToken(res.data.access_token);
  }
  return res;
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
  } finally {
    removeStoredToken();
  }
}
