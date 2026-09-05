"use client";

import React, { useState } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { AcquisitionProgressCard } from "@/components/dashboard/AcquisitionProgressCard";
import { RAndROverviewCard } from "@/components/dashboard/RAndROverviewCard";
import { ProjectStatusSummary } from "@/components/dashboard/ProjectStatusSummary";
import { StateComparisonTable } from "@/components/dashboard/StateComparisonTable";
import { AttentionProjectsList } from "@/components/dashboard/AttentionProjectsList";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import Link from "next/link";
import {
  RefreshCw,
  AlertCircle,
  Building,
  Shield,
  MapPin,
  Calendar,
  Landmark,
  BarChart3,
  ShieldAlert,
  FileSpreadsheet,
  ArrowRight,
  LayoutDashboard,
  Compass,
  Users2,
  AlertTriangle,
  History,
  Layers,
  FileCheck2,
  Navigation,
  Sparkles,
} from "lucide-react";

type DashboardTab = "overview" | "acquisition" | "randr" | "risk" | "activity" | "all";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-20 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-200 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-white p-8 rounded-lg border border-rose-200 shadow-sm text-center">
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
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#138808] text-white font-medium text-xs shadow hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tabButtons = [
    { id: "overview", label: "Executive Summary", icon: LayoutDashboard, badge: "8 KPIs" },
    { id: "acquisition", label: "Land & Cadastre", icon: Compass, badge: `${data.acquisition_overview?.acquisition_percent || 0}%` },
    { id: "randr", label: "R&R & Families", icon: Users2, badge: `${data.kpis?.affected_families || 0} PAFs` },
    { id: "risk", label: "Risk & Pipeline", icon: AlertTriangle, badge: `${data.status_breakdown?.at_risk || 0} At Risk` },
    { id: "activity", label: "Audit & Actions", icon: History, badge: "Live" },
    { id: "all", label: "Full View", icon: Layers, badge: "All" },
  ] as const;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Institutional National Command Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                {data.scope_level} COMMAND VIEW
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600 inline" />
                {data.jurisdiction_name}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1 tracking-tight">
              National Land Acquisition & Management Portal
            </h1>

            <p className="text-xs text-slate-500 mt-0.5">
              Statutory monitoring under RFCTLARR Act 2013 • Direct Benefit Transfer & Resettlement Authority
            </p>
          </div>

          {/* Right Action: Date + Refresh */}
          <div className="flex items-center gap-3 self-start md:self-auto text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-2xs"
              title="Refresh live metrics from PostgreSQL"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>{isFetching ? "Syncing..." : "Sync Live"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick-Access Navigation Buttons Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Link
          href="/land-parcels"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">GIS Map</p>
            <p className="text-[10px] text-slate-500 truncate">Cadastral viewer</p>
          </div>
        </Link>

        <Link
          href="/projects/PRJ-NH48-DJE"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Flagship 360</p>
            <p className="text-[10px] text-slate-500 truncate">NH-48 DJE Corridor</p>
          </div>
        </Link>

        <Link
          href="/compensation"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-amber-500 hover:bg-amber-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Landmark className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Compensation</p>
            <p className="text-[10px] text-slate-500 truncate">Section 30 Awards</p>
          </div>
        </Link>

        <Link
          href="/analytics/risk"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-rose-500 hover:bg-rose-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Predictive Risk</p>
            <p className="text-[10px] text-slate-500 truncate">5-Factor AI rules</p>
          </div>
        </Link>

        <Link
          href="/reports"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">MIS Reports</p>
            <p className="text-[10px] text-slate-500 truncate">PDF & Excel export</p>
          </div>
        </Link>

        <Link
          href="/field"
          className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-purple-500 hover:bg-purple-50/30 transition-all group"
        >
          <div className="h-8 w-8 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">Field Survey</p>
            <p className="text-[10px] text-slate-500 truncate">Mobile checklist</p>
          </div>
        </Link>
      </div>

      {/* 3. Section Filter Buttons / Segmented Dashboard Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-xl border border-slate-300/80">
        {tabButtons.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#138808]" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? "bg-emerald-100 text-emerald-900" : "bg-slate-300/70 text-slate-600"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB: Overview & Executive KPIs */}
      {(activeTab === "overview" || activeTab === "all") && (
        <div className="space-y-5">
          {/* Top 8 KPI Cards */}
          <TopKpiCards kpis={data.kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Quick Acquisition Preview */}
            <AcquisitionProgressCard data={data.acquisition_overview} />
            {/* Priority Attention Projects */}
            <AttentionProjectsList projects={data.attention_projects} />
          </div>
        </div>
      )}

      {/* TAB: Land Acquisition & GIS */}
      {(activeTab === "acquisition" || activeTab === "all") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <Compass className="h-4 w-4 text-emerald-700" />
              <span>Physical Cadastral Progress & State-Wise Allocation</span>
            </div>
            <Link
              href="/land-parcels"
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Open Cadastral Map Viewer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <AcquisitionProgressCard data={data.acquisition_overview} />
          <StateComparisonTable states={data.state_progress} />
        </div>
      )}

      {/* TAB: R&R & Affected Families */}
      {(activeTab === "randr" || activeTab === "all") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-200 p-3.5 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-semibold">
              <Users2 className="h-4 w-4 text-blue-700" />
              <span>Rehabilitation & Resettlement Implementation Progress</span>
            </div>
            <Link
              href="/affected-families"
              className="font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Manage PAFs / PDFs Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <RAndROverviewCard data={data.randr_overview} />
        </div>
      )}

      {/* TAB: Risk & Pipeline Health */}
      {(activeTab === "risk" || activeTab === "all") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-rose-50/60 border border-rose-200 p-3.5 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-rose-900 font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-700" />
              <span>Pipeline Stage SLA Adherence & Early Warning Triggers</span>
            </div>
            <Link
              href="/analytics/risk"
              className="font-bold text-rose-700 hover:underline flex items-center gap-1"
            >
              <span>Open 5-Factor Risk Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ProjectStatusSummary status={data.status_breakdown} />
          <AttentionProjectsList projects={data.attention_projects} />
        </div>
      )}

      {/* TAB: Activity & Actions */}
      {(activeTab === "activity" || activeTab === "all") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityFeed activities={data.recent_activity} />
          <QuickActionsPanel
            actions={data.quick_actions}
            userRoleName={user?.role_name}
          />
        </div>
      )}
    </div>
  );
}

