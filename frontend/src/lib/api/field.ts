import { apiClient } from "./client";
import {
  FieldAssignedParcel,
  FieldTask,
  FieldVerificationDetail,
  FieldVerificationPayload,
  FieldDashboardData,
} from "@/lib/types/field";

export async function fetchFieldDashboard(): Promise<FieldDashboardData> {
  const res = await apiClient<FieldDashboardData>("/api/v1/field/dashboard");
  return res.data;
}

export async function fetchFieldTasks(params?: {
  status?: string;
  priority?: string;
  project_id?: string;
}): Promise<FieldTask[]> {
  const q = new URLSearchParams();
  if (params?.status && params.status !== "ALL") q.append("status", params.status);
  if (params?.priority && params.priority !== "ALL") q.append("priority", params.priority);
  if (params?.project_id) q.append("project_id", params.project_id);

  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiClient<FieldTask[]>(`/api/v1/field/tasks${qs}`);
  return res.data || [];
}

export async function fetchFieldTaskDetail(taskId: string): Promise<FieldVerificationDetail> {
  const res = await apiClient<FieldVerificationDetail>(`/api/v1/field/tasks/${taskId}`);
  return res.data;
}

export async function startFieldTask(taskId: string): Promise<FieldTask> {
  const res = await apiClient<FieldTask>(`/api/v1/field/tasks/${taskId}/start`, {
    method: "POST",
  });
  return res.data;
}

export async function submitFieldVerification(
  taskId: string,
  payload: FieldVerificationPayload
): Promise<FieldVerificationDetail> {
  const res = await apiClient<FieldVerificationDetail>(`/api/v1/field/tasks/${taskId}/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function resubmitFieldRework(
  taskId: string,
  payload: FieldVerificationPayload
): Promise<FieldVerificationDetail> {
  const res = await apiClient<FieldVerificationDetail>(`/api/v1/field/tasks/${taskId}/resubmit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function fetchAssignedParcels(): Promise<FieldAssignedParcel[]> {
  const res = await apiClient<FieldAssignedParcel[]>("/api/v1/field/parcels");
  return res.data || [];
}

export async function fetchAssignedParcelDetail(parcelId: string): Promise<FieldAssignedParcel> {
  const res = await apiClient<FieldAssignedParcel>(`/api/v1/field/parcels/${parcelId}`);
  return res.data;
}
