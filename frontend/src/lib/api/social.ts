/**
 * Phase 11G: Social Officer API Client
 */

import { apiClient } from "@/lib/api/client";
import {
  SocialDashboardSummary,
  SocialRAndRActionItem,
  AffectedFamilyCaseItem,
  FamilyCaseDetailResponse,
  FamilySurveyPayload,
  EligibilityReviewPayload,
  EntitlementAssessmentPayload,
  AllotmentActionPayload,
  VerificationActionPayload,
  ProjectRAndRSummaryItem,
} from "@/lib/types/social";

export async function fetchSocialDashboard(): Promise<SocialDashboardSummary> {
  const response = await apiClient.get<SocialDashboardSummary>("/social/dashboard");
  return response.data;
}

export async function fetchMyActions(): Promise<SocialRAndRActionItem[]> {
  const response = await apiClient.get<SocialRAndRActionItem[]>("/social/actions");
  return response.data;
}

export async function fetchScopedFamilies(params?: {
  project_id?: string;
  scheme_id?: string;
  eligibility_status?: string;
  case_status?: string;
  search?: string;
}): Promise<AffectedFamilyCaseItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.project_id) queryParams.append("project_id", params.project_id);
  if (params?.scheme_id) queryParams.append("scheme_id", params.scheme_id);
  if (params?.eligibility_status) queryParams.append("eligibility_status", params.eligibility_status);
  if (params?.case_status) queryParams.append("case_status", params.case_status);
  if (params?.search) queryParams.append("search", params.search);

  const url = `/social/families${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await apiClient.get<AffectedFamilyCaseItem[]>(url);
  return response.data;
}

export async function fetchFamilyDetail(familyId: string): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.get<FamilyCaseDetailResponse>(`/social/families/${familyId}`);
  return response.data;
}

export async function submitFamilySurvey(
  familyId: string,
  payload: FamilySurveyPayload
): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.post<FamilyCaseDetailResponse>(`/social/families/${familyId}/survey`, payload);
  return response.data;
}

export async function reviewEligibility(
  familyId: string,
  payload: EligibilityReviewPayload
): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.patch<FamilyCaseDetailResponse>(`/social/families/${familyId}/eligibility`, payload);
  return response.data;
}

export async function assessEntitlements(
  familyId: string,
  payload: EntitlementAssessmentPayload
): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.post<FamilyCaseDetailResponse>(`/social/families/${familyId}/entitlements`, payload);
  return response.data;
}

export async function issueAllotment(
  familyId: string,
  payload: AllotmentActionPayload
): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.post<FamilyCaseDetailResponse>(`/social/families/${familyId}/allotments`, payload);
  return response.data;
}

export async function verifyAndCompleteCase(
  familyId: string,
  payload: VerificationActionPayload
): Promise<FamilyCaseDetailResponse> {
  const response = await apiClient.post<FamilyCaseDetailResponse>(`/social/families/${familyId}/verify`, payload);
  return response.data;
}

export async function fetchSocialProjects(): Promise<ProjectRAndRSummaryItem[]> {
  const response = await apiClient.get<ProjectRAndRSummaryItem[]>("/social/projects");
  return response.data;
}
