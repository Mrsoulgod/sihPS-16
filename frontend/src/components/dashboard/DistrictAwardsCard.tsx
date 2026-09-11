"use client";

import React, { useState } from "react";
import { DistrictAwardsSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  Check,
  FileText,
} from "lucide-react";

interface DistrictAwardsCardProps {
  awardsData?: DistrictAwardsSummary | any;
}

export function DistrictAwardsCard({ awardsData }: DistrictAwardsCardProps) {
  const [notification, setNotification] = useState<string | null>(null);

  if (!awardsData) return null;

  const handlePublish = (awardId: string) => {
    setNotification(`Award ${awardId} officially signed and published under Section 23/30.`);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const totalAwards = awardsData.total_awards ?? 0;
  const pendingAction = awardsData.awards_pending_action ?? awardsData.awards_drafted ?? 0;
  const approved = awardsData.awards_approved ?? 0;
  const published = awardsData.awards_published ?? 0;
  const items: any[] = awardsData.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-700" />
              <span>SECTION 23 / 30 AWARDS DECLARATION</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory declaration of true area, compensation, and apportionment by the Competent Authority
            </p>
          </div>
          <Link
            href="/awards"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <span>Awards Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded bg-white border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Total Awards</div>
            <div className="text-base font-bold text-slate-900">{totalAwards}</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-700 font-mono">Drafted / Pending</div>
            <div className="text-base font-bold text-amber-900">{pendingAction}</div>
          </div>
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-700 font-mono">Approved</div>
            <div className="text-base font-bold text-blue-900">{approved}</div>
          </div>
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700 font-mono">Published</div>
            <div className="text-base font-bold text-emerald-900">{published}</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Awards Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
              <th className="py-2.5 px-4">Award Number</th>
              <th className="py-2.5 px-3">Project & Parcel</th>
              <th className="py-2.5 px-3">Assessed Value</th>
              <th className="py-2.5 px-3">Final Award Total</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Pending Action</th>
              <th className="py-2.5 px-4 text-right">CALA Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                  No statutory awards records available in current view.
                </td>
              </tr>
            ) : (
              items.map((aw: any, idx: number) => {
                const awardId = aw.award_id || aw.id || `aw-${idx}`;
                const awardNo = aw.award_number || aw.award_no || `AWD-${idx + 1}`;
                const projectTitle = aw.project_title || aw.title || "Project";
                const khasra = aw.parcel_khasra || aw.khasra_number || "N/A";
                const assessedAmt = aw.assessed_amount_cr ?? aw.assessed_amount ?? 0;
                const awardAmt = aw.award_amount_cr ?? aw.award_amount ?? 0;
                const status = aw.status || "DRAFT";
                const pendingAct = aw.pending_action || "Sign Award";

                return (
                  <tr key={awardId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {awardNo}
                      {aw.award_date && (
                        <div className="text-[10px] text-slate-400 font-normal font-sans">
                          Date: {String(aw.award_date).substring(0, 10)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{projectTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Khasra: {khasra}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      ₹{assessedAmt} Cr
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                      ₹{awardAmt} Cr
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                          status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : status === "APPROVED"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 text-[11px]">
                      {pendingAct}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handlePublish(awardNo)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#138808] text-white hover:bg-emerald-700 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Sign / Publish</span>
                      </button>
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
