"use client";

import React from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { AcquisitionProgressCard } from "@/components/dashboard/AcquisitionProgressCard";
import { ProjectStatusSummary } from "@/components/dashboard/ProjectStatusSummary";
import { StateComparisonTable } from "@/components/dashboard/StateComparisonTable";
import { AttentionProjectsList } from "@/components/dashboard/AttentionProjectsList";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import {
  RefreshCw,
  AlertCircle,
  Building,
  Shield,
  MapPin,
  Calendar,
  Landmark,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="h-20 bg-slate-200 rounded-lg" />

        {/* Top KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-lg" />
          ))}
        </div>

        {/* Overview Skeleton */}
        <div className="h-44 bg-slate-200 rounded-lg" />

        {/* Status Skeleton */}
        <div className="h-36 bg-slate-200 rounded-lg" />

        {/* Table Skeleton */}
        <div className="h-56 bg-slate-200 rounded-lg" />
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Institutional National Command Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                {data.scope_level} COMMAND VIEW
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600 inline" />
                {data.jurisdiction_name}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1 tracking-tight">
              National Land Acquisition & Management Portal
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Statutory monitoring under RFCTLARR Act 2013 • Direct Benefit Transfer & Resettlement Authority
            </p>
          </div>

          {/* Right Action: Date + Refresh */}
          <div className="flex items-center gap-3 self-start md:self-auto text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-2xs"
              title="Refresh live metrics from PostgreSQL"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
              <span>{isFetching ? "Syncing..." : "Sync Live"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Top KPI Cards */}
      <TopKpiCards kpis={data.kpis} />

      {/* 2. Acquisition Progress Overview Card */}
      <AcquisitionProgressCard data={data.acquisition_overview} />

      {/* 3. Pipeline Health & Risk Status */}
      <ProjectStatusSummary status={data.status_breakdown} />

      {/* 4. Projects Requiring Attention (Priority Flagged) */}
      <AttentionProjectsList projects={data.attention_projects} />

      {/* 5. State-Wise Comparative Performance Table */}
      <StateComparisonTable states={data.state_progress} />

      {/* 6. Two-Column Bottom Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityFeed activities={data.recent_activity} />
        <QuickActionsPanel
          actions={data.quick_actions}
          userRoleName={user?.role_name}
        />
      </div>
    </div>
  );
}
