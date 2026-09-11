"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardSummaryData, AgencyActionItem, AgencyProjectItem } from "@/lib/types/dashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Building2,
  FilePlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Calculator,
  ShieldCheck,
  Home,
  ShieldAlert,
  FileText,
  Compass,
  CheckCircle,
  MapPin,
  Send,
  Calendar,
  Filter,
  Eye,
  Edit3,
} from "lucide-react";

interface ProjectAgencyControlProps {
  data: DashboardSummaryData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type ActionCategoryFilter = "ALL" | "PENDING_SUBMISSION" | "REWORK_REQUEST" | "DOCUMENT_REQUEST" | "CLARIFICATION_REQUIRED" | "SURVEY_REQUEST";

export function ProjectAgencyControl({
  data,
  onRefresh,
  isRefreshing = false,
}: ProjectAgencyControlProps) {
  const { user } = useAuth();
  const [actionFilter, setActionFilter] = useState<ActionCategoryFilter>("ALL");
  const [projectSearch, setProjectSearch] = useState("");

  const agencyControl = data.agency_control;
  const actions = agencyControl?.actions || data.agency_actions || [];
  const projectsSummary = agencyControl?.projects_summary || data.agency_projects;
  const landSummary = agencyControl?.land_acquisition || data.agency_land;
  const compSummary = agencyControl?.compensation || data.agency_compensation;
  const possSummary = agencyControl?.possession || data.agency_possession;
  const randrSummary = agencyControl?.randr || data.agency_randr;
  const riskSummary = agencyControl?.risk || data.agency_risk;
  const recentActivities = data.recent_activity || [];

  const agencyName = user?.organization || "National Highways Authority of India (NHAI)";
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const filteredActions = actions.filter((act) => {
    if (actionFilter === "ALL") return true;
    return act.category === actionFilter;
  });

  const allProjects = projectsSummary?.items || [];
  const filteredProjects = allProjects.filter((p) => {
    if (!projectSearch) return true;
    const q = projectSearch.toLowerCase();
    const title = (p.title || "").toLowerCase();
    const code = (p.project_code || "").toLowerCase();
    const district = (p.district_name || "").toLowerCase();
    return title.includes(q) || code.includes(q) || district.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Hero Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-[#138808] border border-emerald-200 uppercase tracking-wider">
                Implementing Agency Scope
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {currentDate}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#138808]" />
              PROJECT AGENCY CONTROL CENTER
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Authoritative proposal origination, statutory scrutiny response, and acquisition tracking for{" "}
              <span className="text-slate-900 font-semibold">{agencyName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition flex items-center gap-2 shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#138808]" : ""}`} />
              Refresh
            </button>
            <Link
              href="/projects/new"
              className="px-4 py-2 text-xs font-bold bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <FilePlus className="h-4 w-4" />
              + New Project Proposal
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Section A: My Actions (Task Queue) */}
      <div id="actions" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#138808]" />
                My Actions & Statutory Tasks
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-[#138808] border border-emerald-200 font-semibold">
                {actions.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tasks assigned to the agency requiring proposal correction, documents, or survey coordination.
            </p>
          </div>

          {/* Action Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { key: "ALL", label: "All" },
              { key: "REWORK_REQUEST", label: "Rework Requests" },
              { key: "DOCUMENT_REQUEST", label: "Document Requests" },
              { key: "SURVEY_REQUEST", label: "Survey Requests" },
              { key: "CLARIFICATION_REQUIRED", label: "Clarifications" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActionFilter(f.key as ActionCategoryFilter)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border whitespace-nowrap transition ${
                  actionFilter === f.key
                    ? "bg-[#138808] text-white border-[#138808] shadow-xs font-bold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <CheckCircle2 className="h-8 w-8 text-[#138808] mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-800">No pending action items in this category</p>
              <p className="text-xs text-slate-500 mt-1">All scrutiny tasks and submissions are currently up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActions.map((act, idx) => {
                const isCritical = act.priority === "CRITICAL";
                const isRework = act.category === "REWORK_REQUEST";
                const isOrange = idx % 2 === 0;

                return (
                  <div
                    key={act.id}
                    className={`rounded-xl p-4 transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                      isRework
                        ? "bg-white border-2 border-amber-400"
                        : isOrange
                        ? "bg-white border border-slate-200 hover:border-amber-400"
                        : "bg-white border border-slate-200 hover:border-[#138808]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              isRework
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : isCritical
                                ? "bg-rose-50 text-rose-900 border-rose-300"
                                : "bg-blue-50 text-blue-900 border-blue-300"
                            }`}
                          >
                            {act.category.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 font-mono">
                            {act.project_code}
                          </span>
                        </div>
                        {act.due_date && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            Due: {new Date(act.due_date).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {act.title}
                      </h4>
                      {act.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {act.description}
                        </p>
                      )}

                      {act.required_correction && isRework && (
                        <div className="mt-2 p-2 bg-slate-50 border border-amber-300 rounded text-[11px] text-slate-800">
                          <span className="font-bold text-amber-900">Required Correction:</span> {act.required_correction}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        From: {act.requested_by || "CALA Authority"}
                      </span>
                      <Link
                        href={act.target_route}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-2xs ${
                          isRework
                            ? "bg-[#138808] hover:bg-[#0f6c06] text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isRework ? "Open & Resubmit" : "View Details"}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Section B: My Projects Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#138808]" />
              My Projects Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete status breakdown of all infrastructure projects belonging to {agencyName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search my projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
            />
            <Link
              href="/projects"
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition"
            >
              View Directory
            </Link>
          </div>
        </div>

        {/* Project Status Breakdown Grid (Logo Green & Saffron Diagonal Hover Gradient) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          {[
            { label: "Total Projects", val: projectsSummary?.total_projects ?? allProjects.length },
            { label: "Draft", val: projectsSummary?.draft_count ?? 0 },
            { label: "Submitted", val: projectsSummary?.submitted_count ?? 0 },
            { label: "Under Scrutiny", val: projectsSummary?.under_scrutiny_count ?? 0 },
            { label: "Approved", val: projectsSummary?.approved_count ?? 0 },
            { label: "In Progress", val: projectsSummary?.in_progress_count ?? 0 },
            { label: "Completed", val: projectsSummary?.completed_count ?? 0 },
          ].map((s, idx) => {
            const isOrange = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`border border-slate-200 rounded-xl p-3 text-center transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                  isOrange
                    ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                    : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                }`}
              >
                <div className="text-2xl font-black text-slate-900">
                  {s.val}
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Cards List (Logo Green & Saffron Diagonal Hover Gradient) */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-xs text-slate-500">No projects found matching search query.</p>
            </div>
          ) : (
            filteredProjects.map((p, pIdx) => {
              const isOrange = pIdx % 2 === 0;
              return (
                <div
                  key={p.id}
                  className={`border border-slate-200 rounded-xl p-4 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {p.project_code}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                          p.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : p.status === "SUBMITTED"
                            ? "bg-blue-100 text-blue-900 border-blue-200"
                            : p.status === "UNDER_SCRUTINY" || p.status === "REWORK_REQUESTED"
                            ? "bg-amber-100 text-amber-900 border-amber-200"
                            : p.status === "APPROVED"
                            ? "bg-emerald-100 text-[#138808] border-emerald-200 font-semibold"
                            : "bg-teal-100 text-teal-800 border-teal-200 font-semibold"
                        }`}
                      >
                        {p.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {p.district_name || "Jaipur"}, {p.state_name || "Rajasthan"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {p.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                      <span>
                        Proposed: <strong className="text-slate-900">{p.land_proposed_acres} Ac</strong>
                      </span>
                      <span>
                        Acquired: <strong className="text-[#138808]">{p.land_acquired_acres} Ac</strong> ({p.acquisition_percent}%)
                      </span>
                      <span>
                        Disbursed: <strong className="text-slate-900">₹{p.compensation_disbursed_cr} Cr</strong>
                      </span>
                      <span>
                        Possession: <strong className="text-slate-900">{p.possession_percent}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    {p.status === "DRAFT" && (
                      <Link
                        href={`/projects/${p.id}`}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Draft
                      </Link>
                    )}
                    <Link
                      href={`/projects/${p.id}`}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Project 360
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Two-Column Matrix: Land Acquisition & Compensation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section C: Land Acquisition */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#138808]" />
              Land Acquisition Lifecycle
            </h2>
            <span className="text-[11px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {landSummary?.acquisition_percent ?? 0}% Complete
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600">Acquisition Progress</span>
              <span className="font-bold text-slate-900">
                {landSummary?.land_acquired_acres ?? 0} / {landSummary?.land_proposed_acres ?? 0} Acres
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#138808] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, landSummary?.acquisition_percent ?? 0)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Proposed Land", val: `${landSummary?.land_proposed_acres ?? 0} Ac`, sub: "DPR Statement" },
              { label: "Identified Land", val: `${landSummary?.land_identified_acres ?? 0} Ac`, sub: "Revenue Map" },
              { label: "Verified Land", val: `${landSummary?.land_verified_acres ?? 0} Ac`, sub: "Ground Truthed" },
              { label: "Acquired Land", val: `${landSummary?.land_acquired_acres ?? 0} Ac`, sub: "Section 19 Declared" },
              { label: "Pending Land", val: `${landSummary?.land_pending_acres ?? 0} Ac`, sub: "Remaining Balance" },
              { label: "Verified Parcels", val: `${landSummary?.parcels_verified_count ?? 0}`, sub: "Khasras Mapped" },
            ].map((st, i) => {
              const isOrange = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`border border-slate-200 rounded-xl p-3 transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div className="text-base font-extrabold text-slate-900">
                    {st.val}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {st.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {st.sub}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#138808] shrink-0" />
            <span>Official cadastral verification and gazette notifications are administered by the CALA authority.</span>
          </div>
        </div>

        {/* Section D: Compensation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#138808]" />
              Compensation Overview
            </h2>
            <span className="text-[11px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {compSummary?.disbursement_percent ?? 0}% Disbursed
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600">Disbursement vs Assessed</span>
              <span className="font-bold text-slate-900">
                ₹{compSummary?.disbursed_cr ?? 0} / ₹{compSummary?.assessed_cr ?? 0} Cr
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#138808] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, compSummary?.disbursement_percent ?? 0)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Assessed Compensation", val: `₹${compSummary?.assessed_cr ?? 0} Cr`, sub: "Valuation Schedule" },
              { label: "Awarded Compensation", val: `₹${compSummary?.awarded_cr ?? 0} Cr`, sub: "Section 23 Awards" },
              { label: "Disbursed Compensation", val: `₹${compSummary?.disbursed_cr ?? 0} Cr`, sub: "PFMS Direct Benefit" },
              { label: "Pending Compensation", val: `₹${compSummary?.pending_cr ?? 0} Cr`, sub: "Escrow & Disputes" },
            ].map((c, i) => {
              const isOrange = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`border border-slate-200 rounded-xl p-3 transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div className="text-base font-extrabold text-slate-900">
                    {c.val}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {c.sub}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Citizen Aadhaar and private beneficiary accounts are masked for agency privacy compliance.</span>
          </div>
        </div>
      </div>

      {/* 5. Two-Column Matrix: Possession & R&R */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section E: Possession Handover */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#138808]" />
              Section 38 Possession Handover
            </h2>
            <span className="text-[11px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {possSummary?.possession_percent ?? 0}% Handed Over
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { val: `${possSummary?.ready_acres ?? 0} Ac`, label: "Ready for Handover" },
              { val: `${possSummary?.pending_acres ?? 0} Ac`, label: "Pending Clearance" },
              { val: `${possSummary?.completed_acres ?? 0} Ac`, label: "Handover Complete" },
            ].map((ps, pIdx) => {
              const isOrange = pIdx % 2 === 0;
              return (
                <div
                  key={pIdx}
                  className={`border border-slate-200 rounded-xl p-3 text-center transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div className="text-lg font-black text-slate-900">
                    {ps.val}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    {ps.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Required Callout */}
          {possSummary?.items && possSummary.items.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Action Required from Agency:
              </div>
              {possSummary.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-950">{it.package}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
                        {it.ready_acres} Acres
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">{it.action_required}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section F: R&R Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Home className="h-4 w-4 text-[#138808]" />
              Rehabilitation & Resettlement (R&R)
            </h2>
            <span className="text-[11px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {randrSummary?.completion_percent ?? 0}% Complete
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600">R&R Settlement Progress</span>
              <span className="font-bold text-slate-900">
                {randrSummary?.completed_cases ?? 0} / {randrSummary?.eligible_families ?? 0} Families
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#138808] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, randrSummary?.completion_percent ?? 0)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Affected Families", val: randrSummary?.affected_families ?? 0 },
              { label: "Eligible Families", val: randrSummary?.eligible_families ?? 0 },
              { label: "Plot Allotments", val: randrSummary?.plot_allotments ?? 0 },
              { label: "Completed Cases", val: randrSummary?.completed_cases ?? 0 },
              { label: "Pending Cases", val: randrSummary?.pending_cases ?? 0 },
              { label: "Completion Rate", val: `${randrSummary?.completion_percent ?? 0}%` },
            ].map((r, i) => {
              const isOrange = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`border border-slate-200 rounded-xl p-3 transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div className="text-base font-extrabold text-slate-900">
                    {r.val}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {r.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#138808] shrink-0" />
            <span>R&R entitlement determination and beneficiary awards are administered by District R&R Officers.</span>
          </div>
        </div>
      </div>

      {/* 6. Section G & H: Project Risk & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section G: Project Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Project Risk Intelligence
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded border uppercase ${
                riskSummary?.risk_level === "CRITICAL"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : riskSummary?.risk_level === "HIGH"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-[#138808] border-emerald-200 font-semibold"
              }`}
            >
              Risk Level: {riskSummary?.risk_level ?? "LOW"}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Major Acquisition Bottlenecks</div>
              <div className="space-y-2">
                {(riskSummary?.major_bottlenecks || ["Forest clearance NOC pending", "Title disputes in Bypass"]).map((b, idx) => {
                  const isOrange = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border border-slate-200 text-xs transition-all duration-300 flex items-start gap-2 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-sm ${
                        isOrange
                          ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                          : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium">{b}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Delayed Statutory Stages</div>
              <div className="flex flex-wrap gap-2">
                {(riskSummary?.delayed_stages || ["Section 19 Declaration", "Joint Boundary Demarcation"]).map((stg, idx) => {
                  const isOrange = idx % 2 === 0;
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1 text-xs rounded-xl border border-slate-200 transition-all duration-300 flex items-center gap-1.5 group cursor-pointer shadow-2xs hover:shadow-sm ${
                        isOrange
                          ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                          : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                      }`}
                    >
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span className="text-slate-800 font-medium">{stg}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section H: Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#138808]" />
              Recent Agency Activity
            </h2>
            <Link href="/reports" className="text-xs text-[#138808] hover:underline font-bold">
              View Audit Logs
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivities.slice(0, 5).map((act, actIdx) => {
              const isOrange = actIdx % 2 === 0;
              return (
                <div
                  key={act.id}
                  className={`p-3 rounded-xl border border-slate-200 transition-all duration-300 flex items-start justify-between gap-2 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-sm ${
                    isOrange
                      ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                      : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {act.action.replace(/_/g, " ")}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {act.entity_name} ({act.actor_name})
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
