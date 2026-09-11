"use client";

import React, { useState } from "react";
import { AvailableActionOption, ActionItemResponse } from "@/lib/types/action_center";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  UserCheck,
  FileCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface ActionExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionOption: AvailableActionOption | null;
  actionItem: ActionItemResponse;
  onExecute: (payload: {
    action: string;
    remarks?: string;
    rejection_reason?: string;
    rework_reason?: string;
    rework_items?: string[];
    target_authority_role?: string;
    due_date?: string;
  }) => Promise<void>;
}

export function ActionExecutionModal({
  isOpen,
  onClose,
  actionOption,
  actionItem,
  onExecute,
}: ActionExecutionModalProps) {
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reworkReason, setReworkReason] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState(
    actionOption?.target_authority_options?.[0]?.role || ""
  );
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !actionOption) return null;

  const isReject = actionOption.action === "REJECT";
  const isRework = actionOption.action === "REQUEST_REWORK";
  const isForward = actionOption.action === "FORWARD";
  const isAssign = actionOption.action === "ASSIGN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isReject && !rejectionReason.trim()) {
      setErrorMsg("Statutory rejection reason is required.");
      return;
    }

    if (isRework && !reworkReason.trim()) {
      setErrorMsg("Rework reason and required corrections are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onExecute({
        action: actionOption.action,
        remarks: remarks.trim() || undefined,
        rejection_reason: isReject ? rejectionReason.trim() : undefined,
        rework_reason: isRework ? reworkReason.trim() : undefined,
        target_authority_role: isForward || isAssign ? selectedAuthority : undefined,
        due_date: dueDate || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            {isReject ? (
              <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4" />
              </div>
            ) : isRework ? (
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </div>
            ) : isForward ? (
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
            ) : isAssign ? (
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {actionOption.label}
              </h3>
              <p className="text-[11px] text-slate-500">
                {actionItem.record_type}: {actionItem.record_reference}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">{actionOption.description}</p>
            <p className="text-[11px] text-slate-500">
              Current Stage: <strong>{actionItem.workflow_stage_name}</strong>
              {actionOption.target_status && (
                <span> • Target: <strong>{actionOption.target_status}</strong></span>
              )}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rejection Reason */}
          {isReject && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Statutory Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the non-compliance reasons per RFCTLARR Act 2013..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          )}

          {/* Rework Reason */}
          {isRework && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Correction & Revision Instructions <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
                placeholder="Specify the required modifications, missing evidence, or alignment changes..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}

          {/* Target Authority Selector (For Forward / Assign) */}
          {(isForward || isAssign) && actionOption.target_authority_options && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Target Authority / Department <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                {actionOption.target_authority_options.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.label} ({opt.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Operational Remarks */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              Operational Remarks {actionOption.requires_remarks && <span className="text-rose-600">*</span>}
            </label>
            <textarea
              rows={2}
              required={actionOption.requires_remarks}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add official remarks for statutory audit record..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* SLA Due Date (Optional) */}
          {(isRework || isAssign) && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Compliance Deadline (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isSuccess}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white shadow-xs transition-colors ${
                isSuccess
                  ? "bg-emerald-700"
                  : isReject
                  ? "bg-rose-600 hover:bg-rose-700"
                  : isRework
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-[#138808] hover:bg-emerald-700"
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Action Recorded</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm & Execute</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
