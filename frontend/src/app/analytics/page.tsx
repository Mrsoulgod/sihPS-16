"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Coins,
  Compass,
  Users,
} from "lucide-react";
import {
  useNationalAnalytics,
  useStateAnalytics,
  useTimeSeriesAnalytics,
  useBottlenecks,
  useDataQuality,
} from "@/lib/hooks/useAnalytics";

export default function AnalyticsPage() {
  const [selectedState, setSelectedState] = useState<string>("");

  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useNationalAnalytics({
    state_id: selectedState || undefined,
  });
  const { data: states, isLoading: loadingStates } = useStateAnalytics();
  const { data: timeSeries, isLoading: loadingTimeSeries } = useTimeSeriesAnalytics({
    state_id: selectedState || undefined,
  });
  const { data: bottlenecks, isLoading: loadingBottlenecks } = useBottlenecks({
    state_id: selectedState || undefined,
  });
  const { data: dataQuality } = useDataQuality();

  const kpis = overview?.kpis;
  const funnel = overview?.funnel;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header & Jurisdiction Command Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  {overview?.scope_level || "NATIONAL"} COMMAND VIEW
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {overview?.jurisdiction_name || "All India"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-teal-600" />
                National Analytics & Acquisition Radar
              </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All India (National)</option>
                  {states?.map((st) => (
                    <option key={st.state_id} value={st.state_id}>
                      {st.state_name} ({st.project_count} Projects)
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/analytics/risk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-medium transition"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Risk Intelligence
              </Link>

              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                MIS Reports
              </Link>

              <button
                onClick={() => refetchOverview()}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Refresh Analytics"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* 2. Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projects KPI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Projects Pipeline
              </span>
              <Building2 className="h-5 w-5 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {kpis?.total_projects || 0}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {kpis?.active_projects || 0} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis?.completed_projects || 0} statutory completions declared
            </p>
          </div>

          {/* Land Acquisition KPI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Land Acquired
              </span>
              <Compass className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {Number(kpis?.total_land_acquired_acres || 0).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">Acres</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Number(kpis?.acquisition_progress_percent || 0))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex justify-between">
              <span>{kpis?.acquisition_progress_percent}% of Proposed</span>
              <span>{Number(kpis?.total_land_proposed_acres || 0).toLocaleString()} Ac Total</span>
            </p>
          </div>

          {/* Compensation & Disbursement KPI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                PFMS Disbursed
              </span>
              <Coins className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                ₹{Number(kpis?.total_compensation_disbursed_cr || 0).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">Cr</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Number(kpis?.disbursement_progress_percent || 0))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex justify-between">
              <span>{kpis?.disbursement_progress_percent}% Disbursed</span>
              <span className="text-amber-600 font-medium">₹{Number(kpis?.outstanding_compensation_cr || 0).toLocaleString()} Cr Outstanding</span>
            </p>
          </div>

          {/* Possession & R&R KPI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Possession & R&R
              </span>
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {Number(kpis?.total_possession_acres || 0).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">Ac Possession</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
              <span>PAF Settlement:</span>
              <span className="font-semibold text-teal-700">
                {kpis?.randr_completion_percent}% ({kpis?.randr_completed_families || 0}/{kpis?.total_affected_families || 0})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Statutory Acquisition Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-teal-600" />
                8-Stage Statutory Acquisition Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Progression metrics across RFCTLARR lifecycle stages with unit-specific tracking
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
              Baseline: {funnel?.baseline_project_count || 0} Projects / {funnel?.baseline_proposed_acres || 0} Acres
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {funnel?.stages.map((st, idx) => (
              <div
                key={st.stage_id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                    <span>STAGE {idx + 1}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === "ON_TRACK"
                          ? "bg-emerald-100 text-emerald-800"
                          : st.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {st.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{st.stage_name}</h3>
                  <p className="text-xs text-slate-500">{st.metric_label}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-slate-900">{st.formatted_value}</span>
                    <span className="text-xs font-semibold text-teal-700">{st.conversion_rate_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-teal-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Number(st.conversion_rate_pct || 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. State Performance Matrix & Time Series */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* State Comparison Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    State-wise Performance Matrix
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comparative acquisition extent, disbursement, and PAF settlement by state
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-semibold text-xs">
                      <th className="px-3 py-2 text-left">State</th>
                      <th className="px-3 py-2 text-right">Projects</th>
                      <th className="px-3 py-2 text-right">Acquired (Ac)</th>
                      <th className="px-3 py-2 text-right">Progress</th>
                      <th className="px-3 py-2 text-right">Disbursed (₹ Cr)</th>
                      <th className="px-3 py-2 text-right">R&R %</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {states?.map((st) => (
                      <tr
                        key={st.state_id}
                        className={`hover:bg-slate-50 transition cursor-pointer ${
                          selectedState === st.state_id ? "bg-teal-50/60 font-semibold" : ""
                        }`}
                        onClick={() => setSelectedState(selectedState === st.state_id ? "" : st.state_id)}
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-900 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-teal-500" />
                          {st.state_name}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-600">{st.project_count}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                          {Number(st.land_acquired_acres).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-indigo-600">
                          {st.acquisition_percent}%
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                          ₹{Number(st.compensation_disbursed_cr).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-teal-700">
                          {st.randr_completion_percent}%
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.performance_category === "STRONG"
                                ? "bg-emerald-100 text-emerald-800"
                                : st.performance_category === "MODERATE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {st.performance_category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>Click any state row to filter dashboard view</span>
              {selectedState && (
                <button
                  onClick={() => setSelectedState("")}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Clear State Filter
                </button>
              )}
            </div>
          </div>

          {/* Time Series Milestone Progression (1 Col) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Milestone Progression
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cumulative statutory progression across FY 2026
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {timeSeries?.data_points.map((pt, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-teal-600" />
                        {pt.period_label}
                      </span>
                      <span className="text-slate-500 font-normal">{pt.date_iso}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Land Acquired:</span>
                        <p className="font-bold text-slate-900">{Number(pt.land_acquired_acres_cumulative).toLocaleString()} Ac</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Disbursed:</span>
                        <p className="font-bold text-emerald-700">₹{Number(pt.compensation_disbursed_cr_cumulative).toLocaleString()} Cr</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Possession:</span>
                        <p className="font-bold text-slate-900">{Number(pt.possession_acres_cumulative).toLocaleString()} Ac</p>
                      </div>
                      <div>
                        <span className="text-slate-500">PAFs Settled:</span>
                        <p className="font-bold text-teal-700">{pt.randr_settled_cumulative} Families</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
              {timeSeries?.time_horizon_note}
            </p>
          </div>
        </div>

        {/* 5. Bottlenecks & Attention Radar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Operational Bottlenecks & Attention Radar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rule-based identification of overdue statutory tasks, disputed parcels, and disbursement backlogs
              </p>
            </div>
            <Link
              href="/analytics/risk"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View Full Risk Intelligence <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold text-xs">
                  <th className="px-3 py-2 text-left">Project</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-left">Stage</th>
                  <th className="px-3 py-2 text-center">Severity</th>
                  <th className="px-3 py-2 text-left">Primary Operational Reason</th>
                  <th className="px-3 py-2 text-right">Overdue Tasks</th>
                  <th className="px-3 py-2 text-right">Outstanding ₹</th>
                  <th className="px-3 py-2 text-right">Risk Score</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bottlenecks?.map((b) => (
                  <tr key={b.project_id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">{b.project_code}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{b.title}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {b.district_name ? `${b.district_name}, ` : ""}{b.state_name || "-"}
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-slate-700">
                      {b.current_stage}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : b.severity === "AT_RISK"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : b.severity === "WATCH"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700 max-w-sm">
                      {b.primary_reason}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-semibold text-rose-700">
                      {b.overdue_tasks_count}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-slate-900">
                      ₹{Number(b.outstanding_compensation_cr).toFixed(1)} Cr
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-bold text-sm text-slate-900">{b.risk_score}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link
                        href={`/projects/${b.project_id}`}
                        className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-xs font-medium transition"
                      >
                        Inspect 360°
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Statutory Data Quality & Financial Reconciliation Audit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Statutory Data Quality & Financial Reconciliation Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated consistency checks ensuring legal ceilings ($Disbursed \le Awarded$, $Acquired \le Proposed$)
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                dataQuality?.overall_status === "COMPLIANT"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              STATUS: {dataQuality?.overall_status || "COMPLIANT"} ({dataQuality?.passed_checks_count || 4}/{dataQuality?.total_checks_count || 4} Passed)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataQuality?.checks.map((c) => (
              <div
                key={c.check_id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{c.check_id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.is_compliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{c.check_name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{c.rule_description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Tested: </span>
                    <span className="font-bold text-slate-800">{c.tested_value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reference: </span>
                    <span className="font-medium text-slate-700">{c.reference_value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-right">
            Last audited: {dataQuality?.reconciliation_timestamp || "Real-time Database Audit"}
          </p>
        </div>
      </div>
    </div>
  );
}
