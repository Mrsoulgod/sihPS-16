"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAwards } from "@/lib/hooks/useAwards";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatINR, formatCrores, formatDate, parseNumeric, formatNumber } from "@/lib/utils";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function AwardsDirectoryPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const {
    data: awardsData,
    isLoading,
    error,
  } = useAwards({
    project_id: projectId || undefined,
    status: status || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const awards = awardsData?.items || [];
  const totalCount = awardsData?.pagination.total_records || awards.length;

  const totalAwardedInr = awards.reduce(
    (sum, a) => sum + parseNumeric(a.total_award_amount_inr),
    0
  );
  const issuedCount = awards.filter((a) => a.status === "ISSUED" || a.status === "APPROVED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Section 23/30 Statutory Awards
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Official determination of compensation, parcel groupings, and CALA award declarations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Awards</span>
            <p className="text-sm font-bold text-gray-900">{totalCount} records</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-purple-500 block">Total Value</span>
            <p className="text-sm font-bold text-purple-700">{formatCrores(totalAwardedInr)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500 block">Issued / Approved</span>
            <p className="text-sm font-bold text-green-700">{issuedCount} awards</p>
          </div>
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
            placeholder="Search by Award Number or project..."
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
            <option value="ISSUED">Issued</option>
            <option value="APPROVED">Approved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mb-2" />
            <p>Loading statutory awards directory...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load awards. Please retry.</p>
          </div>
        ) : awards.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-600">No statutory awards found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your project or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Award Number</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Award Date</th>
                  <th className="py-3 px-4 text-center">Parcels Covered</th>
                  <th className="py-3 px-4 text-right">Area (Acres)</th>
                  <th className="py-3 px-4 text-right">Total Award Amount</th>
                  <th className="py-3 px-4">CALA Authority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Demo e-Sign</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {awards.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/awards/${a.id}`)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-900">
                      {a.award_number}
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-gray-700 font-medium">
                      {a.project_title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(a.award_date)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-gray-800">
                      {a.total_parcels_count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {a.total_area_acres ? `${formatNumber(a.total_area_acres, 2)} ac` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatINR(a.total_award_amount_inr)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {a.cala_user_name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.status === "ISSUED"
                            ? "bg-green-100 text-green-800"
                            : a.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : a.status === "UNDER_REVIEW"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {a.has_demo_esign ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Stamped
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-purple-700 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
