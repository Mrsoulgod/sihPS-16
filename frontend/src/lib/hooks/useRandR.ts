"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  RAndRSchemeListItem,
  RAndRSchemeDetail,
  RAndRSchemeFilterParams,
  AffectedFamilyListItem,
  AffectedFamilyDetail,
  AffectedFamilyFilterParams,
  EligibilityAssessmentPayload,
  RAndRAllotmentPayload,
  RAndRAllotmentItem,
} from "@/lib/types/randr";

export interface PaginatedRAndRSchemeResponse {
  items: RAndRSchemeListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export interface PaginatedAffectedFamilyResponse {
  items: AffectedFamilyListItem[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export function useRandRSchemes(params?: RAndRSchemeFilterParams) {
  return useQuery<PaginatedRAndRSchemeResponse>({
    queryKey: ["randr-schemes", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.status) q.set("status", params.status);
      if (params?.scheme_type) q.set("scheme_type", params.scheme_type);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<RAndRSchemeListItem[]>(
        `/r-and-r${q.toString() ? `?${q.toString()}` : ""}`
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

export function useRandRSchemeDetail(schemeId: string) {
  return useQuery<RAndRSchemeDetail>({
    queryKey: ["randr-scheme-detail", schemeId],
    queryFn: async () => {
      const res = await apiClient.get<RAndRSchemeDetail>(`/r-and-r/${schemeId}`);
      return res.data;
    },
    enabled: !!schemeId,
    staleTime: 30000,
  });
}

export function useAffectedFamilies(params?: AffectedFamilyFilterParams) {
  return useQuery<PaginatedAffectedFamilyResponse>({
    queryKey: ["affected-families", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.scheme_id) q.set("scheme_id", params.scheme_id);
      if (params?.district_id) q.set("district_id", params.district_id);
      if (params?.eligibility_status) q.set("eligibility_status", params.eligibility_status);
      if (params?.rehabilitation_status) q.set("rehabilitation_status", params.rehabilitation_status);
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<AffectedFamilyListItem[]>(
        `/affected-families${q.toString() ? `?${q.toString()}` : ""}`
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

export function useAffectedFamilyDetail(familyId: string) {
  return useQuery<AffectedFamilyDetail>({
    queryKey: ["affected-family-detail", familyId],
    queryFn: async () => {
      const res = await apiClient.get<AffectedFamilyDetail>(`/affected-families/${familyId}`);
      return res.data;
    },
    enabled: !!familyId,
    staleTime: 30000,
  });
}

export function useUpdateEligibility() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { familyId: string; payload: EligibilityAssessmentPayload }>({
    mutationFn: async ({ familyId, payload }) => {
      const res = await apiClient.patch(`/affected-families/${familyId}/eligibility`, payload);
      return res.data;
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: ["affected-family-detail", familyId] });
      queryClient.invalidateQueries({ queryKey: ["affected-families"] });
      queryClient.invalidateQueries({ queryKey: ["randr-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["randr-scheme-detail"] });
    },
  });
}

export function useCreateAllotment() {
  const queryClient = useQueryClient();
  return useMutation<RAndRAllotmentItem, Error, { familyId: string; payload: RAndRAllotmentPayload }>({
    mutationFn: async ({ familyId, payload }) => {
      const res = await apiClient.post<RAndRAllotmentItem>(`/affected-families/${familyId}/allotments`, payload);
      return res.data;
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: ["affected-family-detail", familyId] });
      queryClient.invalidateQueries({ queryKey: ["affected-families"] });
      queryClient.invalidateQueries({ queryKey: ["randr-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["randr-scheme-detail"] });
    },
  });
}

export function useUpdateRehabilitationStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { familyId: string; status: string; remarks?: string }>({
    mutationFn: async ({ familyId, status, remarks }) => {
      const res = await apiClient.patch(`/affected-families/${familyId}/status`, {
        rehabilitation_status: status,
        remarks,
      });
      return res.data;
    },
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: ["affected-family-detail", familyId] });
      queryClient.invalidateQueries({ queryKey: ["affected-families"] });
    },
  });
}
