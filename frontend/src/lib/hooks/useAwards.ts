"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  AwardListItem,
  AwardDetail,
  AwardFilterParams,
} from "@/lib/types/award";

export interface PaginatedAwardsResponse {
  items: AwardListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export function useAwards(params?: AwardFilterParams) {
  return useQuery<PaginatedAwardsResponse>({
    queryKey: ["awards", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.status) q.set("status", params.status);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<AwardListItem[]>(
        `/awards${q.toString() ? `?${q.toString()}` : ""}`
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

export function useAwardDetail(awardId: string) {
  return useQuery<AwardDetail>({
    queryKey: ["award-detail", awardId],
    queryFn: async () => {
      const res = await apiClient.get<AwardDetail>(`/awards/${awardId}`);
      return res.data;
    },
    enabled: !!awardId,
    staleTime: 30000,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { project_id: string; parcel_ids: string[]; remarks?: string }>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/awards", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["compensation"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useUpdateAwardStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { awardId: string; status: string; remarks?: string }>({
    mutationFn: async ({ awardId, status, remarks }) => {
      const res = await apiClient.patch(`/awards/${awardId}/status`, { status, remarks });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["award-detail", variables.awardId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useSignAward() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { awardId: string; remarks?: string }>({
    mutationFn: async ({ awardId, remarks }) => {
      const res = await apiClient.post(`/awards/${awardId}/sign`, { remarks });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["award-detail", variables.awardId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}
