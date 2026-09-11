"use client";

import React from "react";
import { DashboardKpiSummary } from "@/lib/types/dashboard";
import {
  Building,
  Layers,
  CheckCircle2,
  Clock,
  AlertOctagon,
  CreditCard,
  ShieldCheck,
  Users,
  AlertTriangle,
  Award,
  FileCheck2,
  MessageSquare,
  Home,
  ShieldAlert,
} from "lucide-react";

interface DistrictKpiGridProps {
  kpis: DashboardKpiSummary;
}

export function DistrictKpiGrid({ kpis }: DistrictKpiGridProps) {
  const cards = [
    {
      id: "active_projects",
      title: "Active Projects",
      value: kpis.total_projects,
      unit: "Projects",
      subtitle: "In District Jurisdiction",
      icon: Building,
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      accent: "border-l-blue-600",
      statKey: "total_projects",
    },
    {
      id: "land_proposed",
      title: "Land Proposed",
      value: (kpis.total_land_proposed_acres ?? 0).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      }),
      unit: "Acres",
      subtitle: "Gazette Notification Scope",
      icon: Layers,
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
      accent: "border-l-indigo-600",
      statKey: "total_land_proposed_acres",
    },
    {
      id: "land_acquired",
      title: "Land Acquired",
      value: (kpis.total_land_acquired_acres ?? 0).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      }),
      unit: "Acres",
      subtitle: "Awards Passed & Finalized",
      icon: CheckCircle2,
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
      accent: "border-l-emerald-600",
      statKey: "total_land_acquired_acres",
    },
    {
      id: "land_pending",
      title: "Land Pending",
      value: (kpis.total_land_pending_acres ?? 0).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      }),
      unit: "Acres",
      subtitle: "Active Pipeline Target",
      icon: Clock,
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      accent: "border-l-amber-600",
      statKey: "total_land_pending_acres",
    },
    {
      id: "parcels_verification",
      title: "Parcels Pending Verification",
      value: kpis.parcels_pending_verification ?? 0,
      unit: "Parcels",
      subtitle: "Field Survey & Cadastre",
      icon: FileCheck2,
      badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
      accent: "border-l-purple-600",
      statKey: "parcels_pending_verification",
    },
    {
      id: "objections_pending",
      title: "Objections Pending",
      value: kpis.objections_pending ?? 0,
      unit: "Claims",
      subtitle: "Sec 15 Hearing Schedule",
      icon: MessageSquare,
      badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
      accent: "border-l-rose-600",
      statKey: "objections_pending",
    },
    {
      id: "compensation_pending",
      title: "Compensation Pending",
      value: kpis.compensation_pending_cases ?? 0,
      unit: "Cases",
      subtitle: `₹${(kpis.compensation_assessed_cr - kpis.compensation_disbursed_cr > 0 ? (kpis.compensation_assessed_cr - kpis.compensation_disbursed_cr) : 0).toFixed(1)} Cr Pending`,
      icon: CreditCard,
      badgeColor: "bg-sky-100 text-sky-900 border-sky-200",
      accent: "border-l-sky-600",
      statKey: "compensation_pending_cases",
    },
    {
      id: "awards_pending",
      title: "Awards Pending",
      value: kpis.awards_pending ?? 0,
      unit: "Awards",
      subtitle: "Section 23/30 Declarations",
      icon: Award,
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      accent: "border-l-amber-500",
      statKey: "awards_pending",
    },
    {
      id: "disbursement_pending",
      title: "Disbursement Pending",
      value: kpis.disbursement_pending_cases ?? 0,
      unit: "Batches",
      subtitle: "PFMS Gateways Queued",
      icon: CreditCard,
      badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-200",
      accent: "border-l-cyan-600",
      statKey: "disbursement_pending_cases",
    },
    {
      id: "possession_pending",
      title: "Possession Pending",
      value: kpis.possession_pending_cases ?? 0,
      unit: "Parcels",
      subtitle: "Sec 38 Demarcations",
      icon: ShieldCheck,
      badgeColor: "bg-teal-100 text-teal-900 border-teal-200",
      accent: "border-l-teal-600",
      statKey: "possession_pending_cases",
    },
    {
      id: "affected_families",
      title: "Affected Families",
      value: (kpis.affected_families ?? 0).toLocaleString("en-IN"),
      unit: "PAFs",
      subtitle: "Social Impact Register",
      icon: Users,
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      accent: "border-l-blue-500",
      statKey: "affected_families",
    },
    {
      id: "randr_pending",
      title: "R&R Pending",
      value: kpis.randr_pending_cases ?? 0,
      unit: "Families",
      subtitle: "Second Schedule Entitlements",
      icon: Home,
      badgeColor: "bg-orange-100 text-orange-900 border-orange-200",
      accent: "border-l-orange-500",
      statKey: "randr_pending_cases",
    },
    {
      id: "overdue_tasks",
      title: "Overdue Tasks",
      value: kpis.overdue_tasks ?? 0,
      unit: "Breached",
      subtitle: "SLA Beyond Statutory Limits",
      icon: AlertOctagon,
      badgeColor: "bg-red-100 text-red-900 border-red-200 font-bold",
      accent: "border-l-red-600",
      statKey: "overdue_tasks",
    },
    {
      id: "high_risk_projects",
      title: "High/Critical Risk",
      value: kpis.high_critical_risk_projects ?? kpis.projects_at_risk ?? 0,
      unit: "Projects",
      subtitle: "Requires CALA Intervention",
      icon: ShieldAlert,
      badgeColor: "bg-rose-100 text-rose-900 border-rose-200 font-bold",
      accent: "border-l-rose-600",
      statKey: "high_critical_risk_projects",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
          <span>DISTRICT STATUTORY KPIS</span>
          <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            14 Operational Indicators
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isOrange = idx % 2 === 0;
          return (
            <div
              key={card.id}
              className={`rounded-xl border border-slate-200 p-3 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                isOrange
                  ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                  : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold text-slate-600 truncate">
                  {card.title}
                </span>
                <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase">
                  {card.unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
