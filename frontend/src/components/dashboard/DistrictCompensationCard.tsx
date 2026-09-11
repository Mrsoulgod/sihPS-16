"use client";

import React, { useState } from "react";
import { DistrictCompensationSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Calculator,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Coins,
  ShieldCheck,
} from "lucide-react";

interface DistrictCompensationCardProps {
  compData?: DistrictCompensationSummary | any;
}

export function DistrictCompensationCard({ compData }: DistrictCompensationCardProps) {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  if (!compData) return null;

  const pendingReview = compData.assessments_pending_review ?? compData.pending_assessment_count ?? 0;
  const approved = compData.assessments_approved ?? (typeof compData.assessments_approved_cr === "number" ? compData.assessments_approved_cr : 0);
  const awardsPending = compData.awards_pending ?? 0;
  const awardsIssued = compData.awards_issued ?? 0;
  const disbCompleted = compData.disbursement_completed_cr ?? 0;
  const disbPending = compData.disbursement_pending_cr ?? compData.assessments_pending_review_cr ?? 0;
  const cases: any[] = compData.recent_cases || compData.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-700" />
              <span>COMPENSATION ASSESSMENT & FINANCIAL VALUATION</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Market value multiplier, 100% Solatium (Sec 30), and 12% additional interest determination
            </p>
          </div>
          <Link
            href="/compensation"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <span>Compensation Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Pending Review</div>
            <div className="text-lg font-bold text-amber-900">{pendingReview}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800 font-mono">Approved</div>
            <div className="text-lg font-bold text-emerald-900">{approved}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-800 font-mono">Awards Pending</div>
            <div className="text-lg font-bold text-blue-900">{awardsPending}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-[10px] uppercase font-bold text-indigo-800 font-mono">Awards Issued</div>
            <div className="text-lg font-bold text-indigo-900">{awardsIssued}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-center">
            <div className="text-[10px] uppercase font-bold text-cyan-800 font-mono">Disbursed</div>
            <div className="text-lg font-bold text-cyan-900">₹{disbCompleted} Cr</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
            <div className="text-[10px] uppercase font-bold text-rose-800 font-mono">Pending Disb.</div>
            <div className="text-lg font-bold text-rose-900">₹{disbPending} Cr</div>
          </div>
        </div>
      </div>

      {/* Compensation Cases Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
              <th className="py-2.5 px-4">Project & Parcel</th>
              <th className="py-2.5 px-3">Landowner</th>
              <th className="py-2.5 px-3">Market Value</th>
              <th className="py-2.5 px-3">Solatium (100%)</th>
              <th className="py-2.5 px-3">Total Compensation</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-4 text-right">CALA Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                  No active compensation assessment cases awaiting review.
                </td>
              </tr>
            ) : (
              cases.map((c: any, idx: number) => {
                const assessmentId = c.assessment_id || c.id || `assess-${idx}`;
                const projectTitle = c.project_title || c.title || "Project";
                const khasra = c.parcel_khasra || c.khasra_number || c.khasra || "N/A";
                const ownerName = c.owner_name || c.claimant_name || "Landowner";
                const marketVal = c.market_value_cr ?? c.market_value ?? 0;
                const solatium = c.solatium_cr ?? c.solatium ?? 0;
                const totalAmt = c.total_amount_cr ?? c.total_amount ?? (marketVal + solatium);
                const status = c.status || "PENDING_REVIEW";

                return (
                  <tr key={assessmentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{projectTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Khasra: {khasra}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800">
                      {ownerName}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      ₹{marketVal} Cr
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      ₹{solatium} Cr
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                      ₹{totalAmt} Cr
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                          status === "PENDING_REVIEW"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/compensation/${assessmentId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        <span>Approve Valuation</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
