"use client";

import React from "react";
import { StateProgressItem } from "@/lib/types/dashboard";
import { CheckCircle2, AlertCircle, AlertTriangle, ArrowUpRight } from "lucide-react";

interface StateComparisonTableProps {
  states: StateProgressItem[];
}

export function StateComparisonTable({ states }: StateComparisonTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            State-Wise Acquisition & Settlement Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-state comparative benchmark: land handed over, PFMS compensation disbursed, and R&R pace
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium self-start sm:self-auto">
          Sorted by Acquisition %
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-2.5 px-3">State / UT</th>
              <th className="py-2.5 px-3 text-center">Projects</th>
              <th className="py-2.5 px-3">Land Acquired / Proposed (Ac)</th>
              <th className="py-2.5 px-3">Acquisition Progress</th>
              <th className="py-2.5 px-3 text-right">Disbursed (₹ Cr)</th>
              <th className="py-2.5 px-3 text-center">R&R Avg</th>
              <th className="py-2.5 px-3 text-center">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {states.map((st) => {
              const ratingBadge = () => {
                if (st.performance_category === "STRONG") {
                  return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      STRONG
                    </span>
                  );
                } else if (st.performance_category === "MODERATE") {
                  return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      MODERATE
                    </span>
                  );
                } else {
                  return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <AlertCircle className="h-3 w-3 text-rose-600" />
                      LAGGING
                    </span>
                  );
                }
              };

              return (
                <tr key={st.state_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{st.state_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{st.state_id}</div>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    {st.project_count}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">
                      {st.land_acquired_acres.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {" "}/ {st.land_proposed_acres.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-3 min-w-[150px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-800">{st.acquisition_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          st.acquisition_percent >= 80
                            ? "bg-[#138808]"
                            : st.acquisition_percent >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, st.acquisition_percent)}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-serif font-bold text-slate-900">
                    ₹{st.compensation_disbursed_cr.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                      {st.randr_completion_percent}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">{ratingBadge()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
