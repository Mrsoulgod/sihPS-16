"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ActionWorkspaceResponse, AvailableActionOption } from "@/lib/types/action_center";
import { ActionExecutionModal } from "./ActionExecutionModal";
import { executeAction } from "@/lib/api/action_center";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  FileText,
  History,
  ShieldCheck,
  Send,
  RotateCcw,
  UserCheck,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";

interface ActionWorkspaceProps {
  data: ActionWorkspaceResponse;
  onRefresh?: () => void;
}

export function ActionWorkspace({ data, onRefresh }: ActionWorkspaceProps) {
  const [selectedAction, setSelectedAction] = useState<AvailableActionOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  const {
    action_item: item,
    case_summary,
    required_action,
    record_information,
    available_actions,
    remarks_history,
    documents,
    workflow_timeline,
    audit_history,
  } = data;

  const handleOpenActionModal = (action: AvailableActionOption) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleExecute = async (payload: any) => {
    await executeAction(item.id, payload);
    setIsActionCompleted(true);
    setSuccessToast(`Action "${payload.action}" executed successfully.`);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/action-centre"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Action Centre</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
            WORK EXECUTION DESK
          </span>
          <span className="text-xs font-mono font-semibold text-slate-700">
            ID: {item.id.slice(0, 12)}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. CASE / RECORD SUMMARY BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {item.record_type}
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {item.record_reference}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === "REWORK_REQUIRED"
                    ? "bg-rose-100 text-rose-900 border border-rose-200"
                    : item.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    : "bg-amber-100 text-amber-900 border border-amber-200"
                }`}
              >
                {item.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-2">
              {item.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Project: <strong className="text-slate-800">{item.project_code}</strong> • {item.project_title}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs font-mono">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-500 uppercase block">Stage</span>
              <span className="font-bold text-slate-900 truncate block max-w-[140px]" title={item.workflow_stage_name}>
                {item.workflow_stage_name}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-500 uppercase block">SLA</span>
              <span
                className={`font-bold flex items-center justify-center gap-1 ${
                  item.is_overdue
                    ? "text-rose-700"
                    : item.sla_days_remaining !== undefined && item.sla_days_remaining <= 5
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                <Clock className="h-3 w-3" />
                {item.is_overdue ? "OVERDUE" : `${item.sla_days_remaining || 14}d`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC ACTION PANEL (Real Operational Action Buttons) */}
        <div className="pt-1">
          <p className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>Authorized Operations for Your Role:</span>
          </p>

          {isActionCompleted || item.status === "COMPLETED" || item.status === "APPROVED" ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-sm">Action Successfully Completed & Recorded</p>
                <p className="text-[11px] text-emerald-800 font-normal mt-0.5">
                  Statutory state machine advanced and audit log created. No further action pending on this task for your role.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {available_actions.map((act) => {
                const isPrimary = act.is_primary;
                const isDanger = act.badge_variant === "danger";
                const isWarning = act.badge_variant === "warning";

                return (
                  <button
                    key={act.action}
                    type="button"
                    onClick={() => handleOpenActionModal(act)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 ${
                      isDanger
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : isWarning
                        ? "bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-400"
                        : isPrimary
                        ? "bg-[#138808] hover:bg-[#0f6c06] text-white ring-2 ring-[#138808]/30"
                        : "bg-slate-800 hover:bg-slate-900 text-white"
                    }`}
                  >
                    {isDanger ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : isWarning ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. REQUIRED ACTION DIRECTIVE CARD */}
      <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm font-serif">
          <HelpCircle className="h-4 w-4 text-emerald-700" />
          <h3>Statutory Required Action Directive</h3>
          {required_action.statutory_reference && (
            <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 ml-auto">
              {required_action.statutory_reference}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800">
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-emerald-100">
            <p className="font-bold text-slate-900">What needs to be done:</p>
            <p className="text-slate-600">{required_action.what_needs_to_be_done}</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-emerald-100">
            <p className="font-bold text-slate-900">Why it is required:</p>
            <p className="text-slate-600">{required_action.why_it_is_required}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800 pt-1">
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-emerald-100">
            <p className="font-bold text-slate-900">Required Information / Documents:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              {required_action.information_or_documents_needed.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-emerald-100">
            <p className="font-bold text-slate-900">What happens after completion:</p>
            <p className="text-slate-600">{required_action.what_happens_after_completion}</p>
          </div>
        </div>
      </div>

      {/* 4. RECORD INFORMATION & GEOGRAPHIC/FINANCIAL METRICS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span>{record_information.title}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {Object.entries(record_information.key_attributes).map(([key, val]) => (
            <div key={key} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-medium uppercase block">{key}</span>
              <span className="font-bold text-slate-900 font-mono mt-0.5 block truncate">
                {String(val)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial & Geographic breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {record_information.financial_details && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs">
              <p className="font-bold text-slate-900 font-serif">Financial & Solatium Overview:</p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {Object.entries(record_information.financial_details).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[10px] text-slate-500 uppercase block">{k}</span>
                    <span className="font-bold text-emerald-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record_information.geographic_details && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs">
              <p className="font-bold text-slate-900 font-serif">Geographic & Cadastral Scope:</p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {Object.entries(record_information.geographic_details).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[10px] text-slate-500 uppercase block">{k}</span>
                    <span className="font-bold text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. DOCUMENTS REPOSITORY (With SHA-256 Hashes) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Supporting Documents & Verification Evidence
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {documents.length} Documents Attached
          </span>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{doc.document_name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                    v{doc.version_number}
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {doc.verification_status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Uploaded by {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
                  {doc.sha256_hash && (
                    <span> • SHA-256: {doc.sha256_hash.slice(0, 12)}...</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. WORKFLOW HISTORY & AUDIT TIMELINE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Remarks History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <span>Operational Remarks History</span>
          </h3>

          <div className="space-y-3 text-xs">
            {remarks_history.map((rem) => (
              <div key={rem.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rem.author_name}</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(rem.timestamp).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-slate-700">{rem.remarks}</p>
                <span className="text-[10px] font-mono text-emerald-800 font-semibold block">
                  Action: {rem.action} ({rem.author_role})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Workflow Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <span>Statutory Transition Milestones</span>
          </h3>

          <div className="space-y-3 text-xs">
            {workflow_timeline.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{evt.stage_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Decision: <strong>{evt.decision}</strong> by {evt.officer_name} ({evt.officer_role})
                  </p>
                  {evt.remarks && <p className="text-slate-700 text-xs italic">"{evt.remarks}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Execution Modal */}
      <ActionExecutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionOption={selectedAction}
        actionItem={item}
        onExecute={handleExecute}
      />
    </div>
  );
}
