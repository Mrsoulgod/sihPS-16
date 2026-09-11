"use client";

import React, { useState } from "react";
import { DashboardSummaryData } from "@/lib/types/dashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { StateKpiGrid } from "@/components/dashboard/StateKpiGrid";
import { DistrictPerformanceMatrix } from "@/components/dashboard/DistrictPerformanceMatrix";
import { DistrictEscalationsQueue } from "@/components/dashboard/DistrictEscalationsQueue";
import { StateAttentionQueue } from "@/components/dashboard/StateAttentionQueue";
import { StateCompensationCard } from "@/components/dashboard/StateCompensationCard";
import { StatePossessionCard } from "@/components/dashboard/StatePossessionCard";
import { StateRAndRCard } from "@/components/dashboard/StateRAndRCard";
import { NationalFunnel } from "@/components/dashboard/NationalFunnel";
import { CriticalProjectsSpotlight } from "@/components/dashboard/CriticalProjectsSpotlight";
import { NationalTrendsCharts } from "@/components/dashboard/NationalTrendsCharts";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import Link from "next/link";
import {
  LayoutDashboard,
  Layers,
  Compass,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CreditCard,
  TrendingUp,
  RefreshCw,
  MapPin,
  Calendar,
  Landmark,
  Building,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from "lucide-react";

interface StateAcquisitionControlProps {
  data: DashboardSummaryData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type StateTab =
  | "overview"
  | "districts"
  | "funnel"
  | "projects"
  | "escalations"
  | "attention"
  | "financials"
  | "trends"
  | "all";

export function StateAcquisitionControl({
  data,
  onRefresh,
  isRefreshing = false,
}: StateAcquisitionControlProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StateTab>("overview");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stateName = data.state_name || "Rajasthan";

  const stateTabs = [
    { id: "overview", label: "State Overview", icon: LayoutDashboard, badge: "12 KPIs" },
    { id: "districts", label: "District Performance", icon: Layers, badge: `${data.district_performance?.length || 4} Districts` },
    { id: "funnel", label: "Acquisition Funnel", icon: Compass, badge: "12 Stages" },
    { id: "projects", label: "State Projects", icon: Building, badge: `${data.kpis.total_projects} Projects` },
    { id: "escalations", label: "District Escalations", icon: AlertOctagon, badge: `${data.district_escalations?.length || 0} Issues` },
    { id: "attention", label: "State Attention", icon: ShieldAlert, badge: `${data.state_attention?.length || 0} Directives` },
    { id: "financials", label: "Compensation & Possession", icon: CreditCard, badge: "Sec 23/38" },
    { id: "trends", label: "Trends & MIS", icon: TrendingUp, badge: "Trajectory" },
    { id: "all", label: "Full View", icon: Layers, badge: "All" },
  ] as const;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. STATE ACQUISITION CONTROL TOP SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                STATE ACQUISITION CONTROL CENTER
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 inline" />
                State Jurisdiction: <strong>{stateName}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1.5 tracking-tight">
              {user?.full_name ? `Welcome, ${user.full_name}` : `${stateName} Acquisition Control Center`}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>Role: <strong className="text-slate-800">{user?.role_name || "State Revenue Officer"}</strong></span>
              <span>•</span>
              <span>Department: <strong className="text-slate-800">State Revenue & Land Acquisition Nodal Authority</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>{currentDate}</span>
              </span>
            </div>
          </div>

          {/* Quick Refresh & Reporting CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : "text-slate-500"}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh State Telemetry"}</span>
            </button>

            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#138808] hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>State MIS Report</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {stateTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as StateTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none ${
                  isTabActive
                    ? "bg-slate-900 text-white shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isTabActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isTabActive ? "bg-slate-800 text-emerald-300" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT DISPATCHER */}

      {/* OVERVIEW / DEFAULT TAB */}
      {(activeTab === "overview" || activeTab === "all") && (
        <div className="space-y-6">
          {/* 12 State KPIs Grid */}
          <StateKpiGrid kpis={data.kpis} />

          {/* Subordinate District Performance Matrix */}
          {data.district_performance && data.district_performance.length > 0 && (
            <DistrictPerformanceMatrix
              districts={data.district_performance}
              onSelectDistrict={(distId) => setSelectedDistrictId(distId)}
              selectedDistrictId={selectedDistrictId}
            />
          )}

          {/* District Escalations & State Attention Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.state_attention && data.state_attention.length > 0 && (
              <StateAttentionQueue items={data.state_attention} />
            )}
            {data.district_escalations && data.district_escalations.length > 0 && (
              <DistrictEscalationsQueue escalations={data.district_escalations} />
            )}
          </div>

          {/* Quick Actions & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <QuickActionsPanel actions={data.quick_actions} />
            </div>
            <div className="lg:col-span-2">
              <RecentActivityFeed activities={data.recent_activity} />
            </div>
          </div>
        </div>
      )}

      {/* DISTRICTS TAB */}
      {activeTab === "districts" && data.district_performance && (
        <div className="space-y-5">
          <DistrictPerformanceMatrix
            districts={data.district_performance}
            onSelectDistrict={(distId) => setSelectedDistrictId(distId)}
            selectedDistrictId={selectedDistrictId}
          />
        </div>
      )}

      {/* FUNNEL TAB */}
      {(activeTab === "funnel" || activeTab === "all") && data.funnel && (
        <div className="space-y-5">
          <NationalFunnel stages={data.funnel} />
        </div>
      )}

      {/* PROJECTS TAB */}
      {(activeTab === "projects" || activeTab === "all") && data.critical_projects && (
        <div className="space-y-5">
          <CriticalProjectsSpotlight projects={data.critical_projects} />
        </div>
      )}

      {/* ESCALATIONS TAB */}
      {activeTab === "escalations" && data.district_escalations && (
        <div className="space-y-5">
          <DistrictEscalationsQueue escalations={data.district_escalations} />
        </div>
      )}

      {/* ATTENTION TAB */}
      {activeTab === "attention" && data.state_attention && (
        <div className="space-y-5">
          <StateAttentionQueue items={data.state_attention} />
        </div>
      )}

      {/* FINANCIALS & POSSESSION & R&R TAB */}
      {(activeTab === "financials" || activeTab === "all") && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <StateCompensationCard compensation={data.state_compensation} />
            <StatePossessionCard possession={data.state_possession} />
          </div>
          <StateRAndRCard randr={data.state_randr} />
        </div>
      )}

      {/* TRENDS TAB */}
      {(activeTab === "trends" || activeTab === "all") && data.trends && (
        <div className="space-y-5">
          <NationalTrendsCharts trends={data.trends} />
        </div>
      )}
    </div>
  );
}
