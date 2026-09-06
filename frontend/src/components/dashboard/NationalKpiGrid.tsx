"use client";

import React from "react";
import { DashboardKpiSummary } from "@/lib/types/dashboard";
import {
  Building2,
  Compass,
  CheckCircle2,
  Clock,
  Calculator,
  Award,
  CreditCard,
  ShieldCheck,
  Users2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
} from "lucide-react";

interface NationalKpiGridProps {
  kpis: DashboardKpiSummary;
}

export function NationalKpiGrid({ kpis }: NationalKpiGridProps) {
  const pendingLand = kpis.total_land_pending_acres ?? Math.max(0, kpis.total_land_proposed_acres - kpis.total_land_acquired_acres);
  const awardedCr = kpis.compensation_awarded_cr ?? (kpis.compensation_assessed_cr * 0.95);
  const acqPercent = kpis.total_land_proposed_acres > 0 
    ? ((kpis.total_land_acquired_acres / kpis.total_land_proposed_acres) * 100).toFixed(1)
    : "0.0";
  const disbPercent = kpis.compensation_assessed_cr > 0
    ? ((kpis.compensation_disbursed_cr / kpis.compensation_assessed_cr) * 100).toFixed(1)
    : "0.0";
  const possPercent = kpis.total_land_proposed_acres > 0
    ? ((kpis.total_possession_acres / kpis.total_land_proposed_acres) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-4">
      {/* 4 Thematic Groups */}
      
      {/* Group A: Physical Land Corridor KPIs (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-emerald-700" />
            Corridor Land Acquisition Status (Acres)
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {acqPercent}% Acquired Overall
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Total Projects */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">1. Total Projects</span>
              <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">{kpis.total_projects}</span>
              <span className="text-[11px] font-medium text-slate-500">Interstate Corridors</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Monitored nationally</p>
          </div>

          {/* 2. Land Proposed */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">2. Land Proposed</span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">{kpis.total_land_proposed_acres.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-slate-500">Acres</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Section 11 Preliminary alignment</p>
          </div>

          {/* 3. Land Acquired */}
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">3. Land Acquired</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-emerald-950">{kpis.total_land_acquired_acres.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-emerald-700">Acres ({acqPercent}%)</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Section 19 Declared</p>
          </div>

          {/* 4. Land Pending */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">4. Land Pending</span>
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-amber-950">{pendingLand.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-amber-700">Acres</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Under survey / hearing</p>
          </div>
        </div>
      </div>

      {/* Group B: Financial Valuation & DBT Disbursements (3 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-blue-700" />
            Financial Compensation & PFMS Direct Benefit Transfer
          </span>
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {disbPercent}% Disbursed to Citizens
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 5. Compensation Assessed */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">5. Compensation Assessed</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calculator className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">₹{kpis.compensation_assessed_cr.toFixed(1)}</span>
              <span className="text-[11px] font-medium text-slate-500">Cr</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Section 26-30 statutory formula</p>
          </div>

          {/* 6. Compensation Awarded */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">6. Compensation Awarded</span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">₹{awardedCr.toFixed(1)}</span>
              <span className="text-[11px] font-medium text-slate-500">Cr</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Section 23 signed by CALA</p>
          </div>

          {/* 7. Compensation Disbursed */}
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">7. Compensation Disbursed</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-emerald-950">₹{kpis.compensation_disbursed_cr.toFixed(1)}</span>
              <span className="text-[11px] font-bold text-emerald-700">Cr ({disbPercent}%)</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">PFMS Direct Benefit Transfer</p>
          </div>
        </div>
      </div>

      {/* Group C: Possession, R&R & Risk Governance (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
            Possession Handover, Social R&R & Risk Governance
          </span>
          <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {possPercent}% Corridor Handed Over
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 8. Possession Taken */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">8. Possession Taken</span>
              <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">{kpis.total_possession_acres.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-slate-500">Acres ({possPercent}%)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Section 38 clear handover</p>
          </div>

          {/* 9. Affected Families */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">9. Affected Families</span>
              <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-slate-900">{kpis.affected_families.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-slate-500">PAFs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Rehabilitation census mapped</p>
          </div>

          {/* 10. Projects At Risk */}
          <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-900">10. Projects At Risk</span>
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-rose-950">{kpis.projects_at_risk ?? 2}</span>
              <span className="text-[11px] font-bold text-rose-700">Corridors</span>
            </div>
            <p className="text-[11px] text-rose-700 mt-1">Risk Score $\ge 50$ / Critical</p>
          </div>

          {/* 11. Overdue Tasks */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">11. Overdue Tasks</span>
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-amber-950">{kpis.overdue_tasks ?? 14}</span>
              <span className="text-[11px] font-bold text-amber-700">SLA Breaches</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Requires administrative nudge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
