"use client";

import React from "react";
import { DashboardKpiSummary } from "@/lib/types/dashboard";
import {
  Building2,
  MapPin,
  CheckCircle2,
  IndianRupee,
  Users,
  Home,
  TrendingUp,
} from "lucide-react";

interface TopKpiCardsProps {
  kpis: DashboardKpiSummary;
}

export function TopKpiCards({ kpis }: TopKpiCardsProps) {
  const affectedFamilies = kpis.affected_families ?? kpis.total_paf_count ?? 0;
  const displacedFamilies = kpis.displaced_families ?? kpis.total_pdf_count ?? 0;
  const avgRandr = kpis.avg_randr_completion_percent ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Projects */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Projects
          </span>
          <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center text-[#138808]">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {kpis.total_projects}
          </span>
          <span className="text-xs font-medium text-slate-500">Major Corridors</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#138808]" />
          <span>Bharatmala & National Pipeline</span>
        </div>
      </div>

      {/* 2. Land Proposed */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Land Proposed
          </span>
          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {kpis.total_land_proposed_acres.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500">Acres</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Sanctioned Alignment Area</span>
          <span className="font-mono text-slate-600 font-medium">Sec 4/11</span>
        </div>
      </div>

      {/* 3. Land Acquired */}
      <div className="bg-white rounded-lg border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-sm hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            Land Acquired
          </span>
          <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center text-[#138808]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-[#138808]">
            {kpis.total_land_acquired_acres.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-600">Acres</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-[#138808]" />
            <span>Acquisition:</span>
          </div>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
            {kpis.overall_acquisition_percent}% of Proposed
          </span>
        </div>
      </div>

      {/* 4. Compensation Assessed */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Compensation Assessed
          </span>
          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            ₹{kpis.compensation_assessed_cr.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500">Cr</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Sec 26-30 Statutory Awards</span>
          <span className="font-mono text-slate-600 font-medium">100% Solatium</span>
        </div>
      </div>

      {/* 5. Compensation Paid */}
      <div className="bg-white rounded-lg border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-sm hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            Compensation Paid
          </span>
          <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center text-[#138808]">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-[#138808]">
            ₹{kpis.compensation_disbursed_cr.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-600">Cr</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">PFMS Direct Benefit</span>
          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
            {kpis.overall_disbursement_percent}% Disbursed
          </span>
        </div>
      </div>

      {/* 6. Affected Families */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Affected Families
          </span>
          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {affectedFamilies.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500">PAFs</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Socio-Economic Surveyed</span>
          <span className="text-emerald-700 font-medium">100% Surveyed</span>
        </div>
      </div>

      {/* 7. Displaced Families */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Displaced Families
          </span>
          <div className="h-8 w-8 rounded bg-amber-50 flex items-center justify-center text-amber-700">
            <Home className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {displacedFamilies.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500">Families</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Resettlement Housing</span>
          <span className="font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded text-[11px]">
            Sec 31 R&R Scheme
          </span>
        </div>
      </div>

      {/* 8. R&R Completion */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            R&R Completion
          </span>
          <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center text-[#138808]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-[#138808]">
            {avgRandr}%
          </span>
          <span className="text-xs font-medium text-slate-500">Model Colony Dev</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#138808] h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, avgRandr)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
