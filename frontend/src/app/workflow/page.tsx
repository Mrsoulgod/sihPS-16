"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWorkflowTasks, useActionWorkflowTask } from "@/lib/hooks/useWorkflow";
import { useProjects } from "@/lib/hooks/useProjects";
import {
  GitMerge,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Layers,
  ArrowRight,
  Check,
  UserCheck,
} from "lucide-react";

export default function WorkflowTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [projectFilter, setProjectFilter] = useState<string>("");

  const { data: tasks, isLoading, error } = useWorkflowTasks(projectFilter || undefined);
  const { data: projectList } = useProjects();
  const projects = projectList || [];
  const actionTaskMutation = useActionWorkflowTask();

  const filteredTasks = (tasks || []).filter((task) => {
    if (statusFilter === "ALL") return true;
    return task.status === statusFilter;
  });

  const pendingCount = (tasks || []).filter((t) => t.status === "PENDING").length;
  const inReviewCount = (tasks || []).filter((t) => t.status === "IN_REVIEW").length;
  const completedCount = (tasks || []).filter((t) => t.status === "COMPLETED").length;

  const handleResolveTask = async (taskId: string, action: string) => {
    try {
      await actionTaskMutation.mutateAsync({
        taskId,
        action,
        remarks: "Resolved via Workflow Task Inbox",
      });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-primary-700" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Acquisition Workflow & Task Inbox
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Actionable statutory tasks, verification orders, scrutiny clearance requests, and deadline tracking.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-500">Pending Actions</span>
            <p className="text-sm font-bold text-amber-600">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-500">In Review</span>
            <p className="text-sm font-bold text-blue-600">{inReviewCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500">Completed</span>
            <p className="text-sm font-bold text-green-600">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "IN_REVIEW", label: `In Review (${inReviewCount})` },
            { id: "COMPLETED", label: `Completed (${completedCount})` },
            { id: "ALL", label: "All Tasks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-1 min-w-[220px] ml-auto">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <AlertTriangle className="h-6 w-6 mx-auto text-red-500 mb-2" />
          Failed to load workflow tasks.
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
          <h3 className="text-sm font-semibold text-gray-800">All Workflow Tasks Clear</h3>
          <p className="text-xs text-gray-500 mt-1">
            No active tasks found matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue =
              task.due_date && new Date(task.due_date) < new Date() && task.status !== "COMPLETED";

            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-primary-300 transition-all"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : task.priority === "HIGH"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span className="font-mono text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {task.task_type}
                    </span>

                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        OVERDUE
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    {task.project_code && (
                      <Link
                        href={`/projects/${task.project_id}`}
                        className="flex items-center gap-1 font-semibold text-primary-700 hover:underline"
                      >
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {task.project_code}
                      </Link>
                    )}
                    {task.khasra_number && task.parcel_id && (
                      <Link
                        href={`/land-parcels/${task.parcel_id}`}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        <Layers className="h-3.5 w-3.5 text-gray-400" />
                        Khasra #{task.khasra_number}
                      </Link>
                    )}
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                      Role: <strong className="text-gray-700 ml-0.5">{task.assigned_role}</strong>
                    </span>
                    {task.due_date && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? "font-bold text-red-600" : "text-gray-500"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Due: {new Date(task.due_date).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {task.parcel_id && (
                    <Link
                      href={`/land-parcels/${task.parcel_id}`}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Parcel
                      <ArrowRight className="h-3.5 w-3.5 ml-1 text-gray-400" />
                    </Link>
                  )}

                  {task.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => handleResolveTask(task.id, "COMPLETE")}
                      disabled={actionTaskMutation.isPending}
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
