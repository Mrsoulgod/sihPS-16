"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  PossessionListItem,
  PossessionDetail,
  PossessionFilterParams,
} from "@/lib/types/possession";

export interface PaginatedPossessionResponse {
  items: PossessionListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export function usePossessions(params?: PossessionFilterParams) {
  return useQuery<PaginatedPossessionResponse>({
    queryKey: ["possessions", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.status) q.set("status", params.status);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<PossessionListItem[]>(
        `/possession${q.toString() ? `?${q.toString()}` : ""}`
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

export function usePossessionDetail(possessionId: string) {
  return useQuery<PossessionDetail>({
    queryKey: ["possession-detail", possessionId],
    queryFn: async () => {
      const res = await apiClient.get<PossessionDetail>(`/possession/${possessionId}`);
      return res.data;
    },
    enabled: !!possessionId,
    staleTime: 30000,
  });
}

export function useCreatePossession() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, {
    project_id: string;
    parcel_id: string;
    award_id?: string;
    possession_date: string;
    possession_type?: string;
    is_encumbrance_free?: boolean;
    urgency_justification?: string;
    remarks?: string;
  }>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/possession", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useUpdatePossessionStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { possessionId: string; status: string; remarks?: string }>({
    mutationFn: async ({ possessionId, status, remarks }) => {
      const res = await apiClient.patch(`/possession/${possessionId}/status`, { status, remarks });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["possessions"] });
      queryClient.invalidateQueries({ queryKey: ["possession-detail", variables.possessionId] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}
