"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAffectedFamilies, useRandRSchemes } from "@/lib/hooks/useRandR";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  Users,
  Search,
  Building2,
  ArrowRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Home,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AffectedFamiliesDirectoryPage() {
  const [projectId, setProjectId] = useState<string>("");
  const [schemeId, setSchemeId] = useState<string>("");
  const [eligibilityStatus, setEligibilityStatus] = useState<string>("");
  const [rehabilitationStatus, setRehabilitationStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const { data: schemeData } = useRandRSchemes();
  const schemes = schemeData?.items || [];

  const {
    data: familiesData,
    isLoading,
    error,
  } = useAffectedFamilies({
    project_id: projectId || undefined,
    scheme_id: schemeId || undefined,
    eligibility_status: eligibilityStatus || undefined,
    rehabilitation_status: rehabilitationStatus || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const families = familiesData?.items || [];
  const totalCount = familiesData?.pagination.total_records || families.length;

  const approvedCount = families.filter((f) => f.eligibility_status === "APPROVED" || f.eligibility_status === "ELIGIBLE").length;
  const settledCount = families.filter((f) => f.rehabilitation_status === "SETTLED" || f.rehabilitation_status === "PLOT_ALLOTTED").length;
  const grantDisbursedCount = families.filter((f) => f.is_grant_disbursed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Project Affected Families (PAFs) Directory
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory census enumeration, configurable eligibility verification, and entitlement tracking under RFCTLARR Act 2013.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Link to Schemes */}
        <div className="flex items-center gap-3">
          <Link
            href="/r-and-r"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Home className="h-4 w-4 text-emerald-600" />
            <span>View R&R Schemes</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Enumerated Families</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-gray-400">Baseline survey records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Eligible / Approved</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-700 mt-2">{approvedCount}</p>
          <span className="text-[11px] text-green-600 font-medium">CALA verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Plots / Units Allotted</span>
            <Home className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-700 mt-2">{settledCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Rehabilitation in progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Subsistence Grants</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-800 mt-2">{grantDisbursedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">DBT payments released</span>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Statutory Privacy & Data Governance: </span>
          In accordance with NLAMS privacy policies, citizen contact identifiers and personal banking references are masked in administrative views. Fictional demo references (AF-0001 to AF-0018) are utilized for compliance and audit drills.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by PAF reference (e.g. AF-0001), head of family, village, or khasra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="min-w-[180px]">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <select
            value={schemeId}
            onChange={(e) => setSchemeId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All R&R Schemes</option>
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scheme_title}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <select
            value={eligibilityStatus}
            onChange={(e) => setEligibilityStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Eligibility</option>
            <option value="APPROVED">Approved</option>
            <option value="ELIGIBLE">Eligible</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PENDING">Pending</option>
            <option value="DISPUTED">Disputed</option>
            <option value="INELIGIBLE">Ineligible</option>
          </select>
        </div>

        <div className="min-w-[150px]">
          <select
            value={rehabilitationStatus}
            onChange={(e) => setRehabilitationStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Rehab Status</option>
            <option value="SETTLED">Settled</option>
            <option value="PLOT_ALLOTTED">Plot Allotted</option>
            <option value="GRANT_DISBURSED">Grant Disbursed</option>
            <option value="ELIGIBILITY_VERIFIED">Verified</option>
            <option value="ENUMERATED">Enumerated</option>
          </select>
        </div>
      </div>

      {/* Families Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
            <p>Loading Project Affected Families...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-xs text-red-500">
            <p>Failed to load affected families: {(error as any)?.message || "Unknown error"}</p>
          </div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No affected families found matching your criteria.</p>
            <p className="text-gray-400 mt-1">Try resetting the filter options above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">PAF Ref & Head of Family</th>
                  <th className="py-3.5 px-4">Cadastral Location</th>
                  <th className="py-3.5 px-4">Displacement Category</th>
                  <th className="py-3.5 px-4">R&R Scheme</th>
                  <th className="py-3.5 px-4">Eligibility Status</th>
                  <th className="py-3.5 px-4">Rehabilitation Status</th>
                  <th className="py-3.5 px-4">Allotted Asset</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {families.map((f) => {
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{f.head_of_family_name}</div>
                        <span className="font-mono text-emerald-700 font-semibold text-[11px]">
                          {f.family_reference_id}
                        </span>
                        <div className="text-[10px] text-gray-400">
                          {f.social_category} • {f.family_type?.replace(/_/g, " ")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-medium text-gray-800">
                          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                          <span>{f.village_name || "—"}</span>
                        </div>
                        {f.khasra_number && (
                          <span className="font-mono text-[11px] text-blue-700 font-medium block">
                            Khasra {f.khasra_number}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">{f.project_code}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-gray-700 font-medium">
                          {f.displacement_category?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-gray-800 font-medium truncate max-w-[150px]">
                          {f.scheme_title || "—"}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 block">{f.scheme_reference}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            f.eligibility_status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : f.eligibility_status === "ELIGIBLE"
                              ? "bg-blue-100 text-blue-800"
                              : f.eligibility_status === "DISPUTED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {f.eligibility_status}
                        </span>
                        {f.eligibility_category && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {f.eligibility_category.replace(/_/g, " ")}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                            f.rehabilitation_status === "SETTLED"
                              ? "bg-green-100 text-green-800 font-semibold"
                              : f.rehabilitation_status === "PLOT_ALLOTTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {f.rehabilitation_status?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-900 text-[11px]">
                          {f.allotted_plot_number || "—"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/affected-families/${f.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                        >
                          <span>Review 360°</span>
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
