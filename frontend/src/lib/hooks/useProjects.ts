"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ProjectListItem, ProjectDetailResponse } from "@/lib/types/project";

export function useProjects(filters?: { state_id?: string; stage?: string; search?: string }) {
  return useQuery<ProjectListItem[]>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.state_id) params.set("state_id", filters.state_id);
      if (filters?.stage) params.set("stage", filters.stage);
      if (filters?.search) params.set("search", filters.search);

      const res = await apiClient.get<ProjectListItem[]>(
        `/projects${params.toString() ? `?${params.toString()}` : ""}`
      );
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useProjectDetail(projectId: string) {
  return useQuery<ProjectDetailResponse>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await apiClient.get<ProjectDetailResponse>(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30000,
  });
}
