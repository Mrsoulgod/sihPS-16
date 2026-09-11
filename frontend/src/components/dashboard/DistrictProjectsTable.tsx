"use client";

import React, { useState, useMemo } from "react";
import { DistrictProjectSummaryItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Building2,
  Filter,
  Search,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface DistrictProjectsTableProps {
  projects?: DistrictProjectSummaryItem[];
}

export function DistrictProjectsTable({ projects = [] }: DistrictProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tehsilFilter, setTehsilFilter] = useState("ALL");

  // Extract unique filter choices
  const stages = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.current_stage))).filter(Boolean);
  }, [projects]);

  const tehsils = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.tehsil_name))).filter(Boolean) as string[];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const pStage = p.current_stage || "";
      const pRisk = p.risk_level || "LOW";
      const pStatus = p.status || "IN_PROGRESS";
      const pTehsil = p.tehsil_name || "";

      if (stageFilter !== "ALL" && pStage !== stageFilter) return false;
      if (riskFilter !== "ALL" && pRisk !== riskFilter) return false;
      if (statusFilter !== "ALL" && pStatus !== statusFilter) return false;
      if (tehsilFilter !== "ALL" && pTehsil !== tehsilFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (p.title || "").toLowerCase();
        const code = (p.project_code || "").toLowerCase();
        const agency = (p.project_agency_name || p.implementing_agency || "").toLowerCase();
        const pending = (p.pending_action || "").toLowerCase();
        return title.includes(q) || code.includes(q) || agency.includes(q) || pending.includes(q);
      }
      return true;
    });
  }, [projects, stageFilter, riskFilter, statusFilter, tehsilFilter, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-700" />
              <span>DISTRICT PROJECTS INVENTORY</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                {projects.length} Total
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory land acquisition pipelines under District/CALA operational purview
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, title, agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase font-mono mr-1">
            <Filter className="h-3 w-3" />
            <span>Filters:</span>
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Stages ({stages.length})</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>

          {/* Tehsil Filter */}
          {tehsils.length > 0 && (
            <select
              value={tehsilFilter}
              onChange={(e) => setTehsilFilter(e.target.value)}
              className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Tehsils ({tehsils.length})</option>
              {tehsils.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_SCRUTINY">Under Scrutiny</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {(stageFilter !== "ALL" ||
            riskFilter !== "ALL" ||
            tehsilFilter !== "ALL" ||
            statusFilter !== "ALL" ||
            searchQuery.trim() !== "") && (
            <button
              type="button"
              onClick={() => {
                setStageFilter("ALL");
                setRiskFilter("ALL");
                setTehsilFilter("ALL");
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">No Projects Found</p>
          <p className="text-xs text-slate-500 mt-0.5">
            No projects matched your active search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
                <th className="py-2.5 px-4">Project & Code</th>
                <th className="py-2.5 px-3">Agency & Tehsil</th>
                <th className="py-2.5 px-3">Stage & Progress</th>
                <th className="py-2.5 px-3">Land (Proposed / Acq)</th>
                <th className="py-2.5 px-3">Compensation</th>
                <th className="py-2.5 px-3">Possession</th>
                <th className="py-2.5 px-3">R&R</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-4">Pending CALA Action</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.map((p, idx) => {
                const projectId = p.project_id || p.id || `proj-${idx}`;
                const agencyName = p.project_agency_name || p.implementing_agency || "Implementing Agency";
                const riskLevel = p.risk_level || "LOW";
                const progressPct = p.progress_percent ?? 0;
                const landAcq = p.land_acquired_acres ?? 0;
                const landProp = p.land_proposed_acres ?? 0;
                const compDisb = p.compensation_disbursed_cr ?? 0;
                const compAssess = p.compensation_assessed_cr ?? 0;
                const possAcres = p.possession_acres ?? 0;
                const possPct = p.possession_percent ?? 0;
                const randrPct = p.randr_completion_percent ?? 0;
                const pendingAction = p.pending_action || (p.compensation_status ? `Compensation: ${p.compensation_status}` : "Review Stage");

                return (
                  <tr key={projectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/projects/${projectId}`}
                        className="font-bold text-slate-900 hover:text-emerald-800 hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{p.project_code}</span>
                        {p.days_delayed && p.days_delayed > 0 ? (
                          <span className="text-red-600 font-semibold flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {p.days_delayed}d Delay
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{agencyName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.tehsil_name ? `Tehsil: ${p.tehsil_name}` : "District Purview"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{p.current_stage}</div>
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-[#138808] h-1.5 rounded-full"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {progressPct}% Complete
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-slate-900">
                        {landAcq} / {landProp} Ac
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {landProp > 0
                          ? `${((landAcq / landProp) * 100).toFixed(0)}% Acquired`
                          : "0%"}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-slate-900">
                        ₹{compDisb} Cr
                      </div>
                      <div className="text-[10px] text-slate-500">
                        of ₹{compAssess} Cr
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-slate-900">
                        {possAcres} Ac
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {possPct}% Taken
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="font-semibold text-slate-900">
                        {randrPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          riskLevel === "CRITICAL"
                            ? "bg-red-100 text-red-800 border border-red-200 font-mono"
                            : riskLevel === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200 font-mono"
                            : riskLevel === "MODERATE"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200 font-mono"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono"
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium text-[11px]">
                        {pendingAction}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/projects/${projectId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Open Project 360"
                      >
                        <span>View</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
