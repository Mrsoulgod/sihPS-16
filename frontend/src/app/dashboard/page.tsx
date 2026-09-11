"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { RoleCode } from "@/lib/types/auth";
import { NationalKpiGrid } from "@/components/dashboard/NationalKpiGrid";
import { NationalFunnel } from "@/components/dashboard/NationalFunnel";
import { StatePerformanceMatrix } from "@/components/dashboard/StatePerformanceMatrix";
import { CriticalProjectsSpotlight } from "@/components/dashboard/CriticalProjectsSpotlight";
import { CentralAttentionQueue } from "@/components/dashboard/CentralAttentionQueue";
import { NationalTrendsCharts } from "@/components/dashboard/NationalTrendsCharts";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { AcquisitionProgressCard } from "@/components/dashboard/AcquisitionProgressCard";
import { RAndROverviewCard } from "@/components/dashboard/RAndROverviewCard";
import { ProjectStatusSummary } from "@/components/dashboard/ProjectStatusSummary";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { StateAcquisitionControl } from "@/components/dashboard/StateAcquisitionControl";
import { DistrictAcquisitionControl } from "@/components/dashboard/DistrictAcquisitionControl";
import { ProjectAgencyControl } from "@/components/dashboard/ProjectAgencyControl";
import { FieldOfficerDashboard } from "@/components/dashboard/FieldOfficerDashboard";
import { SocialOfficerDashboard } from "@/components/dashboard/SocialOfficerDashboard";
import Link from "next/link";
import {
  RefreshCw,
  AlertCircle,
  Building,
  Compass,
  MapPin,
  Calendar,
  Landmark,
  BarChart3,
  ShieldAlert,
  FileSpreadsheet,
  ArrowRight,
  LayoutDashboard,
  Users2,
  AlertTriangle,
  History,
  Layers,
  FileCheck2,
  CheckCircle2,
  TrendingUp,
  Map,
  Shield,
} from "lucide-react";

