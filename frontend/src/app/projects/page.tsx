"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { useAuth } from "@/lib/hooks/useAuth";
import { RoleCode } from "@/lib/types/auth";
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  Layers,
  AlertCircle,
  Filter,
  FilePlus,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  Edit3,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data: projectList, isLoading, error, refetch } = useProjects({
    search: search || undefined,
    stage: stageFilter || undefined,
    status: statusFilter || undefined,
    state_id: stateFilter || undefined,
    district_id: districtFilter || undefined,
    risk_level: riskFilter || undefined,
  });

  const projects = projectList || [];
  const totalProjects = projects.length;
  const totalProposed = projects.reduce((acc, p) => acc + (p.total_land_proposed_acres || 0), 0);
  const totalAcquired = projects.reduce((acc, p) => acc + (p.total_land_acquired_acres || 0), 0);

  const isAgency = user?.role_id === RoleCode.PROJECT_AGENCY;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {isAgency ? "My Infrastructure Projects" : "Infrastructure & Acquisition Projects"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAgency
              ? `Projects originating from and assigned to ${user?.organization || "Implementing Agency"}`
              : "Centrally monitored land acquisition projects across national infrastructure corridors."}
          </p>
        </div>

        {/* Action Controls & CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Projects</span>
            <p className="text-sm font-extrabold text-white">{totalProjects}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Acquired / Proposed</span>
            <p className="text-sm font-extrabold text-emerald-400">
              {totalAcquired.toLocaleString()} / {totalProposed.toLocaleString()} ac
            </p>
          </div>

          <Link
            href="/projects/new"
            className="px-4 py-2 text-xs font-bold bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <FilePlus className="h-4 w-4" />
            + New Project Proposal
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or project code (e.g. NH-48)..."
              className="w-full pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-end md:self-center">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === "table" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === "grid" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800/80">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_SCRUTINY">Under Scrutiny</option>
            <option value="REWORK_REQUESTED">Rework Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="ACQUISITION_IN_PROGRESS">Acquisition in Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statutory Stages</option>
            <option value="PROJECT_PROPOSAL">Project Proposal</option>
            <option value="INITIAL_SCRUTINY">Initial Scrutiny</option>
            <option value="LAND_IDENTIFICATION">Land Identification</option>
            <option value="LAND_VERIFICATION">Land Verification</option>
            <option value="NOTIFICATION">Notification (Sec 11)</option>
            <option value="OBJECTION_HEARING">Objection Hearing (Sec 15)</option>
            <option value="COMPENSATION_ASSESSMENT">Compensation Assessment</option>
            <option value="AWARD">Award (Sec 23/30)</option>
            <option value="COMPENSATION_DISBURSEMENT">Disbursement</option>
            <option value="POSSESSION">Possession (Sec 38)</option>
            <option value="R_AND_R">R&R Implementation</option>
            <option value="COMPLETION">Completion</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All States</option>
            <option value="IN-RJ">Rajasthan</option>
            <option value="IN-GJ">Gujarat</option>
            <option value="IN-HR">Haryana</option>
            <option value="IN-MP">Madhya Pradesh</option>
          </select>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Districts</option>
            <option value="DST-JAI">Jaipur</option>
            <option value="DST-ALW">Alwar</option>
            <option value="DST-DAU">Dausa</option>
            <option value="DST-AJM">Ajmer</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Display */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-8 text-center text-xs text-rose-300">
          <AlertCircle className="h-6 w-6 mx-auto text-rose-400 mb-2" />
          Failed to load projects. Please try refreshing.
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
          <Building2 className="h-8 w-8 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or stage filters.</p>
        </div>
      ) : viewMode === "table" ? (
        /* Section 3 Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Project Code</th>
                  <th className="p-3.5">Jurisdiction</th>
                  <th className="p-3.5">Current Stage</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Land Required</th>
                  <th className="p-3.5 text-right">Land Acquired</th>
                  <th className="p-3.5 text-right">Compensation</th>
                  <th className="p-3.5 text-right">Possession</th>
                  <th className="p-3.5 text-right">R&R</th>
                  <th className="p-3.5 text-center">Risk</th>
                  <th className="p-3.5">Pending Action</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {projects.map((p) => {
                  const prop = p.total_land_proposed_acres || 0;
                  const acq = p.total_land_acquired_acres || 0;
                  const acqPct = prop > 0 ? Math.round((acq / prop) * 100) : 0;
                  const disb = p.compensation_disbursed_cr || 0;
                  const poss = p.total_possession_acres || 0;
                  const possPct = prop > 0 ? Math.round((poss / prop) * 100) : 0;
                  const rrPct = Math.round(p.randr_completion_percent || 0);
                  const isDraft = p.current_stage === "PROJECT_PROPOSAL";

                  return (
                    <tr key={p.id} className="hover:bg-slate-950/40 transition">
                      <td className="p-3.5 font-bold text-white max-w-[220px]">
                        <Link href={`/projects/${p.id}`} className="hover:text-emerald-400 transition">
                          {p.title}
                        </Link>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{p.project_code}</td>
                      <td className="p-3.5 text-slate-400">
                        {p.primary_district_name || "Jaipur"}, {p.state_name || "Rajasthan"}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {p.current_stage_name || p.current_stage.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                            isDraft
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                          }`}
                        >
                          {isDraft ? "DRAFT" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-200">{prop.toLocaleString()} Ac</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        {acq.toLocaleString()} Ac ({acqPct}%)
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-200">₹{disb.toLocaleString()} Cr</td>
                      <td className="p-3.5 text-right font-medium text-slate-200">{possPct}%</td>
                      <td className="p-3.5 text-right font-medium text-slate-200">{rrPct}%</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            (p.risk_score || 0) >= 70
                              ? "bg-rose-950 text-rose-300 border-rose-800"
                              : (p.risk_score || 0) >= 40
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          }`}
                        >
                          {p.risk_score || 25}/100
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400 max-w-[160px] truncate">
                        {isDraft ? "Submit Proposal" : "Track Acquisition"}
                      </td>
                      <td className="p-3.5 text-center">
                        <Link
                          href={`/projects/${p.id}`}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-700 transition inline-flex items-center gap-1"
                        >
                          {isDraft ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {isDraft ? "Edit" : "360"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const acquired = p.total_land_acquired_acres || 0;
            const required = p.total_land_proposed_acres || 1;
            const pct = Math.min(100, Math.round((acquired / required) * 100));

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm hover:border-slate-700 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.project_code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <h2 className="mt-2 text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {p.title}
                  </h2>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {p.primary_district_name || "Jaipur"}, {p.state_name || "Rajasthan"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Acquisition Progress</span>
                      <span className="font-bold text-emerald-400">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>{acquired.toLocaleString()} ac acquired</span>
                      <span>{required.toLocaleString()} ac total</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Layers className="h-3.5 w-3.5 text-slate-500" />
                    <span>{p.parcels_count || 0} Parcels</span>
                  </div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View Project 360
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
