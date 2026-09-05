"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePublicDashboard } from "@/lib/hooks/useDashboard";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  BarChart3,
  Search,
  Building2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Layers,
  Scale,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Shield,
  Compass,
} from "lucide-react";

export default function PublicOverviewPage() {
  const { data: summary, isLoading: isSummaryLoading } = usePublicDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("ALL");

  const { data: projects = [], isLoading: isProjectsLoading } = useProjects({
    search: searchTerm || undefined,
    stage: selectedStage === "ALL" ? undefined : selectedStage,
  });

  const kpis = summary?.kpis;
  const overview = summary?.acquisition_overview;
  const statusBreakdown = summary?.status_breakdown;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold uppercase tracking-wider mb-3">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Public National Overview</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              National Infrastructure Corridor Telemetry
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
              Live consolidated acquisition performance across high-priority national expressways, freight corridors, and rapid transit alignments.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Row 1: High-Level Aggregate Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active National Corridors
            </span>
            <div className="mt-1 font-serif text-3xl font-black text-slate-950">
              {isSummaryLoading ? "—" : kpis?.total_projects || 5}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Under statutory acquisition</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Acquisition Completion
            </span>
            <div className="mt-1 font-serif text-3xl font-black text-[#138808]">
              {isSummaryLoading ? "—" : `${overview?.acquisition_percent || 86.7}%`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {overview?.land_acquired_acres?.toLocaleString() || "1,465"} ac of {overview?.land_proposed_acres?.toLocaleString() || "1,690"} ac
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              PFMS Compensation Paid
            </span>
            <div className="mt-1 font-serif text-3xl font-black text-slate-950">
              ₹{isSummaryLoading ? "—" : kpis?.compensation_disbursed_cr?.toFixed(0) || 1808}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">Cr</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {kpis?.overall_disbursement_percent || 91.5}% of assessed valuation
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Physical Possession Handover
            </span>
            <div className="mt-1 font-serif text-3xl font-black text-slate-950">
              {isSummaryLoading ? "—" : `${overview?.possession_percent || 77.5}%`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {overview?.possession_acres?.toLocaleString() || "1,310"} ac handed to agencies
            </p>
          </div>
        </div>

        {/* Row 2: Pipeline Stage Health Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-950">
                National Acquisition Pipeline Health
              </h3>
              <p className="text-xs text-slate-500">Corridor operational health tracking across status categories</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">On Track</span>
              <div className="text-xl font-bold text-emerald-950 mt-0.5">
                {statusBreakdown?.on_track || 3}
              </div>
              <span className="text-[10px] text-emerald-700">Meeting statutory SLAs</span>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">At Risk</span>
              <div className="text-xl font-bold text-amber-950 mt-0.5">
                {statusBreakdown?.at_risk || 1}
              </div>
              <span className="text-[10px] text-amber-700">Nearing SLA deadline</span>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">Delayed / Overdue</span>
              <div className="text-xl font-bold text-rose-950 mt-0.5">
                {statusBreakdown?.delayed || 1}
              </div>
              <span className="text-[10px] text-rose-700">Requires CALA intervention</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Pipeline</span>
              <div className="text-xl font-bold text-slate-950 mt-0.5">
                {statusBreakdown?.total || 5}
              </div>
              <span className="text-[10px] text-slate-500">Active monitoring</span>
            </div>
          </div>
        </div>

        {/* Row 3: Filterable Corridor Projects List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-950">
                National Corridor Projects
              </h3>
              <p className="text-xs text-slate-500">
                Authoritative public summaries of infrastructure projects monitored under NLAMS
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search project title or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#138808] w-48 sm:w-64"
                />
              </div>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#138808]"
              >
                <option value="ALL">All Stages</option>
                <option value="PROJECT_PROPOSAL">Proposal</option>
                <option value="LAND_IDENTIFICATION">Land Identification</option>
                <option value="LAND_VERIFICATION">Ground Verification</option>
                <option value="NOTIFICATION_SECTION_11">Sec 11 Notification</option>
                <option value="OBJECTIONS_HEARING_SEC_15">Sec 15 Hearings</option>
                <option value="COMPENSATION_ASSESSMENT">Compensation</option>
                <option value="AWARD_ENQUIRY_SEC_23_30">Sec 23/30 Award</option>
                <option value="COMPENSATION_DISBURSEMENT">Disbursement</option>
                <option value="POSSESSION_SEC_38">Possession</option>
                <option value="REHABILITATION_RESETTLEMENT">R&amp;R</option>
                <option value="COMPLETION">Completion</option>
              </select>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isProjectsLoading ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                Loading national infrastructure corridors...
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                No infrastructure projects match the selected criteria.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {project.project_code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {project.current_stage_name || project.current_stage}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif font-bold text-base text-slate-950 leading-snug">
                      {project.title}
                    </h4>

                    {/* Meta */}
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Agency: <strong>{project.implementing_agency}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Location: {project.primary_district_name ? `${project.primary_district_name}, ` : ""}{project.state_name || "Multi-State"}</span>
                      </div>
                    </div>

                    {/* Metrics Bars */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Acquisition:</span>
                          <span className="font-bold text-slate-900">
                            {project.total_land_acquired_acres} / {project.total_land_proposed_acres} Ac ({project.acquisition_progress_percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#138808]"
                            style={{ width: `${Math.min(100, project.acquisition_progress_percent)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Compensation:</span>
                          <span className="font-bold text-slate-900">
                            ₹{project.compensation_disbursed_cr} / ₹{project.compensation_assessed_cr} Cr ({project.disbursement_percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800"
                            style={{ width: `${Math.min(100, project.disbursement_percent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {project.parcels_count || 0} Cadastral Parcels
                    </span>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#138808] hover:underline"
                    >
                      <span>Officer Inspection</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
