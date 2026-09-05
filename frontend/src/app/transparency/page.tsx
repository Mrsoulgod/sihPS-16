"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePublicDashboard } from "@/lib/hooks/useDashboard";
import {
  Shield,
  FileCheck,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  MapPin,
  ExternalLink,
  Users,
  Compass,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function TransparencyPage() {
  const { data, isLoading } = usePublicDashboard();
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("ALL");

  const kpis = data?.kpis;
  const overview = data?.acquisition_overview;
  const states = data?.state_progress || [];

  const filteredStates =
    selectedStateFilter === "ALL"
      ? states
      : states.filter((s) => s.state_id === selectedStateFilter);

  return (
    <div className="bg-[#F8FAFC] text-slate-900">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>National Public Disclosure Framework</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Public Transparency &amp; Open Governance
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Statutory national land acquisition telemetry published in real time.
              Delivering authoritative public accountability across infrastructure corridors while upholding citizen privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Charter Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-emerald-950 text-white rounded-xl p-6 sm:p-7 shadow-sm border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Lock className="h-4 w-4" />
              <span>Transparency Without Compromising Privacy</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              NLAMS discloses aggregated physical and financial metrics only.
              Under statutory data privacy regulations, <strong>individual citizen Aadhaar numbers, private bank account details, and personal contact info are strictly masked</strong> and never exposed publicly.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-emerald-900/80 px-3.5 py-2 rounded-lg border border-emerald-700/60 text-xs text-emerald-200 font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>DPDP-Aligned Privacy Controls</span>
          </div>
        </div>
      </section>

      {/* Aggregate Transparency Metrics */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            National Summary
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-950 tracking-tight mt-1">
            Authoritative National Disclosures
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated from verified district CALA decrees and PFMS electronic banking scrolls.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Proposed Land
            </span>
            <div className="mt-1 font-serif text-2xl sm:text-3xl font-black text-slate-950">
              {isLoading ? "—" : overview?.land_proposed_acres?.toLocaleString() || "1,690"}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">Acres</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across 5 infrastructure projects</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Acquired Land
            </span>
            <div className="mt-1 font-serif text-2xl sm:text-3xl font-black text-[#138808]">
              {isLoading ? "—" : overview?.land_acquired_acres?.toLocaleString() || "1,465"}{" "}
              <span className="text-xs font-semibold text-[#138808] font-sans">Acres</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {overview?.acquisition_percent || 86.7}% formal acquisition completion
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Compensation Disbursed
            </span>
            <div className="mt-1 font-serif text-2xl sm:text-3xl font-black text-slate-950">
              ₹{isLoading ? "—" : kpis?.compensation_disbursed_cr?.toFixed(1) || "1,808.0"}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">Cr</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {kpis?.overall_disbursement_percent || 91.5}% of assessed ₹{kpis?.compensation_assessed_cr || 1975} Cr
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Physical Possession
            </span>
            <div className="mt-1 font-serif text-2xl sm:text-3xl font-black text-slate-950">
              {isLoading ? "—" : overview?.possession_acres?.toLocaleString() || "1,310"}{" "}
              <span className="text-xs font-semibold text-slate-500 font-sans">Acres</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {overview?.possession_percent || 77.5}% Right of Way handed over
            </span>
          </div>
        </div>
      </section>

      {/* State-Level Public Breakdown */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
                Regional Transparency
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-950 tracking-tight mt-1">
                State-Wise Acquisition Disclosures
              </h2>
            </div>

            {/* Filter by State */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter State:</span>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#138808]"
              >
                <option value="ALL">All Participating States</option>
                {states.map((s) => (
                  <option key={s.state_id} value={s.state_id}>
                    {s.state_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">State / Jurisdiction</th>
                    <th className="px-4 py-3.5">Projects</th>
                    <th className="px-4 py-3.5">Proposed Area</th>
                    <th className="px-4 py-3.5">Acquired Area</th>
                    <th className="px-4 py-3.5">Acquisition %</th>
                    <th className="px-4 py-3.5">Compensation Disbursed</th>
                    <th className="px-4 py-3.5">R&amp;R Progress</th>
                    <th className="px-4 py-3.5 text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStates.map((s) => (
                    <tr key={s.state_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-950 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.state_name}</span>
                      </td>
                      <td className="px-4 py-4">{s.project_count} Corridors</td>
                      <td className="px-4 py-4">{s.land_proposed_acres.toLocaleString()} Acres</td>
                      <td className="px-4 py-4 font-semibold text-emerald-800">
                        {s.land_acquired_acres.toLocaleString()} Acres
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{s.acquisition_percent}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#138808]"
                              style={{ width: `${Math.min(100, s.acquisition_percent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">
                        ₹{s.compensation_disbursed_cr.toFixed(1)} Cr
                      </td>
                      <td className="px-4 py-4 font-bold text-[#138808]">
                        {s.randr_completion_percent}%
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            s.performance_category === "STRONG"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.performance_category === "MODERATE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {s.performance_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* What We Disclose vs What We Protect */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            Information Governance Policy
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-950 tracking-tight mt-1">
            Data Classification &amp; Disclosure Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clearly distinguishing between open public transparency records and protected personal data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Disclosed Open Data */}
          <div className="bg-white p-6 rounded-xl border border-emerald-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-[#138808]" />
              <span>Publicly Disclosed Information</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
                <span>Total corridor acreage required, acquired, and remaining</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
                <span>Statutory 12-stage workflow progress and compliance dates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
                <span>Aggregate financial compensation assessed vs disbursed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
                <span>State and district level comparative benchmark completion rates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808]" />
                <span>Total number of Project Affected Families (PAFs) and R&amp;R milestones</span>
              </li>
            </ul>
          </div>

          {/* Strictly Protected Private Data */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <Lock className="h-5 w-5 text-rose-600" />
              <span>Strictly Protected &amp; Masked Data</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Landowner Aadhaar numbers and biometric records (never exposed)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Individual bank account numbers and IFSC routing details</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Personal phone numbers and sensitive private contact information</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Confidential internal administrative notes and draft court pleadings</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Inter-departmental pre-decisional administrative deliberations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Explore National Overview</h4>
            <p className="text-xs text-slate-400 mt-1">
              View visual corridor progress maps and benchmark performance indicators.
            </p>
          </div>
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 rounded-lg bg-[#138808] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors shrink-0"
          >
            <span>Go to National Overview</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
