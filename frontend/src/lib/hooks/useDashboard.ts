"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../api/dashboard";
import { useAuth } from "./useAuth";

export function useDashboard(stateId?: string, districtId?: string) {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [
      "dashboard-summary",
      user?.id,
      user?.role_id,
      user?.state_id,
      user?.district_id,
      stateId,
      districtId,
    ],
    queryFn: async () => {
      const res = await fetchDashboardSummary(stateId, districtId);
      return res.data;
    },
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
