"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRandRSchemes } from "@/lib/hooks/useRandR";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatDate } from "@/lib/utils";
import {
  Home,
  Users,
  Search,
  Building2,
  ArrowRight,
  Info,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function RAndRDirectoryPage() {
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [schemeType, setSchemeType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const { data: schemeData, isLoading, error } = useRandRSchemes({
    project_id: projectId || undefined,
    status: status || undefined,
    scheme_type: schemeType || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const schemes = schemeData?.items || [];
  const totalCount = schemeData?.pagination.total_records || schemes.length;

  const totalFamilies = schemes.reduce((acc, s) => acc + (s.total_families_count || 0), 0);
  const eligibleFamilies = schemes.reduce((acc, s) => acc + (s.eligible_families_count || 0), 0);
  const assistedFamilies = schemes.reduce((acc, s) => acc + (s.assisted_families_count || 0), 0);
  const overallProgress = eligibleFamilies > 0 ? Math.round((assistedFamilies / eligibleFamilies) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Rehabilitation & Resettlement (R&R) Schemes
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory administration of R&R schemes, resettlement colonies, entitlement delivery, and affected family assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation to Affected Families */}
        <div className="flex items-center gap-3">
          <Link
            href="/affected-families"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            <span>View All Affected Families (PAFs)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Active Schemes</span>
            <Layers className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-gray-400">Approved frameworks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Project Affected Families</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2">{totalFamilies}</p>
          <span className="text-[11px] text-blue-600 font-medium">{eligibleFamilies} deemed eligible</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Assisted / Resettled</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-700 mt-2">{assistedFamilies}</p>
          <span className="text-[11px] text-green-600 font-medium">{overallProgress}% fulfillment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Statutory Standard</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-emerald-800 mt-2">RFCTLARR 2013</p>
          <span className="text-[11px] text-gray-400">Second Schedule compliant</span>
        </div>
      </div>

      {/* Statutory Guidance Banner */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Rehabilitation & Resettlement Framework: </span>
          Administered pursuant to <strong>Chapter V and the Second Schedule of the RFCTLARR Act, 2013</strong>. Entitlements include homestead plots in model resettlement colonies, mandatory subsistence allowances, one-time resettlement grants, and cattle shed/transportation assistances for displaced and affected families.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by scheme reference, title, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="min-w-[200px]">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <select
            value={schemeType}
            onChange={(e) => setSchemeType(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Scheme Types</option>
            <option value="RESETTLEMENT_COLONY">Resettlement Colony</option>
            <option value="COMPOSITE_ASSISTANCE">Composite Assistance</option>
            <option value="INFRASTRUCTURE_AMENITY">Infrastructure Amenity</option>
            <option value="CASH_COMPOSITE">Cash Composite</option>
          </select>
        </div>

        <div className="min-w-[140px]">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Schemes Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
            <p>Loading Rehabilitation & Resettlement schemes...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-xs text-red-500">
            <p>Failed to load R&R schemes: {(error as any)?.message || "Unknown error"}</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <Home className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No R&R schemes found matching your search criteria.</p>
            <p className="text-gray-400 mt-1">Try clearing your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Scheme Details</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Families Progress</th>
                  <th className="py-3.5 px-4">Sanctioned Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schemes.map((scheme) => {
                  const prog = scheme.progress_percent || 0;
                  const isComplete = scheme.status === "COMPLETED";

                  return (
                    <tr key={scheme.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{scheme.scheme_title}</span>
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-medium mt-0.5">
                          {scheme.scheme_reference}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-gray-800 font-medium">
                          <Building2 className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{scheme.project_title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 block">{scheme.project_code}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {scheme.scheme_type?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-gray-800">
                              {scheme.assisted_families_count} / {scheme.eligible_families_count}
                            </span>
                            <span className="text-gray-500 font-bold">{prog}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prog >= 100 ? "bg-green-600" : prog > 50 ? "bg-emerald-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.min(prog, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">
                            {scheme.total_families_count} total enumerated
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          ₹{Number(scheme.sanctioned_budget_cr).toFixed(2)} Cr
                        </div>
                        <span className="text-[10px] text-gray-500 block">
                          Spent: ₹{Number(scheme.spent_budget_cr || 0).toFixed(2)} Cr
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isComplete
                              ? "bg-green-100 text-green-800"
                              : scheme.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isComplete && <CheckCircle2 className="h-3 w-3" />}
                          {scheme.status?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/r-and-r/${scheme.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                        >
                          <span>Manage Scheme</span>
                          <ArrowRight className="h-3 w-3" />
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
    </div>
  );
}
