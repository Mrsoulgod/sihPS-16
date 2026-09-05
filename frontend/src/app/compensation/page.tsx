"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompensationAssessments } from "@/lib/hooks/useCompensation";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatINR, formatCrores, formatDate, parseNumeric } from "@/lib/utils";
import {
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";

export default function CompensationDirectoryPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const {
    data: assessmentData,
    isLoading,
    error,
  } = useCompensationAssessments({
    project_id: projectId || undefined,
    status: status || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const assessments = assessmentData?.items || [];
  const totalCount = assessmentData?.pagination.total_records || assessments.length;

  const totalAssessedInr = assessments.reduce(
    (sum, a) => sum + parseNumeric(a.total_compensation_inr),
    0
  );
  const approvedCount = assessments.filter((a) => a.is_approved_by_cala || a.status === "APPROVED").length;
  const underReviewCount = assessments.filter((a) => a.status === "UNDER_REVIEW" || a.status === "DRAFT").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Configurable Compensation Assessment
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory component breakdown: Base Land Value + Factors + Asset Valuation + Statutory Additional Amounts + Solatium.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Assessed</span>
            <p className="text-sm font-bold text-primary-700">{formatCrores(totalAssessedInr)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500 block">CALA Approved</span>
            <p className="text-sm font-bold text-green-700">{approvedCount} records</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">Under Review</span>
            <p className="text-sm font-bold text-amber-700">{underReviewCount} records</p>
          </div>
        </div>
      </div>

      {/* Advisory Notice Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-3 text-xs text-blue-900">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Administrative Decision-Support Notice: </span>
          This module calculates compensation using a configurable statutory assessment model with transparent component breakdowns. It is designed to assist Competent Authorities (CALA) and Land Acquisition Officers. Final legally binding determinations are declared under Section 23/30 Awards.
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
            placeholder="Search by Khasra number, assessment ref, or owner..."
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
            <option value="APPROVED">Approved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mb-2" />
            <p>Loading compensation assessment records...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load compensation assessments. Please retry.</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Calculator className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-600">No compensation assessments found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your project or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Assessment Ref</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Parcel / Khasra</th>
                  <th className="py-3 px-4">Beneficiary / Owner</th>
                  <th className="py-3 px-4 text-right">Acquired Area</th>
                  <th className="py-3 px-4 text-right">Assessed Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">CALA Review</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assessments.map((a) => {
                  const isApproved = a.is_approved_by_cala || a.status === "APPROVED";
                  return (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/compensation/${a.id}`)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-primary-800">
                        {a.assessment_reference}
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate text-gray-700 font-medium">
                        {a.project_title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">Khasra {a.khasra_number}</span>
                        <span className="block text-[11px] text-gray-400">
                          {a.village_name}, {a.district_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[160px] truncate text-gray-700">
                        {a.owner_names && a.owner_names.length > 0
                          ? a.owner_names.join(", ")
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {a.acquired_area_sqm ? Number(a.acquired_area_sqm).toLocaleString("en-IN") : "—"} m²
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 font-mono">
                        {formatINR(a.total_compensation_inr)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isApproved
                              ? "bg-green-100 text-green-800"
                              : a.status === "UNDER_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-primary-700 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
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
