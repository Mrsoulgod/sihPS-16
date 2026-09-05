"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Filter,
  BarChart3,
  Layers,
  FileText,
  Building2,
  Info,
} from "lucide-react";
import { useRiskOverview, useStateAnalytics } from "@/lib/hooks/useAnalytics";

export default function RiskIntelligencePage() {
  const [selectedState, setSelectedState] = useState<string>("");

  const { data: riskOverview, isLoading } = useRiskOverview({
    state_id: selectedState || undefined,
  });
  const { data: states } = useStateAnalytics();

  const dist = riskOverview?.distribution;
  const highRiskProjects = riskOverview?.top_high_risk_projects || [];
  const benchmarks = riskOverview?.factor_benchmarks || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header & Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/analytics"
                  className="text-xs font-semibold text-slate-500 hover:text-teal-700 transition"
                >
                  Analytics
                </Link>
                <span className="text-slate-300">/</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  PREDICTIVE RISK INTELLIGENCE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
                Statutory Risk Intelligence & Decision Support
              </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All India (National)</option>
                  {states?.map((st) => (
                    <option key={st.state_id} value={st.state_id}>
                      {st.state_name}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Risk MIS Report
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* 2. Methodology Alert Box */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold text-sm text-amber-950">
              Prototype Rule-Based Predictive Risk Assessment (0–100 Scale)
            </p>
            <p>
              This engine provides <strong>decision-support risk indicators</strong> by continuously evaluating 5 statutory RFCTLARR operational factors (workflow SLA delays, cadastral parcel disputes, compensation disbursement velocity, Section 15 objections, and R&R settlement lag).
            </p>
            <p className="text-[11px] text-amber-800">
              * Note: These metrics assist competent authorities (CALA / Revenue Officers) and do not constitute automated statutory actions.
            </p>
          </div>
        </div>

        {/* 3. Risk Distribution Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Critical Risk */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm bg-gradient-to-b from-rose-50/40 to-white">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
              <span>Critical Risk</span>
              <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded">75–100</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-900">{dist?.critical_count || 0}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <p className="text-xs text-rose-700 mt-1 font-medium">Immediate CALA intervention required</p>
          </div>

          {/* High Risk */}
          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm bg-gradient-to-b from-amber-50/40 to-white">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider">
              <span>High Risk</span>
              <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded">50–74</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-900">{dist?.high_count || 0}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <p className="text-xs text-amber-700 mt-1 font-medium">Stage SLA or financial delay</p>
          </div>

          {/* Moderate Risk */}
          <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm bg-gradient-to-b from-blue-50/40 to-white">
            <div className="flex items-center justify-between text-xs font-bold text-blue-800 uppercase tracking-wider">
              <span>Moderate Risk</span>
              <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded">25–49</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-900">{dist?.moderate_count || 0}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <p className="text-xs text-blue-700 mt-1 font-medium">Minor backlogs on watch list</p>
          </div>

          {/* Low Risk */}
          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm bg-gradient-to-b from-emerald-50/40 to-white">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span>Low Risk</span>
              <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded">0–24</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-900">{dist?.low_count || 0}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-medium">On track within legal timeline</p>
          </div>

          {/* Total Portfolio */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Total Assessed</span>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{dist?.total_projects || 0}</span>
              <span className="text-xs text-slate-500">Projects</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">100% database coverage</p>
          </div>
        </div>

        {/* 4. 5 Statutory Risk Factor Benchmarks & Weights */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-600" />
              Statutory 5-Factor Risk Evaluation Framework
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configurable weights summing to 100% with transparent contributing operational indicators
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {benchmarks.map((bm) => (
              <div key={bm.factor_id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {bm.factor_id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{bm.weight}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{bm.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{bm.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                  Indicator Weight: {bm.weight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Top High-Risk Projects Leaderboard */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Projects Requiring Priority Statutory Attention
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked list of projects by overall risk score with top drivers and recommended administrative actions
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold text-xs">
                  <th className="px-3 py-2 text-left">Project</th>
                  <th className="px-3 py-2 text-left">Location</th>
                  <th className="px-3 py-2 text-center">Risk Score</th>
                  <th className="px-3 py-2 text-center">Risk Level</th>
                  <th className="px-3 py-2 text-left">Primary Delay Driver</th>
                  <th className="px-3 py-2 text-left">Recommended Attention</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highRiskProjects.map((p) => (
                  <tr key={p.project_id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-3.5">
                      <div className="font-bold text-slate-900">{p.project_code}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{p.title}</div>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-600">
                      {p.district_name ? `${p.district_name}, ` : ""}{p.state_name || "-"}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="text-base font-bold text-slate-900">{p.risk_score}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          p.risk_level === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : p.risk_level === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : p.risk_level === "MODERATE"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-700 max-w-xs">
                      {p.primary_driver}
                    </td>
                    <td className="px-3 py-3.5 text-xs font-medium text-teal-800 max-w-xs bg-teal-50/40 p-2 rounded">
                      {p.recommended_action}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Link
                        href={`/projects/${p.project_id}`}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition"
                      >
                        Inspect 360°
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
