"use client";

import React from "react";
import Link from "next/link";
import { RAndROverview } from "@/lib/types/dashboard";
import { Home, Users, CheckCircle2, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";

interface RAndROverviewCardProps {
  data?: RAndROverview;
}

export function RAndROverviewCard({ data }: RAndROverviewCardProps) {
  if (!data) return null;

  const compPct = Math.min(100, Math.max(0, data.completion_percent || 0));
  const stages = data.progress_stages || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            National Rehabilitation & Resettlement (R&R) Progress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory RFCTLARR Second Schedule entitlement delivery, model colony resettlement, and PAF assistance tracking
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-2xl font-black font-serif text-emerald-700">
              {compPct}%
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Fulfilled
            </span>
          </div>
          <Link
            href="/r-and-r"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline ml-2"
          >
            <span>Schemes</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress Stages Funnel */}
      <div className="mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stages.map((stg, idx) => {
            const isLast = idx === stages.length - 1;
            return (
              <div
                key={stg.stage}
                className={`p-3 rounded-lg border text-center ${
                  isLast
                    ? "bg-emerald-50/70 border-emerald-200"
                    : idx === 0
                    ? "bg-slate-50 border-slate-200"
                    : "bg-blue-50/50 border-blue-100"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                  {stg.stage}
                </span>
                <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">{stg.count}</p>
                <span className="text-[10px] text-slate-500 font-medium">
                  {stg.percentage}% of baseline
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-4 shadow-inner border border-slate-200">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-700"
            style={{ width: `${compPct}%` }}
            title={`R&R Fulfillment: ${compPct}%`}
          />
        </div>

        {/* Action Link Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Total Affected Families: <strong className="text-slate-900">{data.total_affected_families}</strong>
            </span>
            <span>•</span>
            <span>
              Eligible Beneficiaries: <strong className="text-emerald-700">{data.eligible_families}</strong>
            </span>
            <span>•</span>
            <span>
              Resettled: <strong className="text-green-700">{data.families_completed}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/affected-families"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
            >
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span>Manage PAFs Directory</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
