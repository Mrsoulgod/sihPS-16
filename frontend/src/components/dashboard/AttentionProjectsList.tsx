"use client";

import React from "react";
import { AttentionProjectItem } from "@/lib/types/dashboard";
import { AlertTriangle, Clock, MapPin, ArrowRight, ShieldAlert } from "lucide-react";

interface AttentionProjectsListProps {
  projects: AttentionProjectItem[];
}

export function AttentionProjectsList({ projects }: AttentionProjectsListProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Projects Requiring Administrative Attention
            </h3>
            <p className="text-xs text-slate-500">
              Corridors with statutory timeline drift, objection hearing backlogs, or title disputes
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
          {projects.length} Priority Flagged
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {projects.map((item) => {
          const isDelayed = item.status === "DELAYED";
          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all ${
                isDelayed
                  ? "border-rose-200 bg-rose-50/30 hover:border-rose-300"
                  : "border-amber-200 bg-amber-50/30 hover:border-amber-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left info */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isDelayed
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isDelayed ? (
                        <Clock className="h-3 w-3 inline" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 inline" />
                      )}
                      {item.status === "DELAYED" ? "Statutory Delay" : "At Risk"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.project_code}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {item.district_name ? `${item.district_name}, ` : ""}
                      {item.state_name || "National"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 pt-1">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                    <span>
                      Current Stage:{" "}
                      <strong className="text-slate-800 uppercase font-semibold">
                        {item.current_stage.replace(/_/g, " ")}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Acquisition:{" "}
                      <strong className="text-[#138808]">
                        {item.acquisition_progress_percent}%
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-xs font-semibold text-rose-700">
                      Risk Index: {item.risk_score}/100
                    </span>
                  </div>
                </div>

                {/* Right badge & action */}
                <div className="sm:text-right shrink-0">
                  <span className="inline-block text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded shadow-2xs">
                    CALA Action Mandated
                  </span>
                </div>
              </div>

              {/* Statutory reason banner */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 shrink-0">Reason for Flag:</span>
                <span className="text-slate-600 font-medium leading-relaxed">
                  {item.reason}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
