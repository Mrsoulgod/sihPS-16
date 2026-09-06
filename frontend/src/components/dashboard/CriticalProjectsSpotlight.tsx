"use client";

import React from "react";
import { CriticalProjectItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Building2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Clock,
  MapPin,
  Landmark,
  Layers,
  ChevronRight,
} from "lucide-react";

interface CriticalProjectsSpotlightProps {
  projects?: CriticalProjectItem[];
}

export function CriticalProjectsSpotlight({ projects }: CriticalProjectsSpotlightProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Critical Projects Spotlight (National Oversight)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono">
              {projects.length} Corridors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interstate corridors requiring high-level statutory intervention, dispute resolution, or fund release
          </p>
        </div>

        <Link
          href="/projects"
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All Projects</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          let riskBadge = "bg-rose-100 text-rose-900 border-rose-200";
          if (proj.risk_level === "HIGH") {
            riskBadge = "bg-rose-50 text-rose-800 border-rose-200";
          } else if (proj.risk_level === "MODERATE") {
            riskBadge = "bg-amber-50 text-amber-800 border-amber-200";
          }

          return (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {proj.project_code}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${riskBadge}`}>
                    {proj.risk_level} ({proj.risk_score})
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                  {proj.title}
                </h4>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>
                    {proj.district_name || "Jaipur"}, {proj.state_name || "Rajasthan"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-600 mb-1">
                    <span>Acquisition: {proj.progress_percent}%</span>
                    <span className="font-mono text-slate-500">{proj.current_stage}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, proj.progress_percent))}%` }}
                    />
                  </div>
                </div>

                {/* Bottleneck Alert */}
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-[11px] space-y-1">
                  <div className="font-bold text-rose-900 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                    <span>Main Bottleneck:</span>
                  </div>
                  <p className="text-rose-800 leading-snug">{proj.main_bottleneck}</p>
                </div>

                {/* Pending Action */}
                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Action Required: </span>
                  <span className="text-slate-800 font-medium">{proj.pending_action}</span>
                </div>
              </div>

              {/* Action Link to Project 360 */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {proj.financial_exposure_cr ? (
                  <span className="text-[11px] font-mono text-slate-600">
                    Exp: <strong>₹{proj.financial_exposure_cr.toFixed(1)} Cr</strong>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Target SLA: {proj.target_sla_days}d</span>
                )}

                <Link
                  href={`/projects/${proj.project_code || proj.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Open Project 360</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
