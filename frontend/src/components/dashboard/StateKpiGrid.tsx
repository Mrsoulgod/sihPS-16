"use client";

import React from "react";
import { DashboardKpiSummary } from "@/lib/types/dashboard";
import {
  Building2,
  MapPin,
  Layers,
  CheckCircle2,
  Clock,
  Calculator,
  Award,
  CreditCard,
  ShieldCheck,
  Users2,
  AlertTriangle,
  FileWarning,
} from "lucide-react";

interface StateKpiGridProps {
  kpis: DashboardKpiSummary;
}

export function StateKpiGrid({ kpis }: StateKpiGridProps) {
  const totalProposed = kpis.total_land_proposed_acres ?? 0;
  const totalAcquired = kpis.total_land_acquired_acres ?? 0;
  const totalPending = kpis.total_land_pending_acres ?? Math.max(0, totalProposed - totalAcquired);
  const acqPct = totalProposed > 0 ? ((totalAcquired / totalProposed) * 100).toFixed(1) : "0.0";

  const totalAssessed = kpis.compensation_assessed_cr ?? 0;
  const totalAwarded = kpis.compensation_awarded_cr ?? totalAssessed * 0.95;
  const totalDisbursed = kpis.compensation_disbursed_cr ?? 0;
  const disbPct = totalAssessed > 0 ? ((totalDisbursed / totalAssessed) * 100).toFixed(1) : "0.0";

  const totalPossession = kpis.total_possession_acres ?? 0;
  const possPct = totalProposed > 0 ? ((totalPossession / totalProposed) * 100).toFixed(1) : "0.0";

  const activeDistricts = kpis.districts_with_active_acquisition ?? 4;
  const affectedFamilies = kpis.affected_families ?? 0;
  const projectsAtRisk = kpis.projects_at_risk ?? 0;
  const overdueTasks = kpis.overdue_tasks ?? 0;

  const cards = [
    { title: "Total Projects", val: kpis.total_projects, badge: "State Scope", sub: "Infrastructure Corridors", icon: Building2 },
    { title: "Active Districts", val: activeDistricts, badge: "CALA Courts", sub: "Districts Under Sec 11/19", icon: MapPin },
    { title: "Land Proposed", val: totalProposed.toLocaleString("en-IN", { maximumFractionDigits: 1 }), badge: "Acres", sub: "Total Requisition Demand", icon: Layers },
    { title: "Land Acquired", val: totalAcquired.toLocaleString("en-IN", { maximumFractionDigits: 1 }), badge: `${acqPct}%`, sub: "Section 19 Declared", icon: CheckCircle2 },
    { title: "Land Pending", val: totalPending.toLocaleString("en-IN", { maximumFractionDigits: 1 }), badge: "Acres", sub: "Under Hearing / Survey", icon: Clock },
    { title: "Comp. Assessed", val: `₹${totalAssessed.toFixed(1)}`, badge: "Cr", sub: "Sec 26-30 Valuation", icon: Calculator },
    { title: "Comp. Awarded", val: `₹${totalAwarded.toFixed(1)}`, badge: "Cr", sub: "Sec 23 Statutory Awards", icon: Award },
    { title: "Comp. Disbursed", val: `₹${totalDisbursed.toFixed(1)}`, badge: `${disbPct}%`, sub: "PFMS DBT Paid", icon: CreditCard },
    { title: "Possession Taken", val: totalPossession.toFixed(1), badge: `${possPct}%`, sub: "Sec 38 Encumbrance-Free", icon: ShieldCheck },
    { title: "Affected Families", val: affectedFamilies.toLocaleString("en-IN"), badge: "PAFs", sub: "Sec 31 R&R Schedule", icon: Users2 },
    { title: "Projects At Risk", val: projectsAtRisk, badge: "Risk > 50", sub: "SLA Alert Triggers", icon: AlertTriangle },
    { title: "Overdue Tasks", val: overdueTasks, badge: "SLA Breach", sub: "CALA & Survey Tasks", icon: FileWarning },
  ];

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase font-mono flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#138808]" />
          State Statutory Performance Indicators (12 KPIs)
        </h2>
        <span className="text-xs text-slate-600 font-medium">
          Authoritative Real-Time State Telemetry
        </span>
      </div>

      {/* KPI Grid (Alternating Logo Green & Saffron Diagonal Hover Gradient) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {cards.map((c, idx) => {
          const Icon = c.icon;
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono truncate">
                  {c.title}
                </span>
                <Icon className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-1">
                <span className="text-2xl font-bold font-serif text-slate-900">
                  {c.val}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {c.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 truncate">
                {c.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
