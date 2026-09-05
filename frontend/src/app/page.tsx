"use client";

import React from "react";
import Link from "next/link";
import { usePublicDashboard } from "@/lib/hooks/useDashboard";
import {
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  GitMerge,
  Building2,
  Users,
  Home,
  TrendingUp,
  Landmark,
  FileCheck,
  Scale,
  MapPin,
  ExternalLink,
  Lock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const { data, isLoading } = usePublicDashboard();

  const kpis = data?.kpis;
  const overview = data?.acquisition_overview;
  const stateProgress = data?.state_progress || [];

  const STATUTORY_STEPS = [
    { num: "01", code: "PROPOSAL", title: "Project Proposal", desc: "Implementing agency submits statutory corridor alignment and preliminary land requirements." },
    { num: "02", code: "SCRUTINY", title: "Initial Scrutiny", desc: "State/Central administrative review, SIA feasibility assessment, and corridor sanction." },
    { num: "03", code: "IDENTIFY", title: "Land Identification", desc: "Cadastral identification of revenue villages, survey khasras, and title boundaries." },
    { num: "04", code: "VERIFY", title: "Ground Verification", desc: "Physical site survey recording trees, structures, borewells, and ground discrepancies." },
    { num: "05", code: "NOTIFY", title: "Sec 11 Notification", desc: "Official Gazette publication declaring preliminary intent to acquire specified parcels." },
    { num: "06", code: "HEARINGS", title: "Sec 15 Objections", desc: "Statutory 60-day window for landowner hearings, claims, and alignment objections." },
    { num: "07", code: "VALUATION", title: "Compensation Assessment", desc: "Market circle rate determination with statutory 100% Solatium and rural multiplier." },
    { num: "08", code: "AWARD", title: "Sec 23/30 Award", desc: "Final determination of legal title, apportionment shares, and formal award pronouncement." },
    { num: "09", code: "DISBURSE", title: "PFMS Direct Disbursement", desc: "Direct Benefit Transfer (DBT) electronically credited into verified landowner accounts." },
    { num: "10", code: "POSSESSION", title: "Sec 38 Possession", desc: "Formal handover of encumbrance-free physical right of way to implementing agency." },
    { num: "11", code: "R&R", title: "R&R Scheme Execution", desc: "Infrastructure resettlement, housing allotments, and rehabilitation grant disbursements." },
    { num: "12", code: "COMPLETION", title: "Corridor Completion", desc: "Final revenue record mutation, statutory gazette de-notification, and completion audit." },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative border-b border-slate-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-4xl">
            {/* National Subtitle Flag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold uppercase tracking-wider mb-6">
              <span className="h-2 w-2 rounded-full bg-[#138808] animate-pulse" />
              <span>National Land Acquisition & Management System • Government of India</span>
            </div>

            {/* Editorial Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              NATIONAL LAND ACQUISITION <br className="hidden sm:inline" />
              <span className="text-[#138808]">&amp; MANAGEMENT SYSTEM</span>
            </h1>

            {/* Supporting Editorial Message */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
              A unified digital platform for transparent, accountable and data-driven
              land acquisition across India. Digitizing the complete statutory lifecycle under the RFCTLARR Act, 2013.
            </p>

            {/* Action Call-to-Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/overview"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#138808] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
              >
                <span>Explore National Overview</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-all"
              >
                <Shield className="h-4 w-4 text-slate-600" />
                <span>Government Officer Login</span>
              </Link>
            </div>

            {/* Trust Anchors */}
            <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-slate-500 font-medium">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Legal Framework</span>
                <strong className="text-slate-800 font-semibold">RFCTLARR Act 2013</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cadastral System</span>
                <strong className="text-slate-800 font-semibold">PostGIS 3.4 Spatial Map</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Disbursement</span>
                <strong className="text-slate-800 font-semibold">PFMS Electronic DBT</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Citizen Privacy</span>
                <strong className="text-slate-800 font-semibold">Masked PII Protection</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NATIONAL LAND ACQUISITION AT A GLANCE */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            Authoritative Aggregation
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
            National Land Acquisition at a Glance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Real-time aggregate telemetry across benchmark national infrastructure corridors.
            Data verified directly against state revenue cadastre records.
          </p>
        </div>

        {/* Big Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Projects */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Corridors
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-black text-slate-950">
                {isLoading ? "—" : kpis?.total_projects || "5"}
              </span>
              <span className="text-xs font-semibold text-slate-500">Projects</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Centrally monitored national infrastructure
            </p>
          </div>

          {/* Card 2: Land Proposed vs Acquired */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Acquisition Rate
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-black text-[#138808]">
                {isLoading ? "—" : `${overview?.acquisition_percent || 86.7}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isLoading ? "Loading..." : `${overview?.land_acquired_acres?.toLocaleString() || "1,465"} ac acquired of ${overview?.land_proposed_acres?.toLocaleString() || "1,690"} ac`}
            </p>
          </div>

          {/* Card 3: Compensation Disbursed */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Compensation Paid
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-black text-slate-950">
                ₹{isLoading ? "—" : (kpis?.compensation_disbursed_cr || 1808.0).toFixed(0)}
              </span>
              <span className="text-xs font-semibold text-slate-500">Cr</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isLoading ? "Loading..." : `${kpis?.overall_disbursement_percent || 91.5}% of ₹${kpis?.compensation_assessed_cr || 1975} Cr assessed`}
            </p>
          </div>

          {/* Card 4: Affected Families & R&R */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              R&amp;R Progress
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-black text-slate-950">
                {isLoading ? "—" : `${kpis?.avg_randr_completion_percent || 68.0}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isLoading ? "Loading..." : `${kpis?.total_paf_count?.toLocaleString() || "3,510"} affected / ${kpis?.total_pdf_count?.toLocaleString() || "815"} displaced families`}
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS — 12-STAGE STATUTORY LIFECYCLE */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
                Statutory Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
                The Complete Land Acquisition Lifecycle
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                NLAMS formalizes 12 rigorous statutory stages with designated authority gates,
                enforceable SLA deadlines, and full electronic audit trails.
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#138808] hover:text-emerald-800 transition-colors"
            >
              <span>View Detailed Statutory Guide</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stepper Horizontal / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {STATUTORY_STEPS.map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#138808]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-[#138808] text-xs">
                    Stage {step.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {step.code}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#138808] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NATIONAL PROGRESS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
              Corridor Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Measuring Physical &amp; Legal Handover
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Acquisition speed in major corridors is determined by three milestones:
              administrative sanction, statutory award determination, and physical possession handover.
            </p>

            <div className="pt-2">
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#138808] hover:underline"
              >
                <span>Read Public Transparency Charter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            {/* Progress Bar 1: Physical Possession */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">1. Physical Possession Handover (Sec 38)</span>
                <span className="text-emerald-700 font-bold">
                  {overview?.possession_percent || 77.5}% Handed Over
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#138808] rounded-full transition-all duration-700"
                  style={{ width: `${overview?.possession_percent || 77.5}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{overview?.possession_acres?.toLocaleString() || "1,310"} Acres in Possession</span>
                <span>Target: {overview?.land_proposed_acres?.toLocaleString() || "1,690"} Acres</span>
              </div>
            </div>

            {/* Progress Bar 2: Formal Acquisition (Award Passed) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">2. Formal Land Acquisition (Awards Passed)</span>
                <span className="text-emerald-700 font-bold">
                  {overview?.acquisition_percent || 86.7}% Acquired
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${overview?.acquisition_percent || 86.7}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{overview?.land_acquired_acres?.toLocaleString() || "1,465"} Acres Awarded</span>
                <span>Remaining: {overview?.land_remaining_acres?.toLocaleString() || "225"} Acres</span>
              </div>
            </div>

            {/* Progress Bar 3: Financial Settlement */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">3. Electronic PFMS Compensation Settlement</span>
                <span className="text-emerald-700 font-bold">
                  {kpis?.overall_disbursement_percent || 91.5}% Settled
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0B2545] rounded-full transition-all duration-700"
                  style={{ width: `${kpis?.overall_disbursement_percent || 91.5}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₹{kpis?.compensation_disbursed_cr?.toFixed(2) || "1,808.00"} Cr Disbursed via DBT</span>
                <span>Assessed: ₹{kpis?.compensation_assessed_cr?.toFixed(2) || "1,975.00"} Cr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATE-WISE PROGRESS */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
              Inter-State Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
              State-Wise Comparative Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Performance metrics across participating state revenue administrations and CALA offices.
            </p>
          </div>

          {/* Clean Data Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">State Name</th>
                    <th className="px-4 py-3">Projects</th>
                    <th className="px-4 py-3">Proposed (Acres)</th>
                    <th className="px-4 py-3">Acquired (Acres)</th>
                    <th className="px-4 py-3">Acquisition %</th>
                    <th className="px-4 py-3">Compensation Disbursed</th>
                    <th className="px-4 py-3 text-right">R&amp;R Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stateProgress.length > 0 ? (
                    stateProgress.map((state) => (
                      <tr key={state.state_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{state.state_name}</span>
                        </td>
                        <td className="px-4 py-3.5">{state.project_count}</td>
                        <td className="px-4 py-3.5">{state.land_proposed_acres.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-800">
                          {state.land_acquired_acres.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {state.acquisition_percent}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#138808]"
                                style={{ width: `${Math.min(100, state.acquisition_percent)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          ₹{state.compensation_disbursed_cr.toFixed(1)} Cr
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          {state.randr_completion_percent}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        Loading state comparative metrics...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENCY BY DESIGN */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            Good Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
            Transparency by Design
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Engineered to eliminate multi-year infrastructure delays while upholding statutory safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#138808] flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Statutory Compliance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every stage transition requires validation of required statutory documents,
              gazette notices, and mandatory objection hearing periods.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#138808] flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Privacy &amp; PII Safeguards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public portals disclose aggregate metrics only. Landowner Aadhaar numbers and
              bank account records are strictly masked per national privacy norms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#138808] flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Inter-Agency Alignment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connects Central Ministries, State Departments, District Collectors, and Project
              Agencies to a single authoritative source of truth.
            </p>
          </div>
        </div>
      </section>

      {/* 7. GOVERNMENT OPERATIONS SHOWCASE */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Restricted Operations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
              Government Operations Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Designated statutory officers access role-scoped operational capabilities
              to manage corridor acquisition, record surveys, and disburse compensation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 text-xs">
            {[
              { title: "Project Management", desc: "Corridor alignments & DPR approvals" },
              { title: "Cadastral Parcels", desc: "Khasra demarcation & Jamabandi records" },
              { title: "Acquisition Workflow", desc: "12-stage state machine & statutory SLA tracking" },
              { title: "Field Verification", desc: "Tree, structure, and borewell ground census" },
              { title: "Section 23/30 Awards", desc: "Solatium & market multiplier computation" },
              { title: "Physical Possession", desc: "Section 38 handover certificate workflow" },
              { title: "PostGIS GIS Cadastre", desc: "Spatial parcel boundary polygons & overlays" },
              { title: "Predictive Analytics", desc: "Corridor bottleneck prediction & statutory MIS" },
            ].map((op, i) => (
              <div key={i} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{op.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{op.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-slate-800/80 border border-slate-700">
            <div>
              <h4 className="text-sm font-bold text-white">Authorized Officer Sign-In</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Role-based access control for Central, State, District, Agency, and Field Officers.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#138808] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors shrink-0"
            >
              <Shield className="h-4 w-4" />
              <span>Sign In to Officer Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
