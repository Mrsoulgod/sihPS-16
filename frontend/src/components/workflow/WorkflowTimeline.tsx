"use client";

import React, { useState } from "react";
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
  Check,
} from "lucide-react";

interface WorkflowTimelineProps {
  timeline: ProjectWorkflowTimelineResponse;
  onOpenTransitionModal: () => void;
}

export function WorkflowTimeline({ timeline, onOpenTransitionModal }: WorkflowTimelineProps) {
  const stages = Array.isArray(timeline?.stages) ? timeline.stages : [];
  const currentStage = stages.find((s) => s.stage_code === timeline?.current_stage) || stages[0];
  const [justTransitioned, setJustTransitioned] = useState(false);

  const allowedTransitions = Array.isArray(timeline?.allowed_transitions) ? timeline.allowed_transitions : [];
  const isCurrentUserAuthorized = Boolean(timeline?.can_current_user_transition && allowedTransitions.length > 0);
  const primaryRole = currentStage?.assigned_role || "Authorized Authority";
  const overallProgress = timeline?.overall_progress_percent ?? 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Header & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configurable Acquisition Workflow & Compliance Engine
            </span>
            <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700 font-mono">
              12 Statutory Stages
            </span>
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 mt-1">
            {timeline?.project_title || "Corridor Workflow"} ({timeline?.project_code || "PRJ"})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance monitoring, statutory SLA tracking, and authorized stage transitions
          </p>
        </div>

        {/* Transition Action Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {overallProgress >= 100 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>✓ All 12 Stages Completed</span>
            </div>
          ) : isCurrentUserAuthorized ? (
            <button
              type="button"
              onClick={onOpenTransitionModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#138808] text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-all hover:shadow-sm"
            >
              <span>Execute Stage Action</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Awaiting {primaryRole} Action</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Stage Highlight Banner */}
      {currentStage && (
        <div
          className={`p-4 rounded-lg border transition-all ${
            currentStage.is_overdue
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "bg-emerald-50/50 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${
                    currentStage.is_overdue
                      ? "bg-rose-100 text-rose-800 border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {currentStage.is_overdue ? "⚠️ Overdue SLA" : "Active Stage"}
                </span>
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  Stage {currentStage.sequence_order} of 12
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {currentStage.stage_name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Primary Authority: <strong className="text-slate-800 font-mono">{currentStage.assigned_role}</strong>
              </p>
            </div>

            <div className="sm:text-right text-xs">
              <div className="text-slate-500">Statutory SLA Deadline:</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                {currentStage.due_date ? new Date(currentStage.due_date).toLocaleDateString("en-IN") : "Not Set"}
              </div>
              <div className="mt-1 font-mono">
                {currentStage.days_remaining !== null && currentStage.days_remaining !== undefined ? (
                  currentStage.days_remaining < 0 ? (
                    <span className="font-bold text-rose-700">
                      {Math.abs(currentStage.days_remaining)} days overdue
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-800">
                      {currentStage.days_remaining} days remaining
                    </span>
                  )
                ) : (
                  <span className="text-slate-500">SLA: {currentStage.sla_deadline_days} days</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12-Stage Visual Progress Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700 font-mono">
            Acquisition Progression Pipeline
          </span>
          <span className="font-mono text-slate-500 font-semibold">
            {timeline.overall_progress_percent}% Statutory Completion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {timeline.stages.map((stage) => {
            const isCompleted = stage.status === "COMPLETED";
            const isInProgress = stage.status === "IN_PROGRESS";
            const isBlocked = stage.status === "BLOCKED";

            return (
              <div
                key={stage.stage_code}
                className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between gap-2.5 transition-all ${
                  isCompleted
                    ? "bg-emerald-50/20 border-emerald-200"
                    : isInProgress
                    ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                    : isBlocked
                    ? "bg-rose-50/40 border-rose-300"
                    : "bg-slate-50/60 border-slate-200 text-slate-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      STEP #{String(stage.sequence_order).padStart(2, "0")}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                        <CheckCircle2 className="h-3 w-3" />
                        COMPLETED
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-900 bg-emerald-200/70 px-1.5 py-0.5 rounded font-mono animate-pulse">
                        CURRENT
                      </span>
                    ) : isBlocked ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded font-mono">
                        <AlertTriangle className="h-3 w-3" />
                        REWORK
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        PENDING
                      </span>
                    )}
                  </div>

                  <h5
                    className={`font-bold leading-snug ${
                      isCompleted || isInProgress ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {stage.stage_name}
                  </h5>

                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Role: <span className="text-slate-700">{stage.assigned_role}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>SLA: {stage.sla_deadline_days}d</span>
                  {isCompleted && stage.completed_at ? (
                    <span className="text-emerald-700 font-semibold">
                      Done {new Date(stage.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  ) : isInProgress && stage.days_remaining !== null ? (
                    <span className={stage.is_overdue ? "text-rose-600 font-bold" : "text-emerald-700 font-semibold"}>
                      {stage.days_remaining}d left
                    </span>
                  ) : (
                    <span>Scheduled</span>
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
