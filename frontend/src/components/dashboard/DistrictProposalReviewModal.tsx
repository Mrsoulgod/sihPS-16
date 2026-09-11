"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Building,
  Layers,
  MapPin,
  Check,
  Send,
} from "lucide-react";

interface DistrictProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  onSuccess?: (message: string) => void;
}

export function DistrictProposalReviewModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
}: DistrictProposalReviewModalProps) {
  const [decision, setDecision] = useState<"APPROVE" | "REWORK" | "REJECT">("APPROVE");
  const [scrutinyRemarks, setScrutinyRemarks] = useState("");
  const [checklist, setChecklist] = useState({
    dprVerified: true,
    landAlignmentChecked: true,
    revenueRecordsChecked: true,
    environmentalClearanceReviewed: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      const actionText =
        decision === "APPROVE"
          ? "Proposal scrutinized & Section 4/11 approval granted. Workflow moved forward."
          : decision === "REWORK"
          ? "Rework request dispatched to Project Agency with scrutiny notes."
          : "Proposal rejected. Statutory audit log updated.";

      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess(actionText);
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
              DISTRICT / CALA STATUTORY SCRUTINY
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {projectTitle || "Project Proposal Review"}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Project ID: {projectId || "PRJ-JAIPUR-001"} • CALA Jaipur Purview
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Statutory Scrutiny Checklist */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Statutory Scrutiny Checklist (Mandatory CALA Verification)
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.dprVerified}
                  onChange={(e) =>
                    setChecklist({ ...checklist, dprVerified: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Detailed Project Report (DPR) & Feasibility documentation verified</span>
              </label>
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.landAlignmentChecked}
                  onChange={(e) =>
                    setChecklist({ ...checklist, landAlignmentChecked: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Land requirement & right-of-way alignment cross-referenced with cadastre</span>
              </label>
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.revenueRecordsChecked}
                  onChange={(e) =>
                    setChecklist({ ...checklist, revenueRecordsChecked: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>District Tehsil Jamabandi / revenue khasra records preliminary check</span>
              </label>
            </div>
          </div>

          {/* Decision Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase font-mono block mb-1.5">
              CALA Statutory Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision("APPROVE")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  decision === "APPROVE"
                    ? "bg-[#138808] text-white border-emerald-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>Approve Stage</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision("REWORK")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  decision === "REWORK"
                    ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Request Rework</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision("REJECT")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  decision === "REJECT"
                    ? "bg-red-600 text-white border-red-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <X className="h-4 w-4" />
                <span>Reject Proposal</span>
              </button>
            </div>
          </div>

          {/* Scrutiny Remarks & Audit Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase font-mono block mb-1">
              Scrutiny Remarks & Order Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={scrutinyRemarks}
              onChange={(e) => setScrutinyRemarks(e.target.value)}
              placeholder="Enter official scrutiny remarks, conditions of approval, or specific clarification items required from Project Agency..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Remarks are sealed to the immutable statutory audit trail with your CALA digital credentials.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isSuccess}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                isSuccess ? "bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Statutory Order Recorded</span>
                </>
              ) : isSubmitting ? (
                <span>Recording Decision...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Statutory Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
