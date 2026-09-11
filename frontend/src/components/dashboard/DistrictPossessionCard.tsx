"use client";

import React, { useState } from "react";
import { DistrictPossessionSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  MapPin,
  FileCheck,
  Ban,
  Calendar,
} from "lucide-react";

interface DistrictPossessionCardProps {
  possessionData?: DistrictPossessionSummary | any;
}

export function DistrictPossessionCard({ possessionData }: DistrictPossessionCardProps) {
  const [notification, setNotification] = useState<string | null>(null);

  if (!possessionData) return null;

  const handleIssueWarrant = (khasra: string) => {
    setNotification(`Possession Certificate & Warrant dispatched for Khasra ${khasra}.`);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const takenAcres = possessionData.possession_taken_acres ?? 0;
  const readyAcres = possessionData.ready_for_possession_acres ?? 0;
  const scheduledAcres = possessionData.scheduled_acres ?? 0;
  const pendingAcres = possessionData.pending_acres ?? 0;
  const blockedAcres = possessionData.blocked_acres ?? 0;
  const items: any[] = possessionData.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>SECTION 38 PHYSICAL POSSESSION & VESTING</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforcing statutory prerequisite clearance: 100% Compensation + R&R Entitlements before physical possession
            </p>
          </div>
          <Link
            href="/possession"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <span>Possession Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 5 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800 font-mono">Possession Taken</div>
            <div className="text-lg font-bold text-emerald-900">{takenAcres} Ac</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-800 font-mono">Ready to Vest</div>
            <div className="text-lg font-bold text-blue-900">{readyAcres} Ac</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-[10px] uppercase font-bold text-indigo-800 font-mono">Scheduled</div>
            <div className="text-lg font-bold text-indigo-900">{scheduledAcres} Ac</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Pending</div>
            <div className="text-lg font-bold text-amber-900">{pendingAcres} Ac</div>
          </div>
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-center">
            <div className="text-[10px] uppercase font-bold text-red-800 font-mono">Blocked</div>
            <div className="text-lg font-bold text-red-900">{blockedAcres} Ac</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Possession Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
              <th className="py-2.5 px-4">Project & Khasra</th>
              <th className="py-2.5 px-3">Area (Acres)</th>
              <th className="py-2.5 px-3">Compensation Cleared</th>
              <th className="py-2.5 px-3">R&R Cleared</th>
              <th className="py-2.5 px-3">Possession Status</th>
              <th className="py-2.5 px-3">Blockers / Schedule</th>
              <th className="py-2.5 px-4 text-right">CALA Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                  No physical possession cases in current purview.
                </td>
              </tr>
            ) : (
              items.map((item: any, idx: number) => {
                const possessionId = item.possession_id || item.id || `poss-${idx}`;
                const projectTitle = item.project_title || item.title || "Project";
                const khasra = item.parcel_khasra || item.khasra_number || "N/A";
                const area = item.area_acres ?? item.area ?? 0;
                const compCleared = !!item.compensation_cleared;
                const randrCleared = !!item.randr_cleared;
                const isReady = compCleared && randrCleared;
                const isBlocked = !!item.blocker_reason;
                const status = item.possession_status || item.status || "PENDING";

                return (
                  <tr key={possessionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{projectTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Khasra: {khasra}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {area} Ac
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                          compCleared
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-red-100 text-red-900 border border-red-200"
                        }`}
                      >
                        {compCleared ? "100% Cleared" : "Pending Disb."}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                          randrCleared
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {randrCleared ? "Rehabilitated" : "In Progress"}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                          status === "POSSESSION_TAKEN"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : status === "READY"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : status === "BLOCKED"
                            ? "bg-red-100 text-red-900 border border-red-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      {isBlocked ? (
                        <span className="text-red-700 font-semibold flex items-center gap-1">
                          <Ban className="h-3 w-3" />
                          {item.blocker_reason}
                        </span>
                      ) : item.scheduled_date ? (
                        <span className="text-slate-600 font-mono flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {String(item.scheduled_date).substring(0, 10)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Awaiting schedule</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isReady && status !== "POSSESSION_TAKEN" ? (
                        <button
                          type="button"
                          onClick={() => handleIssueWarrant(khasra)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#138808] text-white hover:bg-emerald-700 transition-colors"
                        >
                          <FileCheck className="h-3 w-3" />
                          <span>Issue Warrant</span>
                        </button>
                      ) : (
                        <Link
                          href={`/possession/${possessionId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
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
