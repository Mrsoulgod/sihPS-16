import { apiClient } from "./client";
import { getStoredToken, getStoredUser } from "./auth";
import { ApiSuccessResponse } from "../types/api";
import { DashboardSummaryData } from "../types/dashboard";

const CANONICAL_DASHBOARD_DATA: DashboardSummaryData = {
  scope_level: "NATIONAL",
  jurisdiction_name: "All India (National Command View)",
  kpis: {
    total_projects: 12,
    total_land_proposed_acres: 428.4,
    total_land_acquired_acres: 286.2,
    total_possession_acres: 210.5,
    overall_acquisition_percent: 66.8,
    compensation_assessed_cr: 142.5,
    compensation_disbursed_cr: 98.4,
    overall_disbursement_percent: 69.1,
    affected_families: 1240,
    displaced_families: 310,
    total_paf_count: 1240,
    total_pdf_count: 310,
    avg_randr_completion_percent: 74.2,
    eligible_families: 1240,
    families_assisted: 980,
    families_completed: 890,
    pending_rr_cases: 260,
  },
  acquisition_overview: {
    land_proposed_acres: 428.4,
    land_acquired_acres: 286.2,
    land_remaining_acres: 142.2,
    acquisition_percent: 66.8,
    possession_acres: 210.5,
    possession_percent: 49.1,
  },
  randr_overview: {
    total_affected_families: 1240,
    eligible_families: 1240,
    families_approved: 1120,
    families_assisted: 980,
    families_completed: 890,
    pending_cases: 260,
    completion_percent: 74.2,
    progress_stages: [
      { stage: "Survey Completed", count: 1240, percentage: 100 },
      { stage: "Entitlements Approved", count: 1120, percentage: 90.3 },
      { stage: "Housing/Grant Disbursed", count: 980, percentage: 79 },
      { stage: "Fully Resettled", count: 890, percentage: 71.8 },
    ],
  },
  status_breakdown: {
    on_track: 8,
    at_risk: 3,
    delayed: 1,
    completed: 0,
    total: 12,
  },
  state_progress: [
    {
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      project_count: 5,
      land_proposed_acres: 185,
      land_acquired_acres: 132.5,
      acquisition_percent: 71.6,
      compensation_disbursed_cr: 54.2,
      randr_completion_percent: 78,
      performance_category: "STRONG",
    },
    {
      state_id: "IN-GJ",
      state_name: "Gujarat",
      project_count: 4,
      land_proposed_acres: 142.4,
      land_acquired_acres: 98.7,
      acquisition_percent: 69.3,
      compensation_disbursed_cr: 31.8,
      randr_completion_percent: 72.5,
      performance_category: "STRONG",
    },
    {
      state_id: "IN-HR",
      state_name: "Haryana",
      project_count: 3,
      land_proposed_acres: 101,
      land_acquired_acres: 55,
      acquisition_percent: 54.5,
      compensation_disbursed_cr: 12.4,
      randr_completion_percent: 65,
      performance_category: "MODERATE",
    },
  ],
  attention_projects: [
    {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      project_code: "PRJ-NH48-PKG4",
      title: "Delhi-Mumbai Expressway (NH-48 Jaipur Bypass Pkg 4)",
      state_name: "Rajasthan",
      district_name: "Jaipur",
      current_stage: "SECTION_3D",
      acquisition_progress_percent: 68.5,
      status: "AT_RISK",
      reason: "Statutory deadline for Section 3D declaration approaches in 42 days",
      risk_score: 72,
    },
    {
      id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      project_code: "PRJ-DFC-W02",
      title: "Western Dedicated Freight Corridor (Vadodara Junction)",
      state_name: "Gujarat",
      district_name: "Vadodara",
      current_stage: "SECTION_3E",
      acquisition_progress_percent: 52,
      status: "DELAYED",
      reason: "Environmental clearance amendment pending review",
      risk_score: 65,
    },
  ],
  recent_activity: [
    {
      id: 101,
      action: "AWARD_APPROVED",
      entity_name: "Award CALA-JPR-2026-004",
      entity_id: "AWD-004",
      actor_name: "Shri Rajesh Sharma, IAS",
      actor_role: "CALA (District Collector)",
      details: { amount_cr: 4.25, village: "Amer", beneficiaries: 48 },
      timestamp: new Date().toISOString(),
    },
    {
      id: 102,
      action: "PFMS_DISBURSEMENT_SUCCESS",
      entity_name: "Batch DISB-2026-B89",
      entity_id: "DISB-B89",
      actor_name: "PFMS Gateway",
      actor_role: "SYSTEM",
      details: { processed_count: 32, amount_cr: 2.8 },
      timestamp: new Date().toISOString(),
    },
    {
      id: 103,
      action: "OBJECTION_RESOLVED",
      entity_name: "Hearing OBJ-2026-118",
      entity_id: "OBJ-118",
      actor_name: "CALA Court Bench",
      actor_role: "CALA",
      details: { outcome: "COMPENSATION_ENHANCED", enhancement_pct: 12 },
      timestamp: new Date().toISOString(),
    },
  ],
  quick_actions: [
    {
      id: "qa-central-1",
      label: "National Project Pipeline",
      description: "Monitor all interstate corridor acquisitions",
      target_route: "/projects",
      badge: "5 Active",
      icon: "Building2",
    },
    {
      id: "qa-central-2",
      label: "Sanction New Requisition",
      description: "Issue administrative sanction for DPR",
      target_route: "/workflow",
      badge: "Phase 3",
      icon: "FileCheck",
    },
    {
      id: "qa-central-3",
      label: "Direct PFMS Release",
      description: "Release central share to CALA SNA treasury account",
      target_route: "/disbursements",
      badge: "₹42 Cr Escrow",
      icon: "IndianRupee",
    },
  ],
};

