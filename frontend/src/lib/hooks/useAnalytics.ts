"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  NationalAnalyticsOverviewResponse,
  StateAnalyticsItem,
  DistrictAnalyticsItem,
  TimeSeriesResponse,
  BottleneckItem,
  DataQualityResponse,
  RiskOverviewResponse,
  ProjectRiskDetail,
  ReportTypeInfo,
  ReportPreviewResponse,
  ReportFilterRequest,
} from "@/lib/types/analytics";

export function useNationalAnalytics(params?: { state_id?: string; district_id?: string }) {
  return useQuery<NationalAnalyticsOverviewResponse>({
    queryKey: ["analytics-overview", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);
      if (params?.district_id) q.set("district_id", params.district_id);

      const res = await apiClient.get<NationalAnalyticsOverviewResponse>(
        `/analytics/overview${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data;
    },
  });
}

export function useStateAnalytics(params?: { state_id?: string }) {
  return useQuery<StateAnalyticsItem[]>({
    queryKey: ["analytics-states", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);

      const res = await apiClient.get<StateAnalyticsItem[]>(
        `/analytics/states${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data || [];
    },
  });
}

export function useDistrictAnalytics(params?: { state_id?: string; district_id?: string }) {
  return useQuery<DistrictAnalyticsItem[]>({
    queryKey: ["analytics-districts", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);
      if (params?.district_id) q.set("district_id", params.district_id);

      const res = await apiClient.get<DistrictAnalyticsItem[]>(
        `/analytics/districts${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data || [];
    },
  });
}

export function useTimeSeriesAnalytics(params?: { state_id?: string }) {
  return useQuery<TimeSeriesResponse>({
    queryKey: ["analytics-time-series", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);

      const res = await apiClient.get<TimeSeriesResponse>(
        `/analytics/time-series${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data;
    },
  });
}

export function useBottlenecks(params?: { state_id?: string }) {
  return useQuery<BottleneckItem[]>({
    queryKey: ["analytics-bottlenecks", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);

      const res = await apiClient.get<BottleneckItem[]>(
        `/analytics/bottlenecks${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data || [];
    },
  });
}

export function useDataQuality() {
  return useQuery<DataQualityResponse>({
    queryKey: ["analytics-data-quality"],
    queryFn: async () => {
      const res = await apiClient.get<DataQualityResponse>("/analytics/data-quality");
      return res.data;
    },
  });
}

export function useRiskOverview(params?: { state_id?: string; district_id?: string }) {
  return useQuery<RiskOverviewResponse>({
    queryKey: ["risk-overview", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params?.state_id) q.set("state_id", params.state_id);
      if (params?.district_id) q.set("district_id", params.district_id);

      const res = await apiClient.get<RiskOverviewResponse>(
        `/risk/overview${q.toString() ? `?${q.toString()}` : ""}`
      );
      return res.data;
    },
  });
}

export function useProjectRisk(projectId: string) {
  return useQuery<ProjectRiskDetail>({
    queryKey: ["project-risk", projectId],
    queryFn: async () => {
      const res = await apiClient.get<ProjectRiskDetail>(`/risk/projects/${projectId}`);
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useReportTypes() {
  return useQuery<ReportTypeInfo[]>({
    queryKey: ["report-types"],
    queryFn: async () => {
      const res = await apiClient.get<ReportTypeInfo[]>("/reports/types");
      return res.data || [];
    },
  });
}

export function useReportPreview(payload: ReportFilterRequest | null) {
  return useQuery<ReportPreviewResponse>({
    queryKey: ["report-preview", payload],
    queryFn: async () => {
      if (!payload) throw new Error("No report payload provided");
      const res = await apiClient.post<ReportPreviewResponse>("/reports/preview", payload);
      return res.data;
    },
    enabled: Boolean(payload?.report_type),
  });
}
