"use client";

import React from "react";
import { CentralAttentionItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  AlertOctagon,
  Clock,
  Building,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Flame,
} from "lucide-react";

interface CentralAttentionQueueProps {
  items?: CentralAttentionItem[];
}

export function CentralAttentionQueue({ items }: CentralAttentionQueueProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-rose-50/60 border-b border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <AlertOctagon className="h-4 w-4 text-rose-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-rose-950 font-serif">
                CENTRAL ATTENTION REQUIRED
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-mono">
                {items.length} Escalations
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-0.5">
              High-level statutory SLA breaches, compensation bottlenecks, and inter-departmental hurdles
            </p>
          </div>
        </div>
      </div>

      {/* Escalations List */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          let priorityBadge = "bg-rose-100 text-rose-900 border-rose-200";
          if (item.priority === "HIGH") {
            priorityBadge = "bg-rose-50 text-rose-800 border-rose-200";
          } else if (item.priority === "MODERATE") {
            priorityBadge = "bg-amber-50 text-amber-800 border-amber-200";
          }

          return (
            <div
              key={item.issue_id}
              className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityBadge}`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.issue_id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {item.project_title || "National Corridor"}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-snug">
                  {item.reason}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>
                      {item.district_name || "Jaipur"}, {item.state_name || "Rajasthan"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-700" />
                    <span>
                      Authority: <strong>{item.current_authority}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 font-mono">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Aging: {item.age_days} days overdue</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={item.project_id ? `/projects/${item.project_id}` : "/workflow"}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs inline-flex items-center gap-1 transition-all"
                >
                  <span>Review Escalation</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
