"use client";

import React from "react";
import { StateCompensationSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Calculator,
  Award,
  CreditCard,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface StateCompensationCardProps {
  compensation?: StateCompensationSummary;
}

export function StateCompensationCard({ compensation }: StateCompensationCardProps) {
  if (!compensation) return null;

  const assessed = compensation.total_assessed_cr ?? 0;
  const awarded = compensation.total_awarded_cr ?? 0;
  const disbursed = compensation.total_disbursed_cr ?? 0;
  const pending = compensation.pending_disbursement_cr ?? Math.max(0, awarded - disbursed);

  const disbPct = assessed > 0 ? ((disbursed / assessed) * 100).toFixed(1) : "0.0";
  const awardPct = assessed > 0 ? ((awarded / assessed) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
              FINANCIAL DIRECT BENEFIT TRANSFER
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
            State Compensation & Award Progress
          </h3>
        </div>
        <Link
          href="/compensation"
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
        >
          <span>All Records</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 4-Stage Comparison Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">1. Assessed</span>
            <div className="text-lg font-bold text-slate-900 mt-1">₹{assessed.toFixed(1)} Cr</div>
            <span className="text-[10px] text-slate-500">Sec 26-30 Estimate</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-700">2. Awarded ({awardPct}%)</span>
            <div className="text-lg font-bold text-blue-900 mt-1">₹{awarded.toFixed(1)} Cr</div>
            <span className="text-[10px] text-blue-700">{compensation.awards_issued_count} CALA Awards</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700">3. Disbursed ({disbPct}%)</span>
            <div className="text-lg font-bold text-emerald-900 mt-1">₹{disbursed.toFixed(1)} Cr</div>
            <span className="text-[10px] text-emerald-700">PFMS Account Credits</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-700">4. Pending DBT</span>
            <div className="text-lg font-bold text-amber-900 mt-1">₹{pending.toFixed(1)} Cr</div>
            <span className="text-[10px] text-amber-700">Under KYC / Escrow</span>
          </div>
        </div>

        {/* District-wise breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2.5">
            District-Wise Compensation Disbursement
          </h4>
          <div className="space-y-2.5">
            {(compensation.district_disbursements || compensation.districts || []).map((dist: any, idx: number) => {
              const dName = dist.district_name || dist.name || `District ${idx + 1}`;
              const disb = dist.disbursed_cr ?? dist.disbursed ?? 0;
              const assess = dist.assessed_cr ?? dist.assessed ?? 0;
              const disbPct = dist.disbursement_percent ?? (assess > 0 ? (disb / assess) * 100 : 0);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{dName}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">Disbursed: ₹{Number(disb).toFixed(1)} Cr / ₹{Number(assess).toFixed(1)} Cr</span>
                      <span className="font-bold text-emerald-800">{Number(disbPct).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#138808] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(disbPct))}%` }}
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
