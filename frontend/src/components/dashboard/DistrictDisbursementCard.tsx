"use client";

import React, { useState } from "react";
import { DistrictDisbursementSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Building,
  AlertOctagon,
} from "lucide-react";

interface DistrictDisbursementCardProps {
  disbData?: DistrictDisbursementSummary;
}

export function DistrictDisbursementCard({ disbData }: DistrictDisbursementCardProps) {
  const [notification, setNotification] = useState<string | null>(null);

  if (!disbData) return null;

  const handleEscalatePayment = (award: string) => {
    setNotification(`Payment issue for award ${award} escalated to District Treasury / PFMS Helpdesk.`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              <span>PFMS DIRECT BENEFIT DISBURSEMENT MONITORING</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct Benefit Transfer (DBT) to validated Aadhaar/PFMS beneficiary bank accounts
            </p>
          </div>
          <Link
            href="/disbursements"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <span>Disbursement Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800 font-mono">Disbursed Amount</div>
            <div className="text-lg font-bold text-emerald-900">₹{disbData.total_disbursed_cr} Cr</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
            <div className="text-[10px] uppercase font-bold text-rose-800 font-mono">Pending Amount</div>
            <div className="text-lg font-bold text-rose-900">₹{disbData.pending_amount_cr} Cr</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-800 font-mono">Completed DBT</div>
            <div className="text-lg font-bold text-blue-900">{disbData.disbursed_count} Beneficiaries</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Processing / Queued</div>
            <div className="text-lg font-bold text-amber-900">{disbData.processing_count} Batches</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Disbursement List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
              <th className="py-2.5 px-4">Award & Project</th>
              <th className="py-2.5 px-3">Beneficiary</th>
              <th className="py-2.5 px-3">Disbursed Amount</th>
              <th className="py-2.5 px-3">PFMS Status</th>
              <th className="py-2.5 px-3">Disbursement Status</th>
              <th className="py-2.5 px-3">Pending Reason / Remarks</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {disbData.items.map((item) => (
              <tr key={item.disbursement_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-slate-900">{item.award_number}</div>
                  <div className="text-[11px] text-slate-500">{item.project_title}</div>
                </td>

                <td className="py-3 px-3 font-medium text-slate-800">
                  {item.beneficiary_name}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  ₹{item.amount_cr} Cr
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                      item.pfms_status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        : item.pfms_status === "PENDING"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-red-100 text-red-900 border border-red-200"
                    }`}
                  >
                    {item.pfms_status}
                  </span>
                </td>

                <td className="py-3 px-3 font-mono text-slate-700">
                  {item.disbursement_status}
                </td>

                <td className="py-3 px-3 text-slate-600 text-[11px]">
                  {item.pending_reason || "None — Ready"}
                </td>

                <td className="py-3 px-4 text-right">
                  {item.pfms_status === "PENDING" || item.pfms_status === "FAILED" ? (
                    <button
                      type="button"
                      onClick={() => handleEscalatePayment(item.award_number)}
                      className="px-2.5 py-1 text-xs font-bold rounded bg-[#138808] text-white hover:bg-[#0f6c06] transition-colors shadow-2xs"
                    >
                      Escalate PFMS
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Settled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
