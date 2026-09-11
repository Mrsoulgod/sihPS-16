"use client";

import React from "react";
import { StateRAndRSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Home,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Layers,
} from "lucide-react";

interface StateRAndRCardProps {
  randr?: StateRAndRSummary;
}

export function StateRAndRCard({ randr }: StateRAndRCardProps) {
  if (!randr) return null;

  const total = randr.affected_families ?? 0;
  const eligible = randr.eligible_families ?? 0;
  const allotted = randr.plot_allotments ?? 0;
  const completed = randr.completed_cases ?? 0;
  const pending = randr.pending_cases ?? 0;

  const completionPct = eligible > 0 ? ((completed / eligible) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
              REHABILITATION & RESETTLEMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
            State R&R Welfare Monitoring (Second Schedule)
          </h3>
        </div>
        <Link
          href="/r-and-r"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
        >
          <span>R&R Schemes</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total PAFs</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{total}</div>
            <span className="text-[10px] text-slate-500">Enumerated Families</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700">Eligible PAFs</span>
            <div className="text-lg font-bold text-blue-900 mt-1">{eligible}</div>
            <span className="text-[10px] text-blue-700">Sec 31 Certified</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Settled ({completionPct}%)</span>
            <div className="text-lg font-bold text-emerald-900 mt-1">{completed}</div>
            <span className="text-[10px] text-emerald-700">{allotted} Plots Allotted</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700">Pending Cases</span>
            <div className="text-lg font-bold text-amber-900 mt-1">{pending}</div>
            <span className="text-[10px] text-amber-700">Under Scrutiny</span>
          </div>
        </div>

        {/* District Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2.5">
            District-Wise Rehabilitation Completion
          </h4>
          <div className="space-y-2.5">
            {(randr.district_randr || randr.districts || []).map((dist: any, idx: number) => {
              const dName = dist.district_name || dist.name || `District ${idx + 1}`;
              const settled = dist.settled_families ?? dist.settled ?? 0;
              const eligible = dist.eligible_families ?? dist.eligible ?? 0;
              const compPct = dist.completion_percent ?? (eligible > 0 ? (settled / eligible) * 100 : 0);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{dName}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">Settled: {settled} / {eligible} PAFs</span>
                      <span className="font-bold text-emerald-800">{Number(compPct).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#138808] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(compPct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
