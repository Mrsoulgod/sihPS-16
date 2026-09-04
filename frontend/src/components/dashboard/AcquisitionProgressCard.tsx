"use client";

import React from "react";
import { AcquisitionOverview } from "@/lib/types/dashboard";
import { CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck } from "lucide-react";

interface AcquisitionProgressCardProps {
  data: AcquisitionOverview;
}

export function AcquisitionProgressCard({ data }: AcquisitionProgressCardProps) {
  const acqPct = Math.min(100, Math.max(0, data.acquisition_percent));
  const possPct = Math.min(100, Math.max(0, data.possession_percent));
  const remainingPct = Math.max(0, 100 - acqPct);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#138808]" />
            National Land Acquisition Progress Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastral boundary acquisition & statutory physical possession tracking across all sanctioned packages
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-2xl font-black font-serif text-[#138808]">
            {acqPct}%
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Acquired
          </span>
        </div>
      </div>

      {/* Primary Stacked Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          <span>Acquisition & Possession Corridor Split</span>
          <span className="text-slate-600 font-mono text-xs">
            Acquired: <strong className="text-[#138808]">{data.land_acquired_acres.toLocaleString()} Ac</strong> / Proposed: {data.land_proposed_acres.toLocaleString()} Ac
          </span>
        </div>
        
        {/* Multi-tier progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex shadow-inner p-0.5 border border-slate-200">
          {/* Physical Possession (Deep Green) */}
          <div
            className="bg-[#138808] h-full rounded-l-full transition-all duration-700 relative group"
            style={{ width: `${(data.possession_acres / data.land_proposed_acres) * 100}%` }}
            title={`Physical Possession: ${data.possession_acres} Acres (${possPct}%)`}
          />
          {/* Acquired but Pending Final Panchnama Handover (Emerald 400) */}
          <div
            className="bg-emerald-400 h-full transition-all duration-700 relative group"
            style={{
              width: `${Math.max(
                0,
                ((data.land_acquired_acres - data.possession_acres) / data.land_proposed_acres) * 100
              )}%`,
            }}
            title={`Acquired (Award passed, pending handover): ${(data.land_acquired_acres - data.possession_acres).toFixed(1)} Acres`}
          />
          {/* Remaining Land to Acquire (Slate 200) */}
          <div
            className="bg-slate-200 h-full rounded-r-full transition-all duration-700"
            style={{ width: `${remainingPct}%` }}
            title={`Remaining: ${data.land_remaining_acres} Acres (${remainingPct.toFixed(1)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#138808]" />
            <span className="text-slate-700 font-medium">Physical Possession Taken</span>
            <span className="text-slate-500 font-mono">({data.possession_acres.toLocaleString()} Ac)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-400" />
            <span className="text-slate-700 font-medium">Acquired / Award Declared</span>
            <span className="text-slate-500 font-mono">
              ({Math.max(0, data.land_acquired_acres - data.possession_acres).toFixed(1)} Ac)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-slate-300" />
            <span className="text-slate-700 font-medium">Remaining Under Scrutiny/Notice</span>
            <span className="text-slate-500 font-mono">({data.land_remaining_acres.toLocaleString()} Ac)</span>
          </div>
        </div>
      </div>

      {/* Three Sub-metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Proposed Corridor
          </div>
          <div className="text-xl font-bold font-serif text-slate-900 mt-1">
            {data.land_proposed_acres.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">Acres</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sanctioned Alignment Right of Way</p>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded border border-emerald-100">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Acquired to Date</span>
            <span className="text-emerald-700 font-bold">{acqPct}%</span>
          </div>
          <div className="text-xl font-bold font-serif text-[#138808] mt-1">
            {data.land_acquired_acres.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-600">Acres</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 inline text-[#138808]" />
            <span>Award finalized & registered</span>
          </p>
        </div>

        <div className="p-3 bg-amber-50/50 rounded border border-amber-100">
          <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>Remaining Corridor</span>
            <span className="text-amber-700 font-bold">{remainingPct.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-bold font-serif text-slate-900 mt-1">
            {data.land_remaining_acres.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">Acres</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-0.5 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 inline text-amber-600" />
            <span>Under objection hearing / verification</span>
          </p>
        </div>
      </div>
    </div>
  );
}