type CommandTab =
  | "command-overview"
  | "funnel"
  | "states"
  | "critical-risk"
  | "attention"
  | "trends"
  | "all";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const [activeTab, setActiveTab] = useState<CommandTab>("command-overview");
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);

  const isCentralOrAdmin =
    user?.role_id === RoleCode.CENTRAL_OFFICER ||
    user?.role_id === RoleCode.ADMIN ||
    user?.role_id === RoleCode.SUPER_ADMIN ||
    data?.scope_level === "NATIONAL";

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state or data is not a valid object
  if (isError || !data || Array.isArray(data) || !data.kpis) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-white p-8 rounded-xl border border-rose-200 shadow-sm text-center">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mt-4">
          Unable to Load Command Dashboard Data
        </h3>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          {error instanceof Error ? error.message : "Failed to connect to backend aggregation services."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#138808] text-white font-medium text-xs shadow hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Phase 11D: Automatically dispatch District / CALA Officer to District Acquisition Control Center
  const isDistrictOfficer =
    user?.role_id === RoleCode.DISTRICT_OFFICER ||
    data?.scope_level === "DISTRICT";

  if (isDistrictOfficer) {
    return (
      <DistrictAcquisitionControl
        data={data}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
    );
  }

  // Phase 11C: Automatically dispatch State Officer to State Acquisition Control Center
  const isStateOfficer =
    user?.role_id === RoleCode.STATE_OFFICER ||
    data?.scope_level === "STATE";

  if (isStateOfficer) {
    return (
      <StateAcquisitionControl
        data={data}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
    );
  }

  // Phase 11E: Automatically dispatch Project Agency to Project Agency Control Center
  const isProjectAgency =
    user?.role_id === RoleCode.PROJECT_AGENCY ||
    data.scope_level === "AGENCY";

  if (isProjectAgency) {
    return (
      <ProjectAgencyControl
        data={data}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
    );
  }

  // Phase 11F: Automatically dispatch Field Officer to My Field Work dashboard
  const isFieldOfficer =
    user?.role_id === RoleCode.FIELD_OFFICER ||
    data.scope_level === "FIELD";

  if (isFieldOfficer) {
    return (
      <FieldOfficerDashboard
        data={data}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
    );
  }

  // Phase 11G: Automatically dispatch Social / R&R Officer to R&R Case Management dashboard
  const isSocialOfficer =
    user?.role_id === RoleCode.SOCIAL_OFFICER ||
    data.scope_level === "SOCIAL";

  if (isSocialOfficer) {
    return (
      <SocialOfficerDashboard
        data={data}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
    );
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const commandTabs = [
    { id: "command-overview", label: "National Command", icon: LayoutDashboard, badge: "11 KPIs" },
    { id: "funnel", label: "Acquisition Funnel", icon: Compass, badge: "12 Stages" },
    { id: "states", label: "State Performance", icon: Layers, badge: `${data.state_progress?.length || 0} States` },
    { id: "critical-risk", label: "Critical & Risk", icon: AlertTriangle, badge: `${data.status_breakdown?.at_risk || 2} Risk` },
    { id: "attention", label: "Central Attention", icon: ShieldAlert, badge: `${data.central_attention?.length || 0} Open` },
    { id: "trends", label: "Trends & MIS", icon: TrendingUp, badge: "5 Mo" },
    { id: "all", label: "Full View", icon: Layers, badge: "All" },
  ] as const;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. NATIONAL ACQUISITION COMMAND TOP SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                NATIONAL ACQUISITION COMMAND
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 inline" />
                Jurisdiction: <strong>National (All India Mandate)</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1.5 tracking-tight">
              {user?.full_name ? `Welcome, ${user.full_name}` : "National Acquisition Command Center"}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>Role: <strong className="text-slate-800">{user?.role_name || "Central Officer"}</strong></span>
              <span>•</span>
              <span>Organization: <strong className="text-slate-800">{user?.organization || "Ministry of Road Transport & Highways"}</strong></span>
              <span>•</span>
              <span>Statutory Mandate: <span className="text-emerald-800 font-medium">RFCTLARR Act 2013</span></span>
            </div>
          </div>

          {/* Right Controls: Current Date & Live Sync Indicator */}
          <div className="flex items-center gap-2.5 self-start md:self-auto text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-2xs"
              title="Sync live aggregations from PostgreSQL"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>{isFetching ? "Syncing..." : "Live Data Sync"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Command Hub Quick Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Link
          href="/gis"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">National GIS</p>
            <p className="text-[10px] text-slate-500 truncate">PostGIS Overlays</p>
          </div>
        </Link>

        <Link
          href="/projects"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-500 hover:bg-blue-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Projects 360</p>
            <p className="text-[10px] text-slate-500 truncate">National Pipeline</p>
          </div>
        </Link>

        <Link
          href="/land-parcels"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-teal-500 hover:bg-teal-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Map className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Land Parcels</p>
            <p className="text-[10px] text-slate-500 truncate">Cadastral Registry</p>
          </div>
        </Link>

        <Link
          href="/compensation"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Landmark className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Compensation</p>
            <p className="text-[10px] text-slate-500 truncate">Section 26-30 Solatium</p>
          </div>
        </Link>

        <Link
          href="/analytics/risk"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-rose-500 hover:bg-rose-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Risk Intelligence</p>
            <p className="text-[10px] text-slate-500 truncate">5-Factor Statutory Rules</p>
          </div>
        </Link>

        <Link
          href="/reports"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-purple-500 hover:bg-purple-50/20 transition-all group"
        >
          <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">MIS Reports</p>
            <p className="text-[10px] text-slate-500 truncate">Executive Summary</p>
          </div>
        </Link>
      </div>

      {/* 3. Segmented Command Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {commandTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CommandTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#138808]" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}

      {/* VIEW: 11 National Command KPIs & High-Level Summary */}
      {(activeTab === "command-overview" || activeTab === "all") && (
        <div className="space-y-5">
          {/* 11 National Command KPIs Grid */}
          <NationalKpiGrid kpis={data.kpis} />

          {/* Critical Projects & Central Attention Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CriticalProjectsSpotlight projects={data.critical_projects} />
            <CentralAttentionQueue items={data.central_attention} />
          </div>

          {/* State Performance Summary */}
          <StatePerformanceMatrix
            states={data.state_progress}
            onSelectState={(stateId) => setSelectedStateFilter(stateId)}
          />
        </div>
      )}

      {/* VIEW: 12-Stage National Funnel */}
      {(activeTab === "funnel" || activeTab === "all") && (
        <div className="space-y-5">
          <NationalFunnel stages={data.funnel} />
        </div>
      )}

      {/* VIEW: State Performance Comparative Matrix */}
      {(activeTab === "states" || activeTab === "all") && (
        <div className="space-y-5">
          <StatePerformanceMatrix
            states={data.state_progress}
            onSelectState={(stateId) => setSelectedStateFilter(stateId)}
          />
        </div>
      )}

      {/* VIEW: Critical Projects & Risk Intelligence */}
      {(activeTab === "critical-risk" || activeTab === "all") && (
        <div className="space-y-5">
          <CriticalProjectsSpotlight projects={data.critical_projects} />

          {/* Risk Intelligence Radar Summary Card */}
          {data.risk_summary && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Predictive Risk Intelligence & Statutory Delay Drivers
                  </h3>
                </div>
                <Link
                  href="/analytics/risk"
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>Open 5-Factor Risk Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-rose-700">Critical Risk</span>
                  <p className="text-xl font-bold font-serif text-rose-950 mt-1">{data.risk_summary.critical_count}</p>
                  <span className="text-[10px] text-rose-600">Score $\ge 70$</span>
                </div>
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-700">High Risk</span>
                  <p className="text-xl font-bold font-serif text-amber-950 mt-1">{data.risk_summary.high_count}</p>
                  <span className="text-[10px] text-amber-600">Score 50-69</span>
                </div>
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-700">Moderate Risk</span>
                  <p className="text-xl font-bold font-serif text-blue-950 mt-1">{data.risk_summary.moderate_count}</p>
                  <span className="text-[10px] text-blue-600">Score 30-49</span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Low / On Track</span>
                  <p className="text-xl font-bold font-serif text-emerald-950 mt-1">{data.risk_summary.low_count}</p>
                  <span className="text-[10px] text-emerald-600">Score &lt; 30</span>
                </div>
              </div>

              {/* Major Risk Factors */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-800">Top Systemic Statutory Risk Drivers:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data.risk_summary.major_risk_factors.map((rf, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{rf.factor}</p>
                        <p className="text-[10px] text-slate-500">Weight: {rf.weight} • Impact: {rf.impact}</p>
                      </div>
                      <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                        {rf.affected_projects} Corridors
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Central Attention Queue */}
      {(activeTab === "attention" || activeTab === "all") && (
        <div className="space-y-5">
          <CentralAttentionQueue items={data.central_attention} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RecentActivityFeed activities={data.recent_activity} />
            <QuickActionsPanel actions={data.quick_actions} userRoleName={user?.role_name} />
          </div>
        </div>
      )}

      {/* VIEW: Executive Trends & MIS */}
      {(activeTab === "trends" || activeTab === "all") && (
        <div className="space-y-5">
          <NationalTrendsCharts trends={data.trends} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AcquisitionProgressCard data={data.acquisition_overview} />
            <RAndROverviewCard data={data.randr_overview} />
          </div>
        </div>
      )}
    </div>
  );
}
