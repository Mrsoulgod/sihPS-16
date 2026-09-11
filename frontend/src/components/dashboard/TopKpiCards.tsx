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

  const cards = [
    {
      title: "Total Projects",
      val: kpis.total_projects,
      unit: "Major Corridors",
      sub: "Bharatmala & National Pipeline",
      icon: Building2,
      isAcquisition: false,
    },
    {
      title: "Land Proposed",
      val: kpis.total_land_proposed_acres.toLocaleString(),
      unit: "Acres",
      sub: "Sanctioned Alignment Area (Sec 4/11)",
      icon: MapPin,
      isAcquisition: false,
    },
    {
      title: "Land Acquired",
      val: kpis.total_land_acquired_acres.toLocaleString(),
      unit: "Acres",
      sub: `${kpis.overall_acquisition_percent}% of Proposed`,
      icon: CheckCircle2,
      isAcquisition: true,
    },
    {
      title: "Compensation Assessed",
      val: `₹${kpis.compensation_assessed_cr.toLocaleString()}`,
      unit: "Cr",
      sub: "Sec 26-30 Statutory Awards (100% Solatium)",
      icon: IndianRupee,
      isAcquisition: false,
    },
    {
      title: "Compensation Paid",
      val: `₹${kpis.compensation_disbursed_cr.toLocaleString()}`,
      unit: "Cr",
      sub: `${kpis.overall_disbursement_percent}% Disbursed (PFMS DBT)`,
      icon: IndianRupee,
      isAcquisition: true,
    },
    {
      title: "Affected Families",
      val: affectedFamilies.toLocaleString(),
      unit: "PAFs",
      sub: "Socio-Economic Surveyed (100% Surveyed)",
      icon: Users,
      isAcquisition: false,
    },
    {
      title: "Displaced Families",
      val: displacedFamilies.toLocaleString(),
      unit: "Families",
      sub: "Resettlement Housing (Sec 31 R&R Scheme)",
      icon: Home,
      isAcquisition: false,
    },
    {
      title: "R&R Completion",
      val: `${avgRandr}%`,
      unit: "Model Colony Dev",
      sub: `${avgRandr}% Infrastructure Provisioned`,
      icon: CheckCircle2,
      isAcquisition: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const isOrange = idx % 2 === 0;

        return (
          <div
            key={idx}
            className={`rounded-xl border border-slate-200 p-4 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
              isOrange
                ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {c.title}
              </span>
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 transition-all">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                {c.val}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {c.unit}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{c.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
