"use client";

import React, { useState } from "react";
import { DistrictObjectionsSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Gavel,
  Check,
} from "lucide-react";

interface DistrictObjectionsCardProps {
  objectionsData?: DistrictObjectionsSummary;
}

export function DistrictObjectionsCard({ objectionsData }: DistrictObjectionsCardProps) {
  const [selectedObjectionId, setSelectedObjectionId] = useState<string | null>(null);
  const [hearingDate, setHearingDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  if (!objectionsData) return null;

  const handleResolve = (ref: string) => {
    setNotification(`Objection ${ref} marked resolved under Section 15(2).`);
    setTimeout(() => {
      setNotification(null);
      setSelectedObjectionId(null);
    }, 2500);
  };

  const handleScheduleHearing = (ref: string) => {
    setNotification(`Section 15 Hearing for ${ref} scheduled for ${hearingDate || "Next Working Day"}.`);
    setTimeout(() => {
      setNotification(null);
      setSelectedObjectionId(null);
    }, 2500);
  };

  if (!objectionsData) return null;

  const totalObjections = objectionsData.total_objections ?? objectionsData.total_count ?? 0;
  const pendingReview = objectionsData.pending_review ?? objectionsData.pending_hearing_count ?? 0;
  const hearingsScheduled = objectionsData.hearings_scheduled ?? objectionsData.hearings_completed_count ?? 0;
  const resolved = objectionsData.resolved ?? objectionsData.disposed_count ?? 0;
  const items: any[] = objectionsData.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-emerald-700" />
              <span>SECTION 15 OBJECTIONS & CLAIMS MANAGEMENT</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory hearing and determination of landowner objections within 60 days of Section 11 Notification
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
              {pendingReview} Pending CALA Hearing
            </span>
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded bg-white border border-slate-200 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Total Claims</div>
            <div className="text-base font-bold text-slate-900">{totalObjections}</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800 font-mono">Hearing Pending</div>
            <div className="text-base font-bold text-amber-900">{pendingReview}</div>
          </div>
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] uppercase font-bold text-blue-800 font-mono">Hearings Scheduled</div>
            <div className="text-base font-bold text-blue-900">{hearingsScheduled}</div>
          </div>
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800 font-mono">Disposed / Orders</div>
            <div className="text-base font-bold text-emerald-900">{resolved}</div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Objections List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono border-b border-slate-200">
              <th className="py-2.5 px-4">Ref Number</th>
              <th className="py-2.5 px-3">Project & Parcel</th>
              <th className="py-2.5 px-3">Claimant Ref</th>
              <th className="py-2.5 px-3">Objection Type</th>
              <th className="py-2.5 px-3">Hearing Status</th>
              <th className="py-2.5 px-3">Next Action</th>
              <th className="py-2.5 px-4 text-right">CALA Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((obj: any, idx: number) => {
              const objectionId = obj.objection_id || obj.id || `obj-${idx}`;
              const isSelected = selectedObjectionId === objectionId;
              return (
                <React.Fragment key={obj.objection_id}>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {obj.reference_number}
                      <div className="text-[10px] text-slate-400 font-normal font-sans">
                        Filed: {obj.filing_date}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{obj.project_title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Khasra: {obj.parcel_khasra}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      {obj.claimant_reference}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {obj.objection_type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded font-mono ${
                          obj.hearing_status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {obj.hearing_status}
                      </span>
                      {obj.hearing_date && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          Date: {obj.hearing_date}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      {obj.next_action}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedObjectionId(isSelected ? null : obj.objection_id)
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#138808] text-white hover:bg-emerald-700 transition-colors"
                      >
                        {isSelected ? "Close" : "Process Hearing"}
                      </button>
                    </td>
                  </tr>

                  {/* Hearing & Determination Panel */}
                  {isSelected && (
                    <tr className="bg-slate-50/90">
                      <td colSpan={7} className="p-4 border-b border-slate-200">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                            Record CALA Hearing & Statutory Decision — {obj.reference_number}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Schedule Hearing Date:
                              </label>
                              <input
                                type="date"
                                value={hearingDate}
                                onChange={(e) => setHearingDate(e.target.value)}
                                className="w-full text-xs p-2 rounded border border-slate-300"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                                Hearing Findings & Orders:
                              </label>
                              <input
                                type="text"
                                placeholder="Summary of arguments heard, evidence verified..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full text-xs p-2 rounded border border-slate-300"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleScheduleHearing(obj.reference_number)}
                              className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Schedule Hearing Notice
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolve(obj.reference_number)}
                              className="px-3 py-1.5 text-xs font-bold rounded bg-[#138808] text-white hover:bg-emerald-700"
                            >
                              Issue Sec 15(2) Determination & Resolve
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
