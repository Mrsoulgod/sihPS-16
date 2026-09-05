"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  CompensationAssessmentListItem,
  CompensationAssessmentDetail,
  CompensationFilterParams,
  CompensationCalculationBreakdown,
} from "@/lib/types/compensation";

export interface PaginatedCompensationResponse {
  items: CompensationAssessmentListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export function useCompensationAssessments(params?: CompensationFilterParams) {
  return useQuery<PaginatedCompensationResponse>({
    queryKey: ["compensation", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.status) q.set("status", params.status);
      if (params?.state_id) q.set("state_id", params.state_id);
      if (params?.district_id) q.set("district_id", params.district_id);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<CompensationAssessmentListItem[]>(
        `/compensation${q.toString() ? `?${q.toString()}` : ""}`
      );
      return {
        items: res.data || [],
        pagination: (res.metadata as any)?.pagination || {
          page: 1,
          page_size: 20,
          total_records: res.data?.length || 0,
          total_pages: 1,
        },
      };
    },
    staleTime: 30000,
  });
}

export function useCompensationAssessmentDetail(assessmentId: string) {
  return useQuery<CompensationAssessmentDetail>({
    queryKey: ["compensation-detail", assessmentId],
    queryFn: async () => {
      const res = await apiClient.get<CompensationAssessmentDetail>(`/compensation/${assessmentId}`);
      return res.data;
    },
    enabled: !!assessmentId,
    staleTime: 30000,
  });
}

export function useCalculateCompensation() {
  return useMutation<CompensationCalculationBreakdown, Error, any>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<CompensationCalculationBreakdown>("/compensation/calculate", payload);
      return res.data;
    },
  });
}

export function useApproveCompensation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { assessmentId: string; decision: string; remarks?: string }>({
    mutationFn: async ({ assessmentId, decision, remarks }) => {
      const res = await apiClient.post(`/compensation/${assessmentId}/approve`, { decision, remarks });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compensation"] });
      queryClient.invalidateQueries({ queryKey: ["compensation-detail", variables.assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}
