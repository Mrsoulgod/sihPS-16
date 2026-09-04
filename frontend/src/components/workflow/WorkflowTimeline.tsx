"use client";

import React from "react";
import { ProjectWorkflowTimelineResponse, ProjectStageItem } from "@/lib/types/workflow";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Building,
  UserCheck,
  RotateCcw,
} from "lucide-react";

interface WorkflowTimelineProps {
  timeline: ProjectWorkflowTimelineResponse;
  onOpenTransitionModal: () => void;
}

export function WorkflowTimeline({ timeline, onOpenTransitionModal }: WorkflowTimelineProps) {
  const currentStage = timeline.stages.find((s) => s.stage_code === timeline.current_stage);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Header & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configurable Acquisition Workflow & Compliance Engine
            </span>
            <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
              12 Statutory Stages
            </span>
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 mt-1">
            {timeline.project_title} ({timeline.project_code})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance monitoring, statutory SLA tracking, and authorized stage transitions
          </p>
        </div>

        {/* Transition Action Trigger */}
        {timeline.can_current_user_transition && timeline.allowed_transitions.length > 0 && (
          <button
            type="button"
            onClick={onOpenTransitionModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#138808] text-white font-medium text-xs shadow hover:bg-emerald-700 transition-colors shrink-0"
          >
            <span>Execute Stage Action</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Current Stage Highlight Banner */}
      {currentStage && (
        <div
          className={`p-4 rounded-lg border ${
            currentStage.is_overdue
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "bg-emerald-50/50 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    currentStage.is_overdue
                      ? "bg-rose-100 text-rose-800 border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {currentStage.is_overdue ? "⚠️ Overdue SLA" : "Active Stage"}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Stage {currentStage.sequence_order} of 12
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {currentStage.stage_name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Primary Authority: <strong className="text-slate-800">{currentStage.assigned_role}</strong>
              </p>
            </div>

            <div className="sm:text-right text-xs">
              <div className="text-slate-500">Statutory SLA Deadline:</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {currentStage.due_date ? new Date(currentStage.due_date).toLocaleDateString("en-IN") : "Not Set"}
              </div>
              <div className="mt-1">
                {currentStage.days_remaining !== null && currentStage.days_remaining !== undefined ? (
                  currentStage.days_remaining < 0 ? (
                    <span className="font-bold text-rose-700">
                      Overdue by {Math.abs(currentStage.days_remaining)} days
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-800">
                      {currentStage.days_remaining} days remaining
                    </span>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12-Stage Visual Stepper Timeline */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Acquisition Progression Pipeline
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {timeline.stages.map((stage) => {
            const isCompleted = stage.status === "COMPLETED";
            const isCurrent = stage.stage_code === timeline.current_stage;
            const isBlocked = stage.status === "BLOCKED" || stage.status === "REJECTED";
            const isOverdue = stage.is_overdue;

            let cardBorder = "border-slate-200 bg-white";
            let badgeBg = "bg-slate-100 text-slate-600";

            if (isCompleted) {
              cardBorder = "border-emerald-200/80 bg-emerald-50/20";
              badgeBg = "bg-emerald-100 text-emerald-800";
            } else if (isCurrent) {
              cardBorder = isOverdue
                ? "border-rose-300 bg-rose-50/20 ring-1 ring-rose-300"
                : "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500";
              badgeBg = isOverdue ? "bg-rose-100 text-rose-800" : "bg-emerald-600 text-white";
            } else if (isBlocked) {
              cardBorder = "border-amber-300 bg-amber-50/30";
              badgeBg = "bg-amber-100 text-amber-800";
            }

            return (
              <div
                key={stage.stage_code}
                className={`p-3.5 rounded-lg border transition-all ${cardBorder} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STEP {stage.sequence_order.toString().padStart(2, "0")}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeBg}`}>
                      {isCompleted ? "COMPLETED" : isCurrent ? (isOverdue ? "OVERDUE" : "CURRENT") : stage.status}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1" title={stage.stage_name}>
                    {stage.stage_name}
                  </h5>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    Role: {stage.assigned_role}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>SLA: {stage.sla_deadline_days}d</span>
                  {isCompleted && stage.completed_at ? (
                    <span className="text-emerald-700 font-medium">
                      Done {new Date(stage.completed_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  ) : isCurrent && stage.days_remaining !== undefined && stage.days_remaining !== null ? (
                    <span className={stage.is_overdue ? "text-rose-700 font-bold" : "text-emerald-800 font-medium"}>
                      {stage.days_remaining < 0 ? `-${Math.abs(stage.days_remaining)}d` : `${stage.days_remaining}d left`}
                    </span>
                  ) : (
                    <span className="text-slate-400">Scheduled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