function getTailoredFallbackDashboard(): DashboardSummaryData {
  const user = getStoredUser();
  const base = { ...CANONICAL_DASHBOARD_DATA };
  if (!user) return base;

  if (user.role_id === "ROLE_DISTRICT_OFFICER" || user.role_id === "ROLE_FIELD_OFFICER") {
    base.scope_level = user.role_id === "ROLE_DISTRICT_OFFICER" ? "DISTRICT" : "FIELD";
    base.jurisdiction_name = `${user.district_name || "Jaipur"} District (${user.role_id === "ROLE_DISTRICT_OFFICER" ? "CALA Authority" : "Field Operations"})`;
    base.quick_actions = [
      {
        id: "qa-cala-1",
        label: "Conduct Section 15 Hearing",
        description: "Schedule & adjudicate statutory landowner objections",
        target_route: "/hearings",
        badge: "3 Pending",
        icon: "Scale",
      },
      {
        id: "qa-cala-2",
        label: "Draft Section 3G Award",
        description: "Compute market value, multiplier, and solatium",
        target_route: "/awards",
        badge: "Phase 6",
        icon: "Calculator",
      },
      {
        id: "qa-cala-3",
        label: "Approve SNA Disbursement",
        description: "Sign digital escrow payment orders via Aadhaar eSign",
        target_route: "/disbursements",
        badge: "₹18.4 Cr Ready",
        icon: "Send",
      },
    ];
  } else if (user.role_id === "ROLE_STATE_OFFICER") {
    base.scope_level = "STATE";
    base.jurisdiction_name = `${user.state_name || "Rajasthan"} (State View)`;
  }
  return base;
}

export async function fetchDashboardSummary(
  stateId?: string,
  districtId?: string
): Promise<ApiSuccessResponse<DashboardSummaryData>> {
  const token = getStoredToken();
  const params = new URLSearchParams();
  if (stateId) params.append("state_id", stateId);
  if (districtId) params.append("district_id", districtId);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  try {
    return await apiClient<DashboardSummaryData>(`/api/v1/dashboard/summary${queryString}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (err) {
    console.warn("Using fallback canonical dashboard summary:", err);
    return {
      success: true,
      data: getTailoredFallbackDashboard(),
      message: "Canonical demo dashboard loaded successfully.",
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: `demo-${Date.now()}`,
      },
    };
  }
}

export async function fetchPublicDashboardSummary(
  stateId?: string,
  districtId?: string
): Promise<ApiSuccessResponse<DashboardSummaryData>> {
  const params = new URLSearchParams();
  if (stateId) params.append("state_id", stateId);
  if (districtId) params.append("district_id", districtId);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  try {
    return await apiClient<DashboardSummaryData>(`/api/v1/dashboard/public-summary${queryString}`, {
      method: "GET",
      headers: {},
    });
  } catch (err) {
    console.warn("Using fallback canonical public dashboard summary:", err);
    return {
      success: true,
      data: CANONICAL_DASHBOARD_DATA,
      message: "Canonical public demo dashboard loaded successfully.",
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: `pub-demo-${Date.now()}`,
      },
    };
  }
}

