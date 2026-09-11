"use client";

import React, { useState } from "react";
import { DistrictEscalationToStateItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Clock,
  Building,
} from "lucide-react";

interface DistrictEscalationsCardProps {
  escalations?: DistrictEscalationToStateItem[];
  onOpenEscalationModal?: () => void;
}

export function DistrictEscalationsCard({
  escalations = [],
  onOpenEscalationModal,
}: DistrictEscalationsCardProps) {
  const [notification, setNotification] = useState<string | null>(null);

  const handleEscalateNow = (id: string) => {
    setNotification(`Escalation dossier transmitted to State Officer (Revenue/LA) for immediate review.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>DISTRICT TO STATE ESCALATIONS & BOTTLENECK DOSSIERS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-mono">
                {escalations.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hierarchical escalation of unresolvable field, inter-agency, or compensation deadlocks directly to State Officer
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenEscalationModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Escalate Issue to State</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Escalation items */}
      {escalations.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No Open State Escalations</p>
          <p className="text-xs text-slate-500 mt-0.5">
            All district acquisition workflows are proceeding without inter-authority bottlenecks.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {escalations.map((esc) => {
            return (
              <div
                key={esc.escalation_id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        esc.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : esc.priority === "HIGH"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {esc.priority}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {esc.issue_title}
                    </h4>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {esc.project_title}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Escalated: {esc.escalated_at}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80">
                  <strong className="text-slate-900 font-medium">Reason & Bottleneck:</strong>{" "}
                  {esc.reason}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                  <div className="flex items-center gap-3">
                    <span>Stage: {esc.stage_name}</span>
                    <span>•</span>
                    <span>Assigned State Desk: {esc.current_owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      Status: {esc.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEscalateNow(esc.escalation_id)}
                      className="px-2 py-1 rounded bg-slate-800 text-white font-sans text-xs hover:bg-slate-900 transition-colors"
                    >
                      Re-transmit Notice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
