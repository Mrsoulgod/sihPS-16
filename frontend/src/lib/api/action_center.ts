import { apiClient } from "./client";
import {
  ActionCenterSummaryResponse,
  ActionItemResponse,
  ActionWorkspaceResponse,
  ActionExecuteRequest,
  ActionAssignRequest,
  ActionForwardRequest,
  ActionReworkRequest,
} from "@/lib/types/action_center";

export async function getActionCenterSummary(): Promise<ActionCenterSummaryResponse> {
  const res = await apiClient.get<ActionCenterSummaryResponse>("/action-centre/summary");
  return res.data;
}

export async function listActions(params?: {
  section?: string;
  status?: string;
  priority?: string;
  project_id?: string;
}): Promise<ActionItemResponse[]> {
  const res = await apiClient.get<ActionItemResponse[]>("/action-centre/actions", { params });
  return res.data;
}

export async function getActionWorkspace(actionId: string): Promise<ActionWorkspaceResponse> {
  const res = await apiClient.get<ActionWorkspaceResponse>(`/action-centre/actions/${actionId}`);
  return res.data;
}

export async function executeAction(
  actionId: string,
  data: ActionExecuteRequest
): Promise<ActionItemResponse> {
  const res = await apiClient.post<ActionItemResponse>(`/action-centre/actions/${actionId}/execute`, data);
  return res.data;
}

export async function assignAction(data: ActionAssignRequest): Promise<ActionItemResponse> {
  const res = await apiClient.post<ActionItemResponse>("/action-centre/assign", data);
  return res.data;
}

export async function forwardAction(
  actionId: string,
  data: ActionForwardRequest
): Promise<ActionItemResponse> {
  const res = await apiClient.post<ActionItemResponse>(`/action-centre/actions/${actionId}/forward`, data);
  return res.data;
}

export async function reworkAction(
  actionId: string,
  data: ActionReworkRequest
): Promise<ActionItemResponse> {
  const res = await apiClient.post<ActionItemResponse>(`/action-centre/actions/${actionId}/rework`, data);
  return res.data;
}
