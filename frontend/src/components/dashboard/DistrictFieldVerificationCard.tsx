"use client";

import React, { useState } from "react";
import { DistrictFieldVerificationSummary } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Trees,
  Home,
  Camera,
  ArrowRight,
  Send,
  Check,
  X,
} from "lucide-react";

interface DistrictFieldVerificationCardProps {
  fieldData?: DistrictFieldVerificationSummary | any;
}

export function DistrictFieldVerificationCard({
  fieldData,
}: DistrictFieldVerificationCardProps) {
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!fieldData) return null;

  const handleAction = (id: string, actionType: "APPROVE" | "REWORK") => {
    setActionSuccess(
      actionType === "APPROVE"
        ? `Field Verification for parcel verified & approved successfully.`
        : `Rework instructions dispatched to Field Officer.`
    );
    setTimeout(() => {
      setActionSuccess(null);
      setSelectedVerificationId(null);
      setRemarks("");
    }, 2500);
  };

  const assignedCount = fieldData.total_assigned ?? fieldData.assigned_count ?? 0;
  const inProgressCount = fieldData.in_progress ?? fieldData.in_progress_count ?? 0;
  const submittedCount = fieldData.submitted_for_review ?? fieldData.submitted_count ?? 0;
  const approvedCount = fieldData.approved ?? fieldData.approved_count ?? 0;
  const reworkCount = fieldData.rework_required ?? fieldData.rework_count ?? 0;
  const overdueCount = fieldData.overdue ?? fieldData.overdue_count ?? 0;

  const statMetrics = [
    { label: "Assigned", count: assignedCount, color: "text-slate-700 bg-slate-100" },
    { label: "In Progress", count: inProgressCount, color: "text-blue-700 bg-blue-50" },
    { label: "Submitted", count: submittedCount, color: "text-amber-700 bg-amber-50" },
    { label: "Approved", count: approvedCount, color: "text-emerald-700 bg-emerald-50" },
    { label: "Rework Req.", count: reworkCount, color: "text-orange-700 bg-orange-50" },
    { label: "Overdue", count: overdueCount, color: "text-red-700 bg-red-50" },
  ];

  const submissions: any[] = fieldData.recent_submissions || fieldData.items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-700" />
              <span>FIELD VERIFICATION & GROUND SURVEY MANAGEMENT</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervision of field inspections, cadastre boundary validation, tree enumeration, and physical structures
            </p>
          </div>
          <Link
            href="/field"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <span>Open Field Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 6 Metric Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {statMetrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border border-slate-200/60 text-center ${m.color}`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider font-mono">
                {m.label}
              </div>
              <div className="text-lg font-bold mt-0.5">{m.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Verification Submissions Table */}
      <div className="p-4 sm:p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
          Submitted Field Evidence for CALA Review
        </div>

        {submissions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            No pending field verification submissions awaiting CALA review.
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub: any, idx: number) => {
              const verificationId = sub.verification_id || sub.id || `verif-${idx}`;
              const isSelected = selectedVerificationId === verificationId;
              const khasraNo = sub.khasra_number || sub.khasra_no || sub.khasra || "N/A";
              const village = sub.village_name || sub.village || "Purview Area";
              const officerName = sub.field_officer_name || sub.officer_name || "Field Officer";
              const status = sub.status || "SUBMITTED";
              const trees = sub.trees_enumerated ?? sub.trees_count ?? 0;
              const structures = sub.structures_found ?? sub.structures_count ?? 0;
              const evidenceCount = sub.evidence_count ?? sub.photos_count ?? 0;
              const submittedAt = sub.submitted_at ? String(sub.submitted_at).substring(0, 10) : "Recent";
              const gps = sub.gps_coordinates || (sub.latitude && sub.longitude ? `${sub.latitude}, ${sub.longitude}` : null);

              return (
                <div
                  key={verificationId}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          Khasra: {khasraNo}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-700">
                          Village: {village}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Officer: {officerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            status === "SUBMITTED"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-blue-100 text-blue-900 border border-blue-200"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Metadata & telemetry signals */}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-600">
                        {gps && (
                          <span className="flex items-center gap-1 text-slate-600 font-mono">
                            <MapPin className="h-3 w-3 text-red-500" />
                            GPS: {gps}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Trees className="h-3 w-3 text-emerald-600" />
                          Trees: <strong>{trees}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-indigo-600" />
                          Structures: <strong>{structures}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3 text-slate-500" />
                          Geo-tagged Evidence: <strong>{evidenceCount} photos</strong>
                        </span>
                        <span className="text-slate-400 font-mono">
                          Submitted: {submittedAt}
                        </span>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVerificationId(
                            isSelected ? null : verificationId
                          )
                        }
                        className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        {isSelected ? "Close" : "Review Evidence"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(verificationId, "APPROVE")}
                        className="px-2.5 py-1 text-xs font-bold rounded bg-[#138808] text-white hover:bg-[#0f6c06] flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(verificationId, "REWORK")}
                        className="px-2.5 py-1 text-xs font-bold rounded bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-400 flex items-center gap-1 shadow-2xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Rework</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Review Drawer */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        CALA Verification Remarks & Statutory Notes:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add scrutiny remarks, tree valuation notes, or boundary clarification orders..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAction(verificationId, "REWORK")}
                          className="px-3 py-1 text-xs font-medium rounded text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                        >
                          Request Field Re-verification
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(verificationId, "APPROVE")}
                          className="px-3 py-1 text-xs font-bold rounded text-white bg-[#138808] hover:bg-emerald-700"
                        >
                          Approve & Confirm Cadastre
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
