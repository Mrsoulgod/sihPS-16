"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  DisbursementListItem,
  DisbursementDetail,
  FinancialReconciliationSummary,
  DisbursementFilterParams,
} from "@/lib/types/disbursement";

export interface PaginatedDisbursementsResponse {
  items: DisbursementListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export function useDisbursements(params?: DisbursementFilterParams) {
  return useQuery<PaginatedDisbursementsResponse>({
    queryKey: ["disbursements", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.award_id) q.set("award_id", params.award_id);
      if (params?.payment_status) q.set("payment_status", params.payment_status);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<DisbursementListItem[]>(
        `/disbursements${q.toString() ? `?${q.toString()}` : ""}`
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

export function useDisbursementDetail(disbursementId: string) {
  return useQuery<DisbursementDetail>({
    queryKey: ["disbursement-detail", disbursementId],
    queryFn: async () => {
      const res = await apiClient.get<DisbursementDetail>(`/disbursements/${disbursementId}`);
      return res.data;
    },
    enabled: !!disbursementId,
    staleTime: 30000,
  });
}

export function useFinancialReconciliation(projectOrAwardId: string) {
  return useQuery<FinancialReconciliationSummary>({
    queryKey: ["reconciliation", projectOrAwardId],
    queryFn: async () => {
      const res = await apiClient.get<FinancialReconciliationSummary>(`/disbursements/summary/${projectOrAwardId}`);
      return res.data;
    },
    enabled: !!projectOrAwardId,
    staleTime: 30000,
  });
}

export function useInitiateBatch() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { award_id: string; parcel_ids?: string[]; remarks?: string }>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/disbursements/initiate-batch", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["award-detail"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useProcessDisbursement() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { disbursementId: string; target_status: string; bank_utr_number?: string; failure_reason?: string }>({
    mutationFn: async ({ disbursementId, ...payload }) => {
      const res = await apiClient.post(`/disbursements/${disbursementId}/process`, payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      queryClient.invalidateQueries({ queryKey: ["disbursement-detail", variables.disbursementId] });
      queryClient.invalidateQueries({ queryKey: ["reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}
