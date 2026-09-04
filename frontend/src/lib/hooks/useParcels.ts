"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  ParcelListResponse,
  ParcelDetailResponse,
  FieldVerificationCreateRequest,
  FieldVerificationItem,
  GisGeoJsonFeatureCollection,
} from "@/lib/types/parcel";

export interface ParcelQueryParams {
  project_id?: string;
  village_id?: string;
  status?: string;
  is_disputed?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export function useParcels(params?: ParcelQueryParams) {
  return useQuery<ParcelListResponse>({
    queryKey: ["parcels", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.project_id) q.set("project_id", params.project_id);
      if (params?.village_id) q.set("village_id", params.village_id);
      if (params?.status) q.set("status", params.status);
      if (params?.is_disputed !== undefined) q.set("is_disputed", String(params.is_disputed));
      if (params?.search) q.set("search", params.search);
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));

      const res = await apiClient.get<ParcelListResponse>(
        `/parcels${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useParcelDetail(parcelId: string) {
  return useQuery<ParcelDetailResponse>({
    queryKey: ["parcel", parcelId],
    queryFn: async () => {
      const res = await apiClient.get<ParcelDetailResponse>(`/parcels/${parcelId}`);
      return res.data;
    },
    enabled: !!parcelId,
    staleTime: 30000,
  });
}

export function useProjectParcelsGis(projectId?: string) {
  return useQuery<GisGeoJsonFeatureCollection>({
    queryKey: ["gis", "project", projectId],
    queryFn: async () => {
      const res = await apiClient.get<GisGeoJsonFeatureCollection>(
        `/gis/projects/${projectId}/parcels`
      );
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 60000,
  });
}

export function useFieldVerification(parcelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FieldVerificationCreateRequest) => {
      const res = await apiClient.post<FieldVerificationItem>(
        `/parcels/${parcelId}/verify`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcel", parcelId] });
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["gis"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
