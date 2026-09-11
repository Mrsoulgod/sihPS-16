"use client";

import React from "react";
import Link from "next/link";
import { ActionItemResponse } from "@/lib/types/action_center";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  MapPin,
  Calendar,
  Layers,
  RotateCcw,
  Send,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface ActionCardProps {
  item: ActionItemResponse;
  onQuickAction?: (item: ActionItemResponse) => void;
}

export function ActionCard({ item, onQuickAction }: ActionCardProps) {
  // Status styling
  const getStatusBadge = () => {
    switch (item.status) {
      case "PENDING":
      case "ASSIGNED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            REQUIRES ACTION
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            IN PROGRESS
          </span>
        );
      case "REWORK_REQUIRED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
            REWORK REQUIRED
          </span>
        );
      case "FORWARDED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            FORWARDED
          </span>
        );
      case "COMPLETED":
      case "SUBMITTED":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {item.status}
          </span>
        );
    }
  };

  // Priority styling
  const getPriorityBadge = () => {
    switch (item.priority) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 font-mono">
            <ShieldAlert className="h-3 w-3" />
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
            <AlertTriangle className="h-3 w-3" />
            HIGH
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200 font-mono">
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3 group">
      {/* Top Header Row */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {item.record_type}
            </span>
            <span className="text-xs font-semibold text-slate-900 font-mono">
              {item.record_reference}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {getPriorityBadge()}
            {getStatusBadge()}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Rework alert if present */}
        {item.rework_reason && (
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong className="font-semibold">Correction Required:</strong> {item.rework_reason}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Badges & Timelines */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          {item.project_code && (
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {item.project_code}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-600">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            {item.workflow_stage_name}
          </span>
          <span
            className={`flex items-center gap-1 font-medium ${
              item.is_overdue
                ? "text-rose-700 font-bold"
                : item.sla_days_remaining !== undefined && item.sla_days_remaining <= 5
                ? "text-amber-700 font-semibold"
                : "text-slate-600"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {item.is_overdue
              ? "OVERDUE"
              : item.sla_days_remaining !== undefined
              ? `${item.sla_days_remaining}d SLA`
              : "On Track"}
          </span>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2">
          {item.status === "COMPLETED" || item.status === "APPROVED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Action Done</span>
            </span>
          ) : item.status === "FORWARDED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs">
              <Send className="h-3.5 w-3.5 text-purple-600" />
              <span>Forwarded</span>
            </span>
          ) : (
            onQuickAction && (
              <button
                type="button"
                onClick={() => onQuickAction(item)}
                className="px-3 py-1.5 rounded-lg bg-[#138808] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Take Action
              </button>
            )
          )}

          <Link
            href={`/action-centre/task/${item.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors"
          >
            <span>Open Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
