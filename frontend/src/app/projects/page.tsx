"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  Layers,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("");

  const { data: projectList, isLoading, error } = useProjects({
    search: search || undefined,
    stage: stageFilter || undefined,
  });

  const projects = projectList || [];
  const totalProjects = projects.length;
  const totalProposed = projects.reduce((acc, p) => acc + (p.total_land_proposed_acres || 0), 0);
  const totalAcquired = projects.reduce((acc, p) => acc + (p.total_land_acquired_acres || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-700" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Infrastructure & Acquisition Projects
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Centrally monitored land acquisition projects across national infrastructure corridors.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Projects</span>
            <p className="text-sm font-bold text-gray-900">{totalProjects}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400">Acquired / Proposed</span>
            <p className="text-sm font-bold text-gray-900">
              {totalAcquired.toLocaleString()} / {totalProposed.toLocaleString()} ac
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name or code (e.g. NH-48)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
            <option value="COMPENSATION_DISBURSEMENT">Compensation Disbursement</option>
            <option value="POSSESSION">Possession (Sec 38)</option>
            <option value="R_AND_R">R&R Implementation</option>
            <option value="COMPLETION">Completion</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <AlertCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
          Failed to load projects. Please try refreshing.
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Building2 className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-semibold text-gray-800">No Projects Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search or stage filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const acquired = p.total_land_acquired_acres || 0;
            const required = p.total_land_proposed_acres || 1;
            const pct = Math.min(100, Math.round((acquired / required) * 100));

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {p.project_code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>

                  <h2 className="mt-2 text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {p.title}
                  </h2>

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {p.state_name || "National"}
                    </span>
                    {p.current_stage_name && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {p.current_stage_name}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Acquisition Progress</span>
                      <span className="font-bold text-gray-900">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                      <span>{acquired.toLocaleString()} ac acquired</span>
                      <span>{required.toLocaleString()} ac total</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Layers className="h-3 w-3 text-gray-400" />
                    <span>{p.parcels_count || 0} Cadastral Parcels</span>
                  </div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                  >
                    View Project
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
