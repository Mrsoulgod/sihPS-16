"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRandRSchemeDetail } from "@/lib/hooks/useRandR";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Home,
  Users,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function RAndRSchemeDetailPage() {
  const params = useParams();
  const schemeId = params?.schemeId as string;

  const { data: scheme, isLoading, error } = useRandRSchemeDetail(schemeId);
  const [activeTab, setActiveTab] = useState<"families" | "allotments">("families");

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
        <p>Loading Rehabilitation & Resettlement Scheme...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">R&R Scheme Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          Unable to locate scheme with ID {schemeId}.
        </p>
        <Link
          href="/r-and-r"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Schemes Directory
        </Link>
      </div>
    );
  }

  const kpis = scheme.kpis;
  const families = scheme.families || [];
  const allotments = scheme.allotments || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/r-and-r"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to R&R Schemes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {scheme.scheme_title}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                scheme.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : scheme.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {scheme.status?.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1 font-mono">
            <span className="text-emerald-700 font-bold">{scheme.scheme_reference}</span>
            <span>•</span>
            <span className="text-gray-700 font-sans">{scheme.scheme_type?.replace(/_/g, " ")}</span>
            <span>•</span>
            <span className="text-gray-700 font-sans flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              {scheme.district_name}, {scheme.state_name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${scheme.project_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Building2 className="h-3.5 w-3.5 text-gray-500" />
            <span>Project 360</span>
          </Link>
        </div>
      </div>

      {/* R&R Progress Funnel */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Statutory R&R Progress Funnel
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700">
            {kpis?.completion_percent || 0}% Resettlement Fulfilled
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Enumerated PAFs</span>
            <p className="text-lg font-bold text-gray-900 mt-1">{kpis?.total_affected_families || 0}</p>
            <span className="text-[10px] text-gray-500">100% baseline</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Deemed Eligible</span>
            <p className="text-lg font-bold text-blue-950 mt-1">{kpis?.eligible_families || 0}</p>
            <span className="text-[10px] text-blue-700 font-medium">Sec. 16/31 verified</span>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block">Approved Entitlements</span>
            <p className="text-lg font-bold text-indigo-950 mt-1">{kpis?.approved_families || 0}</p>
            <span className="text-[10px] text-indigo-700 font-medium">CALA sanctioned</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Plots / Units Allotted</span>
            <p className="text-lg font-bold text-emerald-950 mt-1">{kpis?.allocated_families || 0}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Patta handed over</span>
          </div>

          <div className="bg-green-50/70 p-3 rounded-lg border border-green-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-green-600 block">Fully Settled</span>
            <p className="text-lg font-bold text-green-950 mt-1">{kpis?.completed_families || 0}</p>
            <span className="text-[10px] text-green-700 font-medium">Possession vacated</span>
          </div>
        </div>

        {/* Multi-stage Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-4 flex">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${Math.min(kpis?.completion_percent || 0, 100)}%` }}
            title={`Completion: ${kpis?.completion_percent}%`}
          />
        </div>
      </div>

      {/* Two-Column Scheme Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project and Authority Metadata */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span>Scheme Authority & Sanction</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Corridor Project</span>
              <p className="font-semibold text-gray-900">{scheme.project_title}</p>
              <span className="font-mono text-gray-500 text-[10px]">{scheme.project_code}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Sanction Date</span>
                <p className="font-semibold text-gray-800">{formatDate(scheme.approval_date || scheme.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Target Date</span>
                <p className="font-semibold text-gray-800">{formatDate(scheme.target_completion_date) || "Open"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 block text-[11px]">Approving Authority</span>
              <p className="font-semibold text-gray-800">{scheme.approved_by_name || "CALA & Competent Authority"}</p>
            </div>

            {scheme.remarks && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-400 block text-[11px]">Statutory Scope</span>
                <p className="text-gray-600 text-[11px] leading-relaxed mt-0.5">{scheme.remarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial & Entitlement Allocation */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-emerald-600" />
            <span>Financial Sanctions & Delivery Metrics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Sanctioned Budget</span>
              <p className="text-base font-bold text-gray-900 mt-1">
                ₹{Number(scheme.sanctioned_budget_cr).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-gray-400">Statutory R&R outlay</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Disbursed / Utilized</span>
              <p className="text-base font-bold text-emerald-800 mt-1">
                ₹{Number(scheme.spent_budget_cr || 0).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">
                {Number(scheme.sanctioned_budget_cr) > 0
                  ? Math.round((Number(scheme.spent_budget_cr || 0) / Number(scheme.sanctioned_budget_cr)) * 100)
                  : 0}% utilized
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 block">Recorded Allotments</span>
              <p className="text-base font-bold text-blue-900 mt-1">{allotments.length}</p>
              <span className="text-[10px] text-blue-600 font-medium">Plots, units & grants</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-950">
            <p className="font-semibold">Model Colony Infrastructure & Standards:</p>
            <p className="text-[11px] text-emerald-900 mt-1 leading-relaxed">
              Resettlement colony plots include pucca road network, electricity grid electrification, piped drinking water, drainage systems, and community hall provisions in compliance with the Third Schedule of RFCTLARR Act 2013.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for Covered Families and Allotments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab("families")}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "families"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Covered Affected Families ({families.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("allotments")}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "allotments"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Allotments & Entitlements Ledger ({allotments.length})</span>
          </button>
        </div>

        {/* Tab 1: Covered Families Table */}
        {activeTab === "families" && (
          <div className="overflow-x-auto">
            {families.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No affected families enumerated under this scheme yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">PAF Reference & Head</th>
                    <th className="py-3 px-4">Village & Khasra</th>
                    <th className="py-3 px-4">Displacement Category</th>
                    <th className="py-3 px-4">Eligibility Status</th>
                    <th className="py-3 px-4">Rehabilitation Status</th>
                    <th className="py-3 px-4">Allotted Asset</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {families.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{f.head_of_family_name}</div>
                        <span className="font-mono text-emerald-700 text-[11px] font-medium">{f.family_reference_id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-800 font-medium">{f.village_name || "—"}</div>
                        {f.khasra_number && (
                          <span className="text-[10px] text-gray-400 block font-mono">Khasra {f.khasra_number}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-gray-700">
                          {f.displacement_category?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4">
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
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 text-[11px]">
                          {f.allotted_plot_number || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/affected-families/${f.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                        >
                          <span>Review 360°</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Allotments Ledger Table */}
        {activeTab === "allotments" && (
          <div className="overflow-x-auto">
            {allotments.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                <Home className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No plot or grant allotments recorded under this scheme yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Allotment Ref & Type</th>
                    <th className="py-3 px-4">Beneficiary Family</th>
                    <th className="py-3 px-4">Asset / Plot ID</th>
                    <th className="py-3 px-4">Order No. & Date</th>
                    <th className="py-3 px-4">Allocated Value</th>
                    <th className="py-3 px-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allotments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{a.entitlement_category?.replace(/_/g, " ")}</div>
                        <span className="font-mono text-emerald-700 text-[11px] font-medium">{a.allotment_reference}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-medium">{a.head_of_family_name || "—"}</div>
                        <span className="text-[10px] font-mono text-gray-400 block">{a.family_reference_id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 text-[11px]">{a.asset_identifier || "—"}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-gray-700">{a.allotment_order_no || "—"}</div>
                        <span className="text-[10px] text-gray-400 block">{formatDate(a.allotment_date)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 text-[11px]">
                          ₹{Number(a.allocated_value_inr || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            a.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : a.status === "ALLOTTED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
