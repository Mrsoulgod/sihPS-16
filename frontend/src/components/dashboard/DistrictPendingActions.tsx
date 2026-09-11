"use client";

import React, { useState } from "react";
import { DistrictActionItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  FileCheck,
} from "lucide-react";

interface DistrictPendingActionsProps {
  tasks?: DistrictActionItem[];
  onOpenProposalModal?: (projectId: string, projectTitle: string) => void;
}

export function DistrictPendingActions({
  tasks = [],
  onOpenProposalModal,
}: DistrictPendingActionsProps) {
  const [filterSla, setFilterSla] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort tasks: OVERDUE first, then DUE_SOON, then NORMAL
  const sortedTasks = [...tasks].sort((a, b) => {
    const order: Record<string, number> = {
      OVERDUE: 1,
      DUE_SOON: 2,
      NORMAL: 3,
    };
    const slaA = a.sla_status || "NORMAL";
    const slaB = b.sla_status || "NORMAL";
    const orderA = order[slaA] || 4;
    const orderB = order[slaB] || 4;
    if (orderA !== orderB) return orderA - orderB;

    const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
    return dateA - dateB;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    const slaStatus = task.sla_status || "NORMAL";
    if (filterSla !== "ALL" && slaStatus !== filterSla) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (task.task_title || task.task_name || "").toLowerCase();
      const projectTitle = (task.project_title || "").toLowerCase();
      const stage = (task.stage_name || task.stage || "").toLowerCase();
      return title.includes(q) || projectTitle.includes(q) || stage.includes(q);
    }
    return true;
  });

  const overdueCount = tasks.filter((t) => (t.sla_status || "") === "OVERDUE").length;
  const dueSoonCount = tasks.filter((t) => (t.sla_status || "") === "DUE_SOON").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>MY PENDING ACTIONS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                {tasks.length} Assigned
              </span>
            </h3>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                <AlertOctagon className="h-3 w-3" />
                {overdueCount} Overdue
              </span>
            )}
            {dueSoonCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="h-3 w-3" />
                {dueSoonCount} Due Soon
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational work queue requiring your statutory review, scrutiny, or authorization
          </p>
        </div>

        {/* SLA Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterSla("ALL")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterSla === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSla("OVERDUE")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterSla === "OVERDUE"
                ? "bg-red-600 text-white"
                : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSla("DUE_SOON")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterSla === "DUE_SOON"
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            Due Soon ({dueSoonCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No Pending Tasks</p>
          <p className="text-xs text-slate-500 mt-0.5">
            All acquisition tasks in this view are completed or up-to-date.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase font-mono">
                <th className="py-2.5 px-4">Task & Responsibility</th>
                <th className="py-2.5 px-4">Project & Stage</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.map((task, idx) => {
                const taskId = task.task_id || task.id || `task-${idx}`;
                const taskTitle = task.task_title || task.task_name || "Statutory Review";
                const stageName = task.stage_name || task.stage || "IN_PROGRESS";
                const slaStatus = task.sla_status || "NORMAL";
                const isOverdue = slaStatus === "OVERDUE";
                const isDueSoon = slaStatus === "DUE_SOON";
                const priority = (task.priority || "MEDIUM").toUpperCase();
                const dueDateDisplay = task.due_date ? String(task.due_date).substring(0, 10) : "N/A";
                const createdAtDisplay = task.created_at ? String(task.created_at).substring(0, 10) : "N/A";
                const actionUrl = task.action_url || task.target_route || (task.project_id ? `/projects/${task.project_id}` : "/action-centre");

                return (
                  <tr
                    key={taskId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isOverdue
                        ? "bg-red-50/20"
                        : isDueSoon
                        ? "bg-amber-50/20"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {taskTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">ID: {taskId}</span>
                        <span>•</span>
                        <span>Created: {createdAtDisplay}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={task.project_id ? `/projects/${task.project_id}` : "#"}
                        className="font-medium text-emerald-800 hover:text-emerald-950 hover:underline"
                      >
                        {task.project_title || "Project"}
                      </Link>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Stage: {stageName}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          priority === "CRITICAL"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : priority === "HIGH"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      {dueDateDisplay}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded ${
                          isOverdue
                            ? "bg-red-600 text-white font-mono uppercase"
                            : isDueSoon
                            ? "bg-amber-500 text-white font-mono uppercase"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono uppercase"
                        }`}
                      >
                        {isOverdue && <AlertOctagon className="h-3 w-3" />}
                        {isDueSoon && <Clock className="h-3 w-3" />}
                        {slaStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {task.status === "COMPLETED" || task.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Done</span>
                        </span>
                      ) : taskTitle.toLowerCase().includes("proposal") && onOpenProposalModal ? (
                        <button
                          type="button"
                          onClick={() => onOpenProposalModal(task.project_id, task.project_title || "Project")}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-[#138808] text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Scrutinize</span>
                        </button>
                      ) : (
                        <Link
                          href={actionUrl}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-colors"
                        >
                          <span>Process</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
