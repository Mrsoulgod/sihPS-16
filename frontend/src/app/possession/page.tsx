"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePossessions } from "@/lib/hooks/usePossession";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
} from "lucide-react";

export default function PossessionDirectoryPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const {
    data: possessionData,
    isLoading,
    error,
  } = usePossessions({
    project_id: projectId || undefined,
    status: status || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const possessions = possessionData?.items || [];
  const totalCount = possessionData?.pagination.total_records || possessions.length;

  const takenCount = possessions.filter((p) => p.status === "TAKEN").length;
  const scheduledCount = possessions.filter((p) => p.status === "SCHEDULED" || p.status === "PENDING").length;
  const encumbranceFreeCount = possessions.filter((p) => p.is_encumbrance_free).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Section 38 Statutory Land Possession & Handover
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Physical land possession recording, joint verification, encumbrance clearances, and agency takeover.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Recorded</span>
            <p className="text-sm font-bold text-gray-900">{totalCount} parcels</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500 block">Possession Taken</span>
            <p className="text-sm font-bold text-green-700">{takenCount} parcels</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-500 block">Encumbrance-Free</span>
            <p className="text-sm font-bold text-blue-700">
              {encumbranceFreeCount} / {totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Guidance Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-3 text-xs text-blue-900">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Statutory Protocol Reference: </span>
          <strong>Section 38</strong> is the primary possession pathway requiring compensation disbursement prior to physical takeover. <strong>Section 40 urgency</strong> is treated strictly as an exceptional statutory pathway with mandatory recorded justification, rather than a routine shortcut.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Khasra number, possession ref, or village..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-1 min-w-[200px]">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full py-1.5 px-2 text-xs text-gray-700 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title.length > 35 ? p.title.substring(0, 35) + "..." : p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1 min-w-[150px]">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full py-1.5 px-2 text-xs text-gray-700 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="TAKEN">Possession Taken</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PENDING">Pending Prerequisites</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2" />
            <p>Loading possession records...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load possession records. Please retry.</p>
          </div>
        ) : possessions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-600">No possession records found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your project or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Possession Ref</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Parcel / Khasra</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Statutory Pathway</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Encumbrance</th>
                  <th className="py-3 px-4">Handing Authority</th>
                  <th className="py-3 px-4">Taking Agency</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {possessions.map((p) => {
                  const isTaken = p.status === "TAKEN";
                  const isUrgency = p.possession_type === "SECTION_40_URGENCY_CLAUSE";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/possession/${p.id}`)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-blue-900">
                        {p.possession_reference}
                      </td>
                      <td className="py-3 px-4 max-w-[170px] truncate text-gray-700 font-medium">
                        {p.project_title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">Khasra {p.khasra_number}</span>
                        <span className="block text-[11px] text-gray-400">
                          {p.village_name}, {p.district_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(p.possession_date)}
                      </td>
                      <td className="py-3 px-4">
                        {isUrgency ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Sec 40 (Urgency)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Sec 38 (Regular)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isTaken
                              ? "bg-green-100 text-green-800"
                              : p.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.is_encumbrance_free ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Free
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-medium">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[140px] truncate">
                        {p.handed_over_by_officer_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[140px] truncate">
                        {p.taken_by_officer_name}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-blue-700 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </span>
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
