"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/context/NotificationContext";
import { ActionCard } from "@/components/action-center/ActionCard";
import { ActionExecutionModal } from "@/components/action-center/ActionExecutionModal";
import { getActionCenterSummary, executeAction } from "@/lib/api/action_center";
import {
  ActionCenterSummaryResponse,
  ActionItemResponse,
  AvailableActionOption,
} from "@/lib/types/action_center";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  RotateCcw,
  Send,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ShieldAlert,
  Building2,
  Calendar,
  History,
  ArrowRight,
} from "lucide-react";

type ActionTab = "my_actions" | "in_progress" | "returned_rework" | "forwarded" | "completed" | "activity";

export default function ActionCentrePage() {
  const { user } = useAuth();
  const { forwardActionNotification } = useNotifications();
  const [summary, setSummary] = useState<ActionCenterSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActionTab>("my_actions");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Action Modal State
  const [modalItem, setModalItem] = useState<ActionItemResponse | null>(null);
  const [modalAction, setModalAction] = useState<AvailableActionOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = async (isRef = false) => {
    try {
      if (isRef) setIsRefreshing(true);
      else setIsLoading(true);
      const res = await getActionCenterSummary();
      setSummary(res);
    } catch (err) {
      console.error("Failed to load Action Centre summary:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleQuickAction = (item: ActionItemResponse) => {
    setModalItem(item);
    // Provide primary action fallback
    const fallbackAction: AvailableActionOption = item.primary_action || {
      action: "APPROVE",
      label: `Execute ${item.action_type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
      description: item.required_action_summary,
      permission: "EXECUTE_ACTION",
      requires_remarks: true,
      requires_rejection_reason: false,
      requires_document: false,
      requires_confirmation: true,
      is_primary: true,
      badge_variant: "primary",
    };
    setModalAction(fallbackAction);
    setIsModalOpen(true);
  };

  const handleExecuteModal = async (payload: any) => {
    if (!modalItem) return;
    await executeAction(modalItem.id, payload);

    // Forward notification to next authority in the statutory chain
    const sourceName = user?.full_name || user?.role_name || "Competent Authority";
    const targetRole = payload.target_authority_role || modalItem.assigned_to_role || "ROLE_DISTRICT_CALA";
    const actionLabel = payload.action === "APPROVE" 
      ? "Statutory Approval Granted" 
      : payload.action === "REQUEST_REWORK" 
      ? "Statutory Correction Dispatched" 
      : payload.action === "FORWARD" 
      ? "Forwarded to Higher Authority" 
      : "Workflow Action Executed";

    forwardActionNotification(
      sourceName,
      targetRole,
      `${actionLabel}: ${modalItem.title}`,
      payload.remarks || payload.rework_reason || `Action ${modalItem.action_type} executed for ${modalItem.record_type} ${modalItem.record_reference}.`,
      modalItem.project_code || modalItem.record_reference || "STATUTORY",
      "/action-centre",
      "STATUTORY_ACTION"
    );

    await fetchSummary(true);
  };

  if (isLoading || !summary) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Determine current active list
  let currentList: ActionItemResponse[] = [];
  if (activeTab === "my_actions") currentList = summary.my_actions;
  else if (activeTab === "in_progress") currentList = summary.in_progress;
  else if (activeTab === "returned_rework") currentList = summary.returned_rework;
  else if (activeTab === "forwarded") currentList = summary.forwarded;
  else if (activeTab === "completed") currentList = summary.completed;

  // Filter by search & priority
  const filteredList = currentList.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.record_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.project_code && item.project_code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === "ALL" || item.priority.toUpperCase() === priorityFilter.toUpperCase();

    return matchesSearch && matchesPriority;
  });

  const tabItems = [
    { id: "my_actions", label: "Requires My Action", count: summary.kpis.requires_action, icon: CheckSquare },
    { id: "in_progress", label: "In Progress", count: summary.kpis.in_progress, icon: Clock },
    { id: "returned_rework", label: "Returned / Rework", count: summary.kpis.returned_rework, icon: RotateCcw },
    { id: "forwarded", label: "Forwarded", count: summary.kpis.forwarded, icon: Send },
    { id: "completed", label: "Completed", count: summary.kpis.completed, icon: CheckCircle2 },
    { id: "activity", label: "Activity Log", count: summary.recent_activity.length, icon: History },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. ACTION CENTRE TOP BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                WORK EXECUTION PLATFORM
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {user?.jurisdiction_name || "Statutory Operational Scope"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1.5">
              Action Centre & Case Workflow
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Active operations assigned to <strong className="text-slate-900">{user?.full_name}</strong> ({user?.role_name || user?.role_id})
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => fetchSummary(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Refresh Actions"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE ACTION KPI CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div
          onClick={() => setActiveTab("my_actions")}
          className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
            activeTab === "my_actions"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Requires Action</span>
          <p className="text-xl font-bold font-serif text-amber-950 mt-0.5">{summary.kpis.requires_action}</p>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Overdue</span>
          <p className="text-xl font-bold font-serif text-rose-950 mt-0.5">{summary.kpis.overdue}</p>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Due Soon</span>
          <p className="text-xl font-bold font-serif text-amber-950 mt-0.5">{summary.kpis.due_soon}</p>
        </div>

        <div className="p-3 rounded-xl border bg-white border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">High Priority</span>
          <p className="text-xl font-bold font-serif text-rose-950 mt-0.5">{summary.kpis.high_priority}</p>
        </div>

        <div
          onClick={() => setActiveTab("in_progress")}
          className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
            activeTab === "in_progress"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-blue-800 block">In Progress</span>
          <p className="text-xl font-bold font-serif text-blue-950 mt-0.5">{summary.kpis.in_progress}</p>
        </div>

        <div
          onClick={() => setActiveTab("returned_rework")}
          className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
            activeTab === "returned_rework"
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-rose-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-rose-800 block">Rework</span>
          <p className="text-xl font-bold font-serif text-rose-950 mt-0.5">{summary.kpis.returned_rework}</p>
        </div>

        <div
          onClick={() => setActiveTab("forwarded")}
          className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
            activeTab === "forwarded"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-500/20"
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-purple-800 block">Forwarded</span>
          <p className="text-xl font-bold font-serif text-purple-950 mt-0.5">{summary.kpis.forwarded}</p>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
            activeTab === "completed"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Completed</span>
          <p className="text-xl font-bold font-serif text-emerald-950 mt-0.5">{summary.kpis.completed}</p>
        </div>
      </div>

      {/* 3. SEGMENTED QUEUE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActionTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#138808]" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? "bg-emerald-100 text-emerald-900 font-bold" : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. SEARCH & FILTER CONTROLS (Only on Task Queue Views) */}
      {activeTab !== "activity" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Action Title, Khasra, PAF ID, or Project Code..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 bg-white font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>
          </div>
        </div>
      )}

      {/* 5. ACTIVE QUEUE VIEW */}
      {activeTab !== "activity" ? (
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-[#138808] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                No Actions in this Queue
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || priorityFilter !== "ALL"
                  ? "No tasks match your current search and filter criteria."
                  : "All operational items for this queue have been processed or moved forward."}
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <ActionCard
                key={item.id}
                item={item}
                onQuickAction={handleQuickAction}
              />
            ))
          )}
        </div>
      ) : (
        /* ACTIVITY LOG TAB */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <span>Recent Operational Activity & Workflow Transitions</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {summary.recent_activity.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {act.project}
                    </span>
                  </div>
                  <p className="text-slate-600">{act.details}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    By {act.user} ({act.role})
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {modalItem && modalAction && (
        <ActionExecutionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          actionOption={modalAction}
          actionItem={modalItem}
          onExecute={handleExecuteModal}
        />
      )}
    </div>
  );
}
