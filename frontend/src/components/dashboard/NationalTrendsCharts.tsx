"use client";

import React, { useState } from "react";
import { NationalTrendsSummary } from "@/lib/types/dashboard";
import { TrendingUp, BarChart3, CreditCard, Compass, Layers, CheckCircle2 } from "lucide-react";

interface NationalTrendsChartsProps {
  trends?: NationalTrendsSummary;
}

export function NationalTrendsCharts({ trends }: NationalTrendsChartsProps) {
  const [activeChart, setActiveChart] = useState<"physical" | "financial" | "stages">("physical");

  if (!trends) {
    return null;
  }

  const acqData = trends.acquisition_progression || [];
  const disbData = trends.disbursement_progression || [];
  const stageData = trends.stage_distribution || [];

  // Max value calculations for scaling SVG
  const maxAcq = Math.max(...acqData.map((d) => Math.max(d.proposed, d.acquired, d.possession)), 500);
  const maxDisb = Math.max(...disbData.map((d) => Math.max(d.assessed, d.awarded, d.disbursed)), 160);
  const maxStage = Math.max(...stageData.map((d) => d.projects), 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header with Segmented Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              National Executive Progress Trends & Velocity
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical 5-month trajectory of corridor land acquisition, DBT disbursements, and stage transitions
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChart("physical")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeChart === "physical"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Physical Land
          </button>
          <button
            type="button"
            onClick={() => setActiveChart("financial")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeChart === "financial"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Financial DBT
          </button>
          <button
            type="button"
            onClick={() => setActiveChart("stages")}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeChart === "stages"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Stage Distribution
          </button>
        </div>
      </div>

      {/* Physical Land Velocity Chart */}
      {activeChart === "physical" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-700" />
              Corridor Land Trajectory (Acres over Time)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="h-2.5 w-2.5 rounded bg-slate-300 inline-block" /> Proposed
              </span>
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded bg-emerald-600 inline-block" /> Acquired
              </span>
              <span className="flex items-center gap-1 text-purple-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded bg-purple-600 inline-block" /> Possession
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {acqData.map((pt, idx) => {
              const acqHeight = Math.round((pt.acquired / maxAcq) * 100);
              const possHeight = Math.round((pt.possession / maxAcq) * 100);
              const propHeight = Math.round((pt.proposed / maxAcq) * 100);

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="h-44 w-full bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-end justify-center gap-1.5 relative group">
                    {/* Proposed Bar */}
                    <div
                      className="w-1/3 bg-slate-200 rounded-t transition-all group-hover:bg-slate-300"
                      style={{ height: `${propHeight}%` }}
                      title={`Proposed: ${pt.proposed} ac`}
                    />
                    {/* Acquired Bar */}
                    <div
                      className="w-1/3 bg-emerald-600 rounded-t transition-all group-hover:bg-emerald-700"
                      style={{ height: `${acqHeight}%` }}
                      title={`Acquired: ${pt.acquired} ac`}
                    />
                    {/* Possession Bar */}
                    <div
                      className="w-1/3 bg-purple-600 rounded-t transition-all group-hover:bg-purple-700"
                      style={{ height: `${possHeight}%` }}
                      title={`Possession: ${pt.possession} ac`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-800">{pt.month}</p>
                    <p className="text-[10px] font-mono text-emerald-700">{pt.acquired} ac</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial DBT Disbursements Chart */}
      {activeChart === "financial" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-blue-700" />
              Compensation Valuation vs PFMS DBT Release (₹ Cr)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="h-2.5 w-2.5 rounded bg-slate-300 inline-block" /> Assessed
              </span>
              <span className="flex items-center gap-1 text-blue-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded bg-blue-500 inline-block" /> Awarded
              </span>
              <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                <span className="h-2.5 w-2.5 rounded bg-emerald-600 inline-block" /> Disbursed (PFMS)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {disbData.map((pt, idx) => {
              const assHeight = Math.round((pt.assessed / maxDisb) * 100);
              const awdHeight = Math.round((pt.awarded / maxDisb) * 100);
              const disbHeight = Math.round((pt.disbursed / maxDisb) * 100);

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="h-44 w-full bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-end justify-center gap-1.5 relative group">
                    {/* Assessed */}
                    <div
                      className="w-1/3 bg-slate-300 rounded-t transition-all group-hover:bg-slate-400"
                      style={{ height: `${assHeight}%` }}
                      title={`Assessed: ₹${pt.assessed} Cr`}
                    />
                    {/* Awarded */}
                    <div
                      className="w-1/3 bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
                      style={{ height: `${awdHeight}%` }}
                      title={`Awarded: ₹${pt.awarded} Cr`}
                    />
                    {/* Disbursed */}
                    <div
                      className="w-1/3 bg-emerald-600 rounded-t transition-all group-hover:bg-emerald-700"
                      style={{ height: `${disbHeight}%` }}
                      title={`Disbursed: ₹${pt.disbursed} Cr`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-800">{pt.month}</p>
                    <p className="text-[10px] font-mono text-emerald-700">₹{pt.disbursed} Cr</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage Distribution */}
      {activeChart === "stages" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-700" />
              National Project Pipeline Stage Distribution
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {stageData.map((stg, idx) => {
              const widthPct = Math.round((stg.projects / maxStage) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{stg.stage}</span>
                    <span className="font-bold font-mono text-slate-900">{stg.projects} Projects</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.max(8, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
