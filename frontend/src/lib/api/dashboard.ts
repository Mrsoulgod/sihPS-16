import { apiClient } from "./client";
import { getStoredToken } from "./auth";
import { ApiSuccessResponse } from "../types/api";
import { DashboardSummaryData } from "../types/dashboard";

export async function fetchDashboardSummary(
  stateId?: string,
  districtId?: string
): Promise<ApiSuccessResponse<DashboardSummaryData>> {
  const token = getStoredToken();
  const params = new URLSearchParams();
  if (stateId) params.append("state_id", stateId);
  if (districtId) params.append("district_id", districtId);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiClient<DashboardSummaryData>(`/api/v1/dashboard/summary${queryString}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
