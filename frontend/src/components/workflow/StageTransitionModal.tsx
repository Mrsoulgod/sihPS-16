"use client";

import React, { useState } from "react";
import { ProjectWorkflowTimelineResponse, AllowedAction } from "@/lib/types/workflow";
import { useTransitionStage } from "@/lib/hooks/useWorkflow";
import { X, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface StageTransitionModalProps {
  timeline: ProjectWorkflowTimelineResponse;
  isOpen: boolean;
  onClose: () => void;
}

export function StageTransitionModal({ timeline, isOpen, onClose }: StageTransitionModalProps) {
  const transitionMutation = useTransitionStage(timeline.project_id);

  const [selectedAction, setSelectedAction] = useState<string>(
    timeline.allowed_transitions[0]?.action || "APPROVED"
  );
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const currentAllowed = timeline.allowed_transitions.find((a) => a.action === selectedAction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (selectedAction === "REJECTED" && !rejectionReason.trim()) {
      setErrorMessage("Please enter a reason for rejection / rework.");
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        decision: selectedAction as "APPROVED" | "REJECTED",
        target_stage: currentAllowed?.target_stage,
        remarks: remarks.trim() || undefined,
        rejection_reason: selectedAction === "REJECTED" ? rejectionReason.trim() : undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error?.message || err?.message || "Failed to execute stage transition.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Statutory Stage Transition
            </h3>
            <p className="text-xs text-slate-500">
              {timeline.project_code} • Current: <strong className="text-slate-700">{timeline.current_stage}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Transition Action
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {timeline.allowed_transitions.map((item) => {
                const isSelected = selectedAction === item.action;
                const isApprove = item.action === "APPROVED";

                return (
                  <button
                    key={item.action}
                    type="button"
                    onClick={() => setSelectedAction(item.action)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? isApprove
                          ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-600 font-semibold"
                          : "border-amber-600 bg-amber-50/60 text-amber-950 ring-1 ring-amber-600 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        {item.action}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className={`h-3.5 w-3.5 ${isApprove ? "text-emerald-700" : "text-amber-700"}`} />
                      )}
                    </div>
                    <div className="text-[11px] leading-snug">{item.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rejection Reason (Mandatory if REJECTED) */}
          {selectedAction === "REJECTED" && (
            <div>
              <label className="block text-xs font-semibold text-rose-900 mb-1">
                Statutory Reason for Rejection / Rework <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify regulatory non-compliance, boundary discrepancies, or documentation gaps requiring resolution..."
                className="w-full text-xs p-2.5 rounded border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Notes / Transition Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add official notes for the tamper-proof audit trail..."
              className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transitionMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#138808] hover:bg-emerald-700 text-white text-xs font-medium shadow transition-colors disabled:opacity-50"
            >
              {transitionMutation.isPending ? "Executing..." : "Confirm & Apply Transition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
