"use client";

import React from "react";
import { StatePossessionSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  ShieldCheck,
  Layers,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface StatePossessionCardProps {
  possession?: StatePossessionSummary;
}

export function StatePossessionCard({ possession }: StatePossessionCardProps) {
  if (!possession) return null;

  const total = possession.land_requiring_possession_acres ?? 0;
  const completed = possession.possession_completed_acres ?? 0;
  const pending = possession.possession_pending_acres ?? Math.max(0, total - completed);
  const pct = possession.possession_progress_percent ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
              PHYSICAL GROUND TAKEOVER
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
            State Possession Monitoring (Section 38)
          </h3>
        </div>
        <Link
          href="/possession"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
        >
          <span>Possession Tracker</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Demanded Area</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{total.toFixed(1)} Ac</div>
            <span className="text-[10px] text-slate-500">Alignment Corridor</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Handed Over</span>
            <div className="text-lg font-bold text-emerald-900 mt-1">{completed.toFixed(1)} Ac</div>
            <span className="text-[10px] text-emerald-700">{pct.toFixed(1)}% Encumbrance-Free</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700">Pending Handover</span>
            <div className="text-lg font-bold text-amber-900 mt-1">{pending.toFixed(1)} Ac</div>
            <span className="text-[10px] text-amber-700">Forest / R&R Stalls</span>
          </div>
        </div>

        {/* District Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2.5">
            District-Wise Possession Status
          </h4>
          <div className="space-y-2.5">
            {(possession.district_possessions || possession.districts || []).map((dist: any, idx: number) => {
              const dName = dist.district_name || dist.name || `District ${idx + 1}`;
              const acq = dist.acquired_acres ?? dist.acquired ?? 0;
              const prop = dist.proposed_acres ?? dist.proposed ?? 0;
              const possPct = dist.possession_percent ?? (prop > 0 ? (acq / prop) * 100 : 0);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{dName}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">Possession: {Number(acq).toFixed(1)} / {Number(prop).toFixed(1)} Ac</span>
                      <span className="font-bold text-emerald-800">{Number(possPct).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(possPct))}%` }}
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
