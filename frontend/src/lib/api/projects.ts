import { apiClient } from "./client";
import { getStoredToken } from "./auth";
import { ApiSuccessResponse } from "../types/api";
import {
  ProjectListItem,
  ProjectDetailResponse,
  ProjectProposalCreate,
  ProjectDraftUpdate,
  ProjectSubmitRequest,
  ProjectResubmitRequest,
  SurveyRequestCreate,
} from "../types/project";

export interface ProjectListParams {
  state_id?: string;
  district_id?: string;
  stage?: string;
  status?: string;
  risk_level?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export async function fetchProjects(
  params?: ProjectListParams
): Promise<ApiSuccessResponse<ProjectListItem[]>> {
  const token = getStoredToken();
  const searchParams = new URLSearchParams();
  if (params) {
    if (params.state_id) searchParams.append("state_id", params.state_id);
    if (params.district_id) searchParams.append("district_id", params.district_id);
    if (params.stage) searchParams.append("stage", params.stage);
    if (params.status) searchParams.append("status", params.status);
    if (params.risk_level) searchParams.append("risk_level", params.risk_level);
    if (params.search) searchParams.append("search", params.search);
    if (params.skip !== undefined) searchParams.append("skip", params.skip.toString());
    if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
  }

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiClient<ProjectListItem[]>(`/api/v1/projects${queryString}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchProjectById(
  id: string
): Promise<ApiSuccessResponse<ProjectDetailResponse>> {
  const token = getStoredToken();
  return apiClient<ProjectDetailResponse>(`/api/v1/projects/${id}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function createProjectProposal(
  payload: ProjectProposalCreate
): Promise<ApiSuccessResponse<ProjectDetailResponse>> {
  const token = getStoredToken();
  return apiClient<ProjectDetailResponse>(`/api/v1/projects`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateProjectDraft(
  id: string,
  payload: ProjectDraftUpdate
): Promise<ApiSuccessResponse<ProjectDetailResponse>> {
  const token = getStoredToken();
  return apiClient<ProjectDetailResponse>(`/api/v1/projects/${id}`, {
    method: "PUT",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function submitProjectProposal(
  id: string,
  payload: ProjectSubmitRequest
): Promise<ApiSuccessResponse<ProjectDetailResponse>> {
  const token = getStoredToken();
  return apiClient<ProjectDetailResponse>(`/api/v1/projects/${id}/submit`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function resubmitProjectProposal(
  id: string,
  payload: ProjectResubmitRequest
): Promise<ApiSuccessResponse<ProjectDetailResponse>> {
  const token = getStoredToken();
  return apiClient<ProjectDetailResponse>(`/api/v1/projects/${id}/resubmit`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createSurveyRequest(
  projectId: string,
  payload: SurveyRequestCreate
): Promise<ApiSuccessResponse<{ message: string; task_id: string }>> {
  const token = getStoredToken();
  return apiClient<{ message: string; task_id: string }>(
    `/api/v1/projects/${projectId}/survey-requests`,
    {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

export async function uploadDocument(
  payload: {
    project_id: string;
    document_type: string;
    title: string;
    description?: string;
    file_name: string;
    file_size_bytes?: number;
    mime_type?: string;
  }
): Promise<ApiSuccessResponse<any>> {
  const token = getStoredToken();
  return apiClient<any>(`/api/v1/documents`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
