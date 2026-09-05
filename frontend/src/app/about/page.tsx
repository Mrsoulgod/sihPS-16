"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Building2,
  Scale,
  Users,
  AlertCircle,
  FileCheck,
  TrendingUp,
  MapPin,
  Lock,
} from "lucide-react";

export default function AboutPage() {
  const STAKEHOLDERS = [
    {
      role: "Central Ministry Officers",
      ministry: "MoRTH, Railways, MoRD",
      desc: "Macro-level statutory oversight, budgetary sanctioning, national corridor pipeline progress tracking, and inter-state alignment monitoring.",
    },
    {
      role: "State Revenue Authorities",
      ministry: "State Revenue & Land Records Depts",
      desc: "State-wide corridor scrutiny, Circle Rate schedule approvals, appellate supervision, and inter-district coordination.",
    },
    {
      role: "District Authorities / CALA",
      ministry: "District Collectors, ADM (LA), SDM",
      desc: "Competent Authority for Land Acquisition. Conducts Section 15 objection hearings, pronounces Section 23/30 awards, and issues Section 38 possession.",
    },
    {
      role: "Project Implementing Agencies",
      ministry: "NHAI, NHSRCL, DFCCIL, Metro Rail",
      desc: "Submits preliminary DPR corridors, finances statutory compensation deposits, tracks right-of-way handover, and coordinates construction readiness.",
    },
    {
      role: "Field Survey Officers",
      ministry: "Tehsildars, Revenue Patwaris, Amin",
      desc: "Physical ground census recording khasra boundaries, standing timber/crops, structures, tube-wells, and field discrepancies via GPS.",
    },
    {
      role: "Project Affected Families (PAFs)",
      ministry: "Landowners, Tenants, Artisans",
      desc: "Statutory beneficiaries entitled to transparent circle-rate valuation, 100% Solatium, direct PFMS electronic bank credit, and formal R&R schemes.",
    },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold uppercase tracking-wider mb-4">
            <span>Institutional Overview</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            About the National Land Acquisition &amp; Management System
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            A unified digital governance platform digitizing the complete statutory lifecycle of land acquisition across India under the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013.
          </p>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            The Core Challenge
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Why Fragmented Land Acquisition Creates Severe Delays
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In national infrastructure development, land acquisition accounts for over 65% of all project implementation delays and cost escalations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Information Asymmetry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Implementing agencies, state revenue boards, and district authorities historically operate across siloed paper registers, causing reconciliation delays between preliminary DPRs and actual khasra numbers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Compensation Discrepancies</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manual computation of market circle rates, solatium (100%), and rural multipliers often triggers litigation, title disputes, and court stay orders that freeze critical highway and rail alignments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Opaque R&amp;R Monitoring</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tracking physical possession handovers alongside social impact assessments and rehabilitation entitlements has historically lacked central telemetry, leaving displaced families waiting for amenities.
            </p>
          </div>
        </div>
      </section>

      {/* The Purpose of NLAMS */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
              Unified Digital Solution
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
              The Purpose &amp; Mission of NLAMS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              NLAMS establishes a single authoritative national source of truth that connects every revenue parcel directly to statutory acquisition stages, financial disbursements, and physical possession.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="flex gap-4 p-5 rounded-lg border border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="h-5 w-5 text-[#138808] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Statutory Lifecycle Machine</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Rigid 12-stage workflow enforcing mandatory gazette notifications (Sec 11), statutory 60-day objection hearings (Sec 15), valuation awards (Sec 23/30), and physical possession (Sec 38).
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-lg border border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="h-5 w-5 text-[#138808] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">PostGIS Cadastral Mapping</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Every parcel boundary is digitally georeferenced with spatial polygon coordinates, enabling instant visual corridor inspection, encroachment checks, and alignment optimization.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-lg border border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="h-5 w-5 text-[#138808] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Direct Benefit Transfer Integration</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Electronic auditing of PFMS disbursement flows ensures compensation is transferred directly to verified bank accounts, eliminating intermediary friction and leakage.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-lg border border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="h-5 w-5 text-[#138808] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Public Transparency with Privacy</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Citizens and civil society gain aggregate corridor insights while individual citizen Aadhaar, bank numbers, and PII are strictly protected under statutory privacy safeguards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#138808]">
            Collaborative Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
            Six Key Stakeholder Groups
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            NLAMS provides tailored views and statutory role permissions for every participant in the acquisition chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {STAKEHOLDERS.map((stk, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-950">{stk.role}</span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  {stk.ministry}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs pt-1">{stk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* National Scale Vision CTA */}
      <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Next Step
            </span>
            <h3 className="font-serif text-2xl font-bold text-white">
              Explore the 12-Stage Acquisition Lifecycle
            </h3>
            <p className="text-xs text-slate-400 max-w-lg">
              Understand how each statutory stage operates from Project Proposal to Corridor Completion.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg bg-[#138808] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
            >
              <span>View How It Works</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
