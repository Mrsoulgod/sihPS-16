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

  const groupA = [
    { title: "1. Total Projects", val: kpis.total_projects, unit: "Interstate Corridors", sub: "Monitored nationally", icon: Building2 },
    { title: "2. Land Proposed", val: kpis.total_land_proposed_acres.toLocaleString(), unit: "Acres", sub: "Section 11 Preliminary alignment", icon: Compass },
    { title: "3. Land Acquired", val: kpis.total_land_acquired_acres.toLocaleString(), unit: `Acres (${acqPercent}%)`, sub: "Section 19 Declared", icon: CheckCircle2 },
    { title: "4. Land Pending", val: pendingLand.toLocaleString(), unit: "Acres", sub: "Under survey / hearing", icon: Clock },
  ];

  const groupB = [
    { title: "5. Compensation Assessed", val: `₹${kpis.compensation_assessed_cr.toFixed(1)}`, unit: "Cr", sub: "Section 26-30 statutory formula", icon: Calculator },
    { title: "6. Compensation Awarded", val: `₹${awardedCr.toFixed(1)}`, unit: "Cr", sub: "Section 23 signed by CALA", icon: Award },
    { title: "7. Compensation Disbursed", val: `₹${kpis.compensation_disbursed_cr.toFixed(1)}`, unit: `Cr (${disbPercent}%)`, sub: "PFMS Direct Benefit Transfer", icon: CreditCard },
  ];

  const groupC = [
    { title: "8. Possession Taken", val: kpis.total_possession_acres.toLocaleString(), unit: `Acres (${possPercent}%)`, sub: "Section 38 clear handover", icon: ShieldCheck },
    { title: "9. Affected Families", val: kpis.affected_families.toLocaleString(), unit: "PAFs", sub: "Rehabilitation census mapped", icon: Users2 },
    { title: "10. Projects At Risk", val: kpis.projects_at_risk ?? 2, unit: "Corridors", sub: "Risk Score ≥ 50 / Critical", icon: Flame },
    { title: "11. Overdue Tasks", val: kpis.overdue_tasks ?? 14, unit: "SLA Breaches", sub: "Requires administrative nudge", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      {/* Group A: Physical Land Corridor KPIs (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#138808]" />
            Corridor Land Acquisition Status (Acres)
          </span>
          <span className="text-[11px] font-semibold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {acqPercent}% Acquired Overall
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {groupA.map((item, idx) => {
            const Icon = item.icon;
            const isOrange = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border border-slate-200 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                  isOrange
                    ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                    : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{item.title}</span>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center transition-all">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-slate-900">{item.val}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.unit}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
              </div>
            );
          })}
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
          {groupB.map((item, idx) => {
            const Icon = item.icon;
            const isOrange = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border border-slate-200 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                  isOrange
                    ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                    : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{item.title}</span>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center transition-all">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-slate-900">{item.val}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.unit}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
              </div>
            );
          })}
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
          {groupC.map((item, idx) => {
            const Icon = item.icon;
            const isOrange = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border border-slate-200 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                  isOrange
                    ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                    : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{item.title}</span>
                  <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center transition-all">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-slate-900">{item.val}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.unit}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
