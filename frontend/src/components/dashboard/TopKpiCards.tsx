"use client";

import React from "react";
import { DashboardKpiSummary } from "@/lib/types/dashboard";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
  Users,
  Home,
  TrendingUp,
} from "lucide-react";

interface TopKpiCardsProps {
  kpis: DashboardKpiSummary;
}

export function TopKpiCards({ kpis }: TopKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Projects */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Projects
          </span>
          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {kpis.total_projects}
          </span>
          <span className="text-xs font-medium text-slate-500">Major Corridors</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Bharatmala & National Pipeline</span>
        </div>
      </div>

      {/* 2. Land Proposed & Acquired */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Land Proposed / Acquired
          </span>
          <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center text-[#138808]">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-[#138808]">
            {kpis.total_land_acquired_acres.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            / {kpis.total_land_proposed_acres.toLocaleString()} Acres
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-[#138808]" />
            <span>Progress:</span>
          </div>
          <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
            {kpis.overall_acquisition_percent}% Acquired
          </span>
        </div>
      </div>

      {/* 3. Physical Possession Handed Over */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Physical Possession
          </span>
          <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-blue-700">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {kpis.total_possession_acres.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">Acres (Sec 38)</span>
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
          <span>Encumbrance-free</span>
          <span className="font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
            {kpis.total_land_proposed_acres > 0
              ? Math.round((kpis.total_possession_acres / kpis.total_land_proposed_acres) * 100)
              : 0}
            % of Proposed
          </span>
        </div>
      </div>

      {/* 4. Compensation Paid / Assessed */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Compensation Paid (DBT)
          </span>
          <div className="h-8 w-8 rounded bg-amber-50 flex items-center justify-center text-amber-700">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            ₹{kpis.compensation_disbursed_cr.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            / ₹{kpis.compensation_assessed_cr.toLocaleString()} Cr
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">PFMS Settlement</span>
          <span className="font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px]">
            {kpis.overall_disbursement_percent}% Disbursed
          </span>
        </div>
      </div>

      {/* 5. Project Affected Families (PAFs) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Affected Families (PAFs)
          </span>
          <div className="h-8 w-8 rounded bg-purple-50 flex items-center justify-center text-purple-700">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {kpis.total_paf_count.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">Surveyed</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Includes <strong className="text-slate-700">{kpis.total_pdf_count}</strong> Displaced Families (PDFs)
        </p>
      </div>

      {/* 6. R&R Progress */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            R&R Completion
          </span>
          <div className="h-8 w-8 rounded bg-teal-50 flex items-center justify-center text-teal-700">
            <Home className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-serif text-teal-900">
            {kpis.avg_randr_completion_percent}%
          </span>
          <span className="text-xs text-slate-500">Avg Colony Dev</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, kpis.avg_randr_completion_percent)}%` }}
          />
        </div>
      </div>

      {/* 7. Statutory Solatium Multiplier Indicator */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            RFCTLARR Statutory Basis
          </span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
            Sec 26-30
          </span>
        </div>
        <div className="mt-2">
          <div className="text-base font-bold text-slate-900">100% Solatium Applied</div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multiplier: 1.25x – 1.50x + 12% statutory interest
          </p>
        </div>
        <div className="mt-2 text-xs text-emerald-800 font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#138808]" />
          <span>Full Legal Compliance</span>
        </div>
      </div>

      {/* 8. National Command Scope */}
      <div className="bg-gradient-to-br from-[#0B2545] to-slate-900 text-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            System Telemetry
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="my-1">
          <div className="text-xs text-slate-300">Active Pipeline</div>
          <div className="text-xl font-bold font-serif text-white">Live Operations</div>
        </div>
        <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/60">
          <span>Database: PostgreSQL 16</span>
          <span className="text-emerald-400 font-medium">Synced</span>
        </div>
      </div>
    </div>
  );
}
