"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin,
  Sparkles,
  RefreshCw,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  FileCheck,
  Award,
  CreditCard,
  Compass,
} from "lucide-react";
import { DashboardSummary } from "@/lib/types/dashboard";
import { SocialDashboardSummary } from "@/lib/types/social";

interface SocialOfficerDashboardProps {
  data: DashboardSummary;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SocialOfficerDashboard({
  data,
  onRefresh,
  isRefreshing = false,
}: SocialOfficerDashboardProps) {
  const [activeQueueTab, setActiveQueueTab] = useState<
    "eligibility" | "entitlement" | "allotment" | "verification" | "overdue"
  >("eligibility");

  const socialWork: SocialDashboardSummary | undefined = (data as any).randr_case_management;
  const kpis = socialWork?.kpis || {
    affected_families_count: 48,
    survey_pending_count: 6,
    eligibility_pending_count: 12,
    entitlement_pending_count: 8,
    approval_pending_count: 4,
    allotment_pending_count: 14,
    implementation_pending_count: 10,
    verification_pending_count: 5,
    completed_count: 18,
    overdue_cases_count: 3,
    high_risk_projects_count: 1,
    active_schemes_count: 2,
  };

  const myActions = socialWork?.my_actions || [];
  const overdueCases = socialWork?.overdue_cases || [];
  const eligCases = socialWork?.eligibility_pending_cases || [];
  const entitleCases = socialWork?.entitlement_pending_cases || [];
  const allotCases = socialWork?.allotment_pending_cases || [];
  const verifCases = socialWork?.verification_pending_cases || [];
  const schemes = socialWork?.active_schemes_summary || [];
  const projects = socialWork?.projects_progress || [];
  const notifications = socialWork?.notifications || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Users className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold tracking-wider uppercase font-mono">
                R&R / Social Operations
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-medium font-mono">
                {data.jurisdiction_name || "Jaipur District R&R Schemes (DST-JAI)"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              R&R CASE MANAGEMENT
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Statutory rehabilitation & resettlement tracking, entitlement determination, plot allotments,
              and possession dependency monitoring under RFCTLARR 2013 Second Schedule.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            )}
            <Link
              href="/affected-families"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition"
            >
              <Users className="w-4 h-4" />
              <span>All Affected Families</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Critical Blocking Possession Banner */}
      {projects.some((p) => p.has_blocking_possession_dependency) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider font-mono">
                  BLOCKING DEPENDENCY
                </span>
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Land Possession Blocked Pending Family Rehabilitation
                </h3>
              </div>
              <p className="text-xs text-amber-900 mt-1 max-w-3xl">
                NH-48 Expressway Package 4 (Manpura) requires relocation of 14 titleholder families before statutory Section 38 possession handover can proceed.
              </p>
            </div>
          </div>
          <Link
            href="/affected-families"
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold shrink-0 transition"
          >
            Review Blocking Cases
          </Link>
        </div>
      )}

      {/* 3. 12 Statutory R&R KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            12 Statutory R&R Lifecycle Metrics
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">RFCTLARR 2013 Mandate</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Affected Families */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">1. Affected Families</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.affected_families_count}</div>
            <span className="text-[10px] text-slate-400">Total in Scope</span>
          </div>

          {/* 2. Survey Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">2. Survey Pending</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{kpis.survey_pending_count}</div>
            <span className="text-[10px] text-slate-400">Ground enumeration</span>
          </div>

          {/* 3. Eligibility Pending */}
          <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-800 block">3. Eligibility Pending</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{kpis.eligibility_pending_count}</div>
            <span className="text-[10px] text-amber-600">Review required</span>
          </div>

          {/* 4. Entitlement Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">4. Entitlement Pending</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{kpis.entitlement_pending_count}</div>
            <span className="text-[10px] text-slate-400">Grant calculation</span>
          </div>

          {/* 5. Approval Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">5. Approval Pending</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{kpis.approval_pending_count}</div>
            <span className="text-[10px] text-slate-400">CALA sanction</span>
          </div>

          {/* 6. Allotment Pending */}
          <div className="bg-white border border-orange-200 bg-orange-50/40 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-orange-800 block">6. Allotment Pending</span>
            <div className="text-2xl font-black text-orange-600 mt-1">{kpis.allotment_pending_count}</div>
            <span className="text-[10px] text-orange-600">Plot sanction</span>
          </div>

          {/* 7. Implementation Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">7. Implementation</span>
            <div className="text-2xl font-black text-slate-700 mt-1">{kpis.implementation_pending_count}</div>
            <span className="text-[10px] text-slate-400">Delivery / relocation</span>
          </div>

          {/* 8. Verification Pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">8. Verification</span>
            <div className="text-2xl font-black text-teal-600 mt-1">{kpis.verification_pending_count}</div>
            <span className="text-[10px] text-slate-400">Field sign-off</span>
          </div>

          {/* 9. Completed */}
          <div className="bg-white border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-800 block">9. Completed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{kpis.completed_count}</div>
            <span className="text-[10px] text-emerald-600">Settled & verified</span>
          </div>

          {/* 10. Overdue Cases */}
          <div className="bg-white border border-rose-200 bg-rose-50/40 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-rose-800 block">10. Overdue Cases</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{kpis.overdue_cases_count}</div>
            <span className="text-[10px] text-rose-600">SLA breached</span>
          </div>

          {/* 11. High-Risk Projects */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">11. High-Risk R&R</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.high_risk_projects_count}</div>
            <span className="text-[10px] text-slate-400">Corridors at risk</span>
          </div>

          {/* 12. Active Schemes */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 block">12. Active Schemes</span>
            <div className="text-2xl font-black text-blue-900 mt-1">{kpis.active_schemes_count}</div>
            <span className="text-[10px] text-slate-400">Resettlement colonies</span>
          </div>
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Actions & Stage Queues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: My R&R Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <span>MY R&R ACTIONS</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Action items assigned to you for statutory review and processing
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                {myActions.length} Pending
              </span>
            </div>

            {myActions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No pending R&R actions at this time. All cases are on track.
              </div>
            ) : (
              <div className="space-y-3">
                {myActions.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {act.family_reference_id}
                        </span>
                        <span className="text-xs text-slate-700 font-medium">
                          • {act.head_of_family_name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            act.priority === "CRITICAL"
                              ? "bg-rose-100 text-rose-800"
                              : act.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {act.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          {act.case_stage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{act.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {act.village_name} • {act.project_title} • Due: {act.due_date || "2026-09-25"}
                      </p>
                    </div>
                    <Link
                      href={act.target_route || `/affected-families/${act.family_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Stage Work Queues (Tabs) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Case Work Queues</h2>
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveQueueTab("eligibility")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeQueueTab === "eligibility"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Eligibility ({eligCases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab("entitlement")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeQueueTab === "entitlement"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Entitlements ({entitleCases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab("allotment")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeQueueTab === "allotment"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Allotments ({allotCases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab("verification")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeQueueTab === "verification"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Verification ({verifCases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQueueTab("overdue")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeQueueTab === "overdue"
                      ? "bg-rose-100 text-rose-900 shadow-sm"
                      : "text-rose-600 hover:text-rose-800"
                  }`}
                >
                  Overdue ({overdueCases.length})
                </button>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase font-mono bg-slate-50/50">
                    <th className="py-2.5 px-3">Family Ref</th>
                    <th className="py-2.5 px-3">Head of Family</th>
                    <th className="py-2.5 px-3">Village / Khasra</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Pending Action</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const currentList =
                      activeQueueTab === "eligibility"
                        ? eligCases
                        : activeQueueTab === "entitlement"
                        ? entitleCases
                        : activeQueueTab === "allotment"
                        ? allotCases
                        : activeQueueTab === "verification"
                        ? verifCases
                        : overdueCases;

                    if (currentList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400">
                            No cases in this queue.
                          </td>
                        </tr>
                      );
                    }

                    return currentList.slice(0, 6).map((fam) => (
                      <tr key={fam.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {fam.family_reference_id}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {fam.head_of_family_name}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {fam.village_name} (Khasra {fam.khasra_number})
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">
                            {fam.social_category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              fam.eligibility_status === "ELIGIBLE"
                                ? "bg-emerald-100 text-emerald-800"
                                : fam.eligibility_status === "UNDER_REVIEW"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {fam.eligibility_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {fam.pending_action}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/affected-families/${fam.id}`}
                            className="inline-flex items-center gap-1 text-[#138808] hover:text-emerald-700 font-bold"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Schemes & Project R&R Monitoring */}
        <div className="space-y-6">
          {/* Active R&R Schemes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span>R&R Schemes & Colonies</span>
              </h2>
              <Link href="/r-and-r" className="text-xs text-[#138808] font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {schemes.map((sch) => (
                <div key={sch.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {sch.scheme_title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {sch.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {sch.resettlement_site_name}
                  </p>
                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
                      <span>Plots Allotted: {sch.total_plots_allotted} / {sch.total_plots_planned}</span>
                      <span className="font-bold text-slate-900">{sch.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#138808] h-full rounded-full transition-all"
                        style={{ width: `${sch.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project R&R Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <span>Project R&R Progress</span>
            </h2>

            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.project_id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{p.project_code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        p.randr_risk_level === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : p.randr_risk_level === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {p.randr_risk_level} RISK
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {p.project_title}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-600 grid grid-cols-2 gap-1 font-mono">
                    <span>PAF Settled: {p.physically_settled_families} / {p.total_affected_families}</span>
                    <span>Pending: {p.pending_cases_count}</span>
                  </div>
                  {p.has_blocking_possession_dependency && (
                    <div className="mt-2 p-2 rounded bg-amber-100/80 text-[10px] text-amber-900 font-medium">
                      ⚠️ Possession Handover Blocked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notifications / SLA Watch */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span>R&R Statutory Alerts</span>
            </h2>
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        n.severity === "CRITICAL"
                          ? "bg-rose-500"
                          : n.severity === "HIGH"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <span className="font-bold text-slate-900">{n.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
