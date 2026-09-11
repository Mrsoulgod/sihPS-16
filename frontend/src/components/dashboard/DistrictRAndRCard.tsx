"use client";

import React from "react";
import { DistrictRAndRSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Home,
  Check,
  Building,
} from "lucide-react";

interface DistrictRAndRCardProps {
  randrData?: DistrictRAndRSummary | any;
}

export function DistrictRAndRCard({ randrData }: DistrictRAndRCardProps) {
  if (!randrData) return null;

  const totalPafs = randrData.total_affected_families ?? randrData.total_families_count ?? 0;
  const eligiblePafs = randrData.eligible_families ?? 0;
  const entitlementsDefined = randrData.entitlements_defined ?? 0;
  const allotmentsDone = randrData.allotments_completed ?? 0;
  const activeSchemes = randrData.active_schemes_count ?? 0;
  const completionPct = randrData.completion_percent ?? 0;
  const schemes: any[] = randrData.items || randrData.schemes || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-700" />
              <span>REHABILITATION & RESETTLEMENT (R&R) PURVIEW</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervision of Project-Affected Families (PAFs), entitlement disbursement, housing plots, and infrastructure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/r-and-r"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              <span>R&R Master Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 6 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-800 font-mono">Total PAFs</div>
            <div className="text-lg font-bold text-blue-900">{totalPafs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-[10px] uppercase font-bold text-indigo-800 font-mono">Eligible Families</div>
            <div className="text-lg font-bold text-indigo-900">{eligiblePafs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-center">
            <div className="text-[10px] uppercase font-bold text-purple-800 font-mono">Entitlements Defined</div>
            <div className="text-lg font-bold text-purple-900">{entitlementsDefined}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800 font-mono">Allotments Done</div>
            <div className="text-lg font-bold text-emerald-900">{allotmentsDone}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Active Schemes</div>
            <div className="text-lg font-bold text-amber-900">{activeSchemes}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-center">
            <div className="text-[10px] uppercase font-bold text-teal-800 font-mono">Overall Completion</div>
            <div className="text-lg font-bold text-teal-900">{completionPct}%</div>
          </div>
        </div>
      </div>

      {/* R&R Schemes List */}
      <div className="p-4 sm:p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
          Active District R&R Schemes & Resettlement Centers
        </div>

        {schemes.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            No active R&R schemes currently linked to this jurisdiction.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schemes.map((scheme: any, idx: number) => {
              const schemeId = scheme.scheme_id || scheme.id || `sch-${idx}`;
              const schemeName = scheme.scheme_name || scheme.name || `R&R Scheme ${idx + 1}`;
              const projectTitle = scheme.project_title || scheme.title || "Project Purview";
              const status = scheme.status || "ACTIVE";
              const settled = scheme.settled_families ?? scheme.rehabilitated_count ?? 0;
              const totalFam = scheme.total_families ?? scheme.families_count ?? 0;
              const progress = scheme.progress_percent ?? (totalFam > 0 ? Math.round((settled / totalFam) * 100) : 0);

              return (
                <div
                  key={schemeId}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {schemeName}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Project: {projectTitle}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                      {status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                      <span>Rehabilitation Progress</span>
                      <span className="font-mono font-bold text-slate-900">
                        {settled} / {totalFam} Families ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#138808] h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Scheme ID: {schemeId}
                    </span>
                    <Link
                      href={`/r-and-r/${schemeId}`}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
