"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchFieldTasks, startFieldTask } from "@/lib/api/field";
import { FieldTask } from "@/lib/types/field";
import {
  ClipboardCheck,
  Search,
  Filter,
  RefreshCw,
  PlayCircle,
  RotateCcw,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpDown,
} from "lucide-react";

export default function FieldTasksPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get("status") || "ALL";

  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFieldTasks({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        priority: selectedPriority === "ALL" ? undefined : selectedPriority,
      });
      setTasks(data);
    } catch (err: any) {
      console.error("Failed to load field tasks:", err);
      setError(err.message || "Failed to load field tasks from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedStatus, selectedPriority]);

  const handleStartTask = async (taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setActionLoadingId(taskId);
      await startFieldTask(taskId);
      await loadTasks();
    } catch (err: any) {
      alert("Failed to start task: " + (err.message || "Unknown error"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.khasra_number && t.khasra_number.toLowerCase().includes(q)) ||
      (t.village_name && t.village_name.toLowerCase().includes(q)) ||
      (t.project_title && t.project_title.toLowerCase().includes(q)) ||
      (t.project_code && t.project_code.toLowerCase().includes(q)) ||
      (t.owner_name && t.owner_name.toLowerCase().includes(q))
    );
  });

  const statusTabs = [
    { id: "ALL", label: "All Tasks" },
    { id: "ASSIGNED", label: "Assigned" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "REWORK_REQUIRED", label: "Rework Required" },
    { id: "SUBMITTED", label: "Submitted" },
    { id: "OVERDUE", label: "Overdue" },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                FIELD WORK QUEUE
              </span>
              <span className="text-xs text-slate-500 font-medium">Tehsil Kotputli, Jaipur</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
              My Field Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned cadastral parcel inspections, 8-point statutory verification, and CALA rework items.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadTasks();
              }}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/field/parcels"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Assigned Parcels</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Priority Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Khasra number, Village, Owner, or Project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TASK LIST / CARDS */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-xl border border-rose-200">
          <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 mt-2">Error Loading Tasks</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
          <button
            type="button"
            onClick={loadTasks}
            className="mt-4 px-4 py-2 bg-[#138808] text-white text-xs font-semibold rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 mt-3">No Tasks Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? `No field tasks match "${searchQuery}".`
              : "No field tasks found for the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isRework = t.status === "REWORK_REQUIRED";
            const isInProg = t.status === "IN_PROGRESS";
            const isSubmitted = t.status === "SUBMITTED" || t.status === "COMPLETED";
            const isAssigned = t.status === "ASSIGNED" || t.status === "PENDING";

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm ${
                  isRework
                    ? "border-amber-300 bg-amber-50/30"
                    : t.is_overdue
                    ? "border-rose-300 bg-rose-50/20"
                    : isInProg
                    ? "border-blue-200 bg-blue-50/20"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badges & Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                          isRework
                            ? "bg-amber-200 text-amber-900 border border-amber-300"
                            : isSubmitted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isInProg
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>

                      {t.is_overdue && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                          Overdue SLA
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.priority === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : t.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority}
                      </span>

                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        • {t.task_type}
                      </span>
                    </div>

                    {/* Title & Khasra */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Khasra {t.khasra_number || "412/1"}</span>
                        <span className="text-xs font-normal text-slate-500">
                          ({t.village_name || "Manpura"}, {t.tehsil_name || "Kotputli"})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {t.project_title} • Code: {t.project_code}
                      </p>
                    </div>

                    {/* Geography & Owner Breakdown */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>Area: <strong className="text-slate-800">{t.area_acres || 1.25} Acres</strong></span>
                      <span>•</span>
                      <span>Land Type: <strong className="text-slate-800">{t.land_type?.replace("_", " ") || "Agricultural"}</strong></span>
                      <span>•</span>
                      <span>Primary Title Holder: <strong className="text-slate-800">{t.owner_name || "Sh. Rameshwar Meena"}</strong></span>
                    </div>

                    {/* Rework Notice */}
                    {isRework && t.rework_reason && (
                      <div className="mt-2 p-2.5 bg-amber-100/80 border border-amber-300 rounded-lg text-xs text-amber-950">
                        <strong className="block text-amber-900 mb-0.5">CALA Correction Request:</strong>
                        {t.rework_reason}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left lg:text-right text-xs text-slate-500">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">Due Date</span>
                      <strong className={`font-mono ${t.is_overdue ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                        {t.due_date || "2026-09-20"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAssigned && (
                        <button
                          type="button"
                          onClick={(e) => handleStartTask(t.id, e)}
                          disabled={actionLoadingId === t.id}
                          className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-black text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>{actionLoadingId === t.id ? "Starting..." : "Start Task"}</span>
                        </button>
                      )}

                      <Link
                        href={`/field/tasks/${t.id}`}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 ${
                          isRework
                            ? "bg-amber-700 text-white hover:bg-amber-800"
                            : isInProg
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : isSubmitted
                            ? "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                            : "bg-[#138808] text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isRework ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Correct & Resubmit</span>
                          </>
                        ) : isInProg ? (
                          <>
                            <Compass className="h-3.5 w-3.5" />
                            <span>Continue Survey</span>
                          </>
                        ) : isSubmitted ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>View Submitted</span>
                          </>
                        ) : (
                          <>
                            <Compass className="h-3.5 w-3.5" />
                            <span>Open Workspace</span>
                          </>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Link>
                    </div>
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
