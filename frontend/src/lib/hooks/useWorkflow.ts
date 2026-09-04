"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  StageDefinition,
  ProjectWorkflowTimelineResponse,
  StageTransitionRequest,
  WorkflowTaskItem,
} from "@/lib/types/workflow";

export function useStatutoryStages() {
  return useQuery<StageDefinition[]>({
    queryKey: ["workflow", "stages"],
    queryFn: async () => {
      const res = await apiClient.get<StageDefinition[]>("/workflow/stages");
      return res.data;
    },
    staleTime: 300000,
  });
}

export function useWorkflowTimeline(projectId: string) {
  return useQuery<ProjectWorkflowTimelineResponse>({
    queryKey: ["workflow", "timeline", projectId],
    queryFn: async () => {
      const res = await apiClient.get<ProjectWorkflowTimelineResponse>(
        `/workflow/projects/${projectId}/timeline`
      );
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 10000,
  });
}

export const useProjectWorkflow = useWorkflowTimeline;

export function useTransitionStage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StageTransitionRequest) => {
      const res = await apiClient.post<ProjectWorkflowTimelineResponse>(
        `/workflow/projects/${projectId}/transition`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", "timeline", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", "tasks"] });
    },
  });
}

export function useWorkflowTasks(projectId?: string) {
  return useQuery<WorkflowTaskItem[]>({
    queryKey: ["workflow", "tasks", projectId],
    queryFn: async () => {
      const endpoint = projectId ? `/workflow/tasks?project_id=${projectId}` : "/workflow/tasks";
      const res = await apiClient.get<WorkflowTaskItem[]>(endpoint);
      return res.data;
    },
    staleTime: 15000,
  });
}

export function useActionWorkflowTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, action, remarks }: { taskId: string; action: string; remarks?: string }) => {
      const res = await apiClient.post<WorkflowTaskItem>(
        `/workflow/tasks/${taskId}/action`,
        { action, remarks }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
