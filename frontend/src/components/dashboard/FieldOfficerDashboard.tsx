"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { DashboardSummaryResponse } from "@/lib/types/dashboard";
import { FieldDashboardData, FieldTask } from "@/lib/types/field";
import {
  ClipboardCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  ArrowRight,
  Compass,
  Map as MapIcon,
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Building,
  UserCheck,
  ShieldCheck,
  Camera,
  Info,
  ExternalLink,
} from "lucide-react";

interface FieldOfficerDashboardProps {
  data: DashboardSummaryResponse;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function FieldOfficerDashboard({
  data,
  onRefresh,
  isRefreshing,
}: FieldOfficerDashboardProps) {
  const { user } = useAuth();
  const fieldWork = data.field_work;

  // Fallback demo metrics if backend summary is loading
  const assignedTodayCount = fieldWork?.assigned_today_count ?? 2;
  const pendingCount = fieldWork?.pending_count ?? 4;
  const inProgressCount = fieldWork?.in_progress_count ?? 1;
  const submittedCount = fieldWork?.submitted_count ?? 6;
  const overdueCount = fieldWork?.overdue_count ?? 1;
  const reworkCount = fieldWork?.rework_count ?? 1;
  const totalParcels = fieldWork?.total_assigned_parcels ?? 8;

  const priorityTasks = fieldWork?.priority_tasks || [];
  const reworkTasks = fieldWork?.rework_tasks || [];
  const urgentTasks = fieldWork?.urgent_tasks || [];
  const assignedParcels = fieldWork?.assigned_parcels || [];
  const recentSubmissions = fieldWork?.recent_submissions || [];
  const notifications = fieldWork?.notifications || [];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER SECTION (Mobile-First) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                MY FIELD WORK
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 inline" />
                Jurisdiction: <strong>{data.jurisdiction_name || "Tehsil Kotputli, Jaipur"}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1.5 tracking-tight">
              {user?.full_name ? `Welcome, ${user.full_name}` : "Field Operations Control"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5">
              <span>Designation: <strong className="text-slate-800">{user?.designation || "Senior Revenue Inspector (Patwari)"}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Organization: <strong className="text-slate-800">{user?.organization || "Tehsil Kotputli Revenue Office"}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center text-emerald-800 font-medium gap-1">
                <Compass className="h-3 w-3 inline" /> GPS Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/field/tasks"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#138808] text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>Open Task Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. REWORK ALERT BANNER (If CALA returned verification) */}
      {reworkCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                    Action Required
                  </span>
                  <h3 className="text-sm font-bold text-amber-950">
                    {reworkCount} Verification Rework Request(s) from District CALA
                  </h3>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  CALA Jaipur has sent back field survey observations for boundary alignment clarification. Prior evidence is preserved.
                </p>
              </div>
            </div>

            <Link
              href="/field/tasks?status=REWORK_REQUIRED"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold shadow-sm hover:bg-amber-800 transition-colors shrink-0"
            >
              <span>Review Rework Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. TOP OPERATIONAL METRICS (Large Touch-Friendly Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Assigned Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Today</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">{assignedTodayCount}</span>
            <span className="text-[11px] text-blue-700 font-medium ml-1.5">New</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Survey work assigned</span>
        </div>

        {/* Metric 2: Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">{pendingCount}</span>
            <span className="text-[11px] text-slate-600 font-medium ml-1.5">Awaiting</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Ready for inspection</span>
        </div>

        {/* Metric 3: In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-700">{inProgressCount}</span>
            <span className="text-[11px] text-amber-800 font-medium ml-1.5">Active</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Draft saved / surveying</span>
        </div>

        {/* Metric 4: Submitted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Submitted</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800">{submittedCount}</span>
            <span className="text-[11px] text-emerald-700 font-medium ml-1.5">Under Review</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Sent to District CALA</span>
        </div>

        {/* Metric 5: Overdue */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-700">{overdueCount}</span>
            <span className="text-[11px] text-rose-700 font-medium ml-1.5">SLA Exceeded</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium mt-1">Immediate action needed</span>
        </div>
      </div>

      {/* 4. MY PRIORITY TASKS SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-700" />
              <span>My Priority Field Tasks</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned parcel inspections requiring on-ground GPS tagging and evidence enumeration.
            </p>
          </div>

          <Link
            href="/field/tasks"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
          >
            <span>View All ({priorityTasks.length})</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {priorityTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800 mt-2">All Assigned Field Tasks Completed!</p>
            <p className="text-xs text-slate-500 mt-1">No pending on-ground verifications in your queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityTasks.slice(0, 4).map((t) => {
              const isRework = t.status === "REWORK_REQUIRED";
              const isInProg = t.status === "IN_PROGRESS";
              const isAssigned = t.status === "ASSIGNED" || t.status === "PENDING";

              return (
                <div
                  key={t.id}
                  className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                    isRework
                      ? "bg-amber-50/60 border-amber-300"
                      : isInProg
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Status & Priority Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                            isRework
                              ? "bg-amber-200 text-amber-900 border border-amber-300"
                              : isInProg
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>

                        {t.is_overdue && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            Overdue
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.priority === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : t.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority} Priority
                      </span>
                    </div>

                    {/* Khasra & Title */}
                    <h3 className="text-base font-bold text-slate-900 mt-2.5">
                      Khasra {t.khasra_number || "412/1"}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {t.project_title || "Delhi–Jaipur Expressway Expansion"}
                    </p>

                    {/* Geography & Owner */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Village / Tehsil</span>
                        <strong className="text-slate-800">{t.village_name || "Manpura"}, {t.tehsil_name || "Kotputli"}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Area / Land Type</span>
                        <strong className="text-slate-800">{t.area_acres || "1.25"} Acres • {t.land_type?.replace("_", " ") || "Agricultural"}</strong>
                      </div>
                    </div>

                    {/* Rework note if applicable */}
                    {isRework && t.rework_reason && (
                      <div className="mt-2.5 p-2 bg-amber-100/70 border border-amber-300 rounded text-xs text-amber-900">
                        <strong>Correction Required:</strong> {t.rework_reason}
                      </div>
                    )}
                  </div>

                  {/* Touch Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3 inline text-slate-400" />
                      Due: {t.due_date || "2026-09-20"}
                    </span>

                    <Link
                      href={`/field/tasks/${t.id}`}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all ${
                        isRework
                          ? "bg-amber-700 text-white hover:bg-amber-800"
                          : isInProg
                          ? "bg-blue-700 text-white hover:bg-blue-800"
                          : "bg-[#138808] text-white hover:bg-emerald-700"
                      }`}
                    >
                      {isRework ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Respond to Rework</span>
                        </>
                      ) : isInProg ? (
                        <>
                          <Compass className="h-3.5 w-3.5" />
                          <span>Continue Verification</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>Start Verification</span>
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. ASSIGNED PARCELS QUICK PREVIEW & RECENT SUBMISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assigned Parcels Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapIcon className="h-4.5 w-4.5 text-emerald-700" />
                <span>Assigned Parcels ({totalParcels})</span>
              </h2>
              <Link
                href="/field/parcels"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>View Cadastre</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Ground parcels demarcated in Tehsil Kotputli assigned for survey truthing.
            </p>

            <div className="space-y-2">
              {assignedParcels.slice(0, 4).map((p) => (
                <div
                  key={p.parcel_id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900">Khasra {p.khasra_number}</strong>
                      <span className="text-[10px] text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {p.village_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.area_acres} Acres • {p.primary_owner_name}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      p.verification_status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.verification_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Demarcated: <strong>{totalParcels} Parcels</strong></span>
            <Link href="/field/parcels" className="text-emerald-700 font-bold hover:underline">
              Open Field Map →
            </Link>
          </div>
        </div>

        {/* Recently Submitted Work */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-blue-700" />
                <span>Recently Submitted Work</span>
              </h2>
              <Link
                href="/field/tasks?status=SUBMITTED"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Submitted Archive</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Field evidence and 8-point checklist submitted for District CALA review.
            </p>

            <div className="space-y-2">
              {recentSubmissions.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900">Khasra {s.khasra_number || "412/1"}</strong>
                      <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded font-mono">
                        Under CALA Review
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.project_title} • Submitted: {s.submitted_at || s.created_at}
                    </p>
                  </div>

                  <Link
                    href={`/field/tasks/${s.id}`}
                    className="p-1.5 rounded bg-white hover:bg-slate-200 text-slate-600 transition-colors"
                    title="View submitted verification"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified: <strong>{submittedCount} Parcels</strong></span>
            <span className="text-emerald-700 font-medium">Locked for Scrutiny</span>
          </div>
        </div>
      </div>

      {/* 6. STATUTORY NOTIFICATIONS & FIELD REMINDERS */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Info className="h-4.5 w-4.5 text-slate-700" />
            <span>Field Notifications & Alerts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-lg border text-xs ${
                  n.severity === "CRITICAL"
                    ? "bg-rose-50 border-rose-200 text-rose-950"
                    : n.severity === "WARNING"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      n.severity === "CRITICAL"
                        ? "bg-rose-600"
                        : n.severity === "WARNING"
                        ? "bg-amber-600"
                        : "bg-blue-600"
                    }`}
                  />
                  <span>{n.title}</span>
                </div>
                <p className="mt-1 text-slate-600">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
