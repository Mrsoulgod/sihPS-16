"use client";

import React from "react";
import { StateAttentionItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  FileText,
  MapPin,
} from "lucide-react";

interface StateAttentionQueueProps {
  items: StateAttentionItem[];
}

export function StateAttentionQueue({ items }: StateAttentionQueueProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-200";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-200";
      default:
        return "bg-blue-100 text-blue-900 border-blue-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-mono flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 inline" />
                STATE SUPERVISION QUEUE
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {items.length} Interventions Required
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
              State Attention Required
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Supervisory Actions & Directives
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-200">
        {items.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-sans text-xs">
            No pending state attention items. All district operations are within SLA tolerance.
          </div>
        ) : (
          items.map((item) => {
            const targetUrl = item.project_id
              ? `/projects/${item.project_id}`
              : "/projects";

            return (
              <div
                key={item.item_id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Priority + Issue Context */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.category.replace(/_/g, " ")}
                    </span>
                    {item.district_name && (
                      <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-700" />
                        <strong>{item.district_name}</strong>
                      </span>
                    )}
                    {(item.sla_days_overdue ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                        {item.sla_days_overdue} Days Overdue
                      </span>
                    )}
                  </div>

                  {/* Project Title & Description */}
                  <div>
                    {item.project_title && (
                      <h4 className="text-xs font-bold text-slate-900 font-sans">
                        {item.project_title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Directive / Action Required */}
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded px-2.5 py-1.5 text-xs text-emerald-950 font-medium flex items-start gap-1.5 mt-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 font-mono shrink-0">
                      Directive:
                    </span>
                    <span>{item.action_required}</span>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="shrink-0 flex items-center justify-end">
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs transition-colors shadow-2xs"
                  >
                    <span>Supervise</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
