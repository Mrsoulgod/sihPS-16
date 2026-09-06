"use client";

import React, { useState } from "react";
import { NationalFunnelStageItem } from "@/lib/types/dashboard";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  Flame,
  Filter,
} from "lucide-react";

interface NationalFunnelProps {
  stages?: NationalFunnelStageItem[];
}

export function NationalFunnel({ stages }: NationalFunnelProps) {
  const [selectedStage, setSelectedStage] = useState<NationalFunnelStageItem | null>(null);

  if (!stages || stages.length === 0) {
    return null;
  }

  const bottleneckCount = stages.filter((s) => s.is_bottleneck).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 font-serif">
              National Acquisition Lifecycle Funnel (RFCTLARR 12-Stages)
            </span>
            {bottleneckCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <Flame className="h-3 w-3 text-rose-600" />
                {bottleneckCount} Bottlenecks Identified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline progression from Project Proposal to Final Gazette Mutation & Handover
          </p>
        </div>
      </div>

      {/* Funnel Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stages.map((stg) => {
          const isSelected = selectedStage?.stage_id === stg.stage_id;

          let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
          let statusIcon = <Clock className="h-3.5 w-3.5 text-slate-400" />;

          if (stg.status === "COMPLETED") {
            badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
            statusIcon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
          } else if (stg.is_bottleneck || stg.status === "AT_RISK") {
            badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
            statusIcon = <Flame className="h-3.5 w-3.5 text-rose-600" />;
          } else if (stg.status === "IN_PROGRESS" || stg.status === "ON_TRACK") {
            badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
            statusIcon = <Clock className="h-3.5 w-3.5 text-blue-600" />;
          }

          return (
            <div
              key={stg.stage_id}
              onClick={() => setSelectedStage(isSelected ? null : stg)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                  : stg.is_bottleneck
                  ? "border-rose-200 bg-rose-50/20 hover:border-rose-300"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    #{stg.stage_order}
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{stg.stage_name}</p>
                </div>
                <div className="shrink-0">{statusIcon}</div>
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {stg.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">{stg.project_count}</span>
                  <span className="text-slate-500">Corridors</span>
                </div>
                {stg.land_acres > 0 && (
                  <span className="font-mono font-medium text-slate-600">{stg.land_acres.toLocaleString()} ac</span>
                )}
                {stg.amount_cr > 0 && (
                  <span className="font-mono font-bold text-emerald-800">₹{stg.amount_cr.toFixed(1)} Cr</span>
                )}
              </div>

              {stg.is_bottleneck && (
                <div className="mt-2 bg-rose-100/70 border border-rose-200 rounded p-1.5 text-[10px] text-rose-900 font-medium">
                  ⚠️ {stg.bottleneck_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer */}
      {selectedStage && (
        <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 font-serif text-sm">
                Stage {selectedStage.stage_order}: {selectedStage.stage_name}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                {selectedStage.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-700">{selectedStage.description}</p>
          <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-slate-800">
            <div>
              <span className="text-slate-500">Active Corridors: </span>
              <strong>{selectedStage.project_count}</strong>
            </div>
            {selectedStage.land_acres > 0 && (
              <div>
                <span className="text-slate-500">Alignment Area: </span>
                <strong>{selectedStage.land_acres.toLocaleString()} Acres</strong>
              </div>
            )}
            {selectedStage.amount_cr > 0 && (
              <div>
                <span className="text-slate-500">Statutory Exposure: </span>
                <strong className="text-emerald-800">₹{selectedStage.amount_cr.toFixed(1)} Cr</strong>
              </div>
            )}
          </div>
          {selectedStage.is_bottleneck && (
            <div className="p-2 rounded bg-rose-100 border border-rose-200 text-rose-900 font-medium">
              <strong>Statutory Bottleneck:</strong> {selectedStage.bottleneck_reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
