"use client";

import React from "react";
import { RecentActivityItem } from "@/lib/types/dashboard";
import {
  FileCheck,
  CreditCard,
  Gavel,
  ShieldCheck,
  MapPin,
  Clock,
  User,
  Activity,
} from "lucide-react";

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActionIcon = (action: string) => {
    if (action.includes("PFMS") || action.includes("DISBURSEMENT")) {
      return <CreditCard className="h-4 w-4 text-emerald-600" />;
    } else if (action.includes("HEARING") || action.includes("OBJECTION")) {
      return <Gavel className="h-4 w-4 text-amber-600" />;
    } else if (action.includes("POSSESSION")) {
      return <ShieldCheck className="h-4 w-4 text-blue-600" />;
    } else if (action.includes("VERIFICATION") || action.includes("PARCEL")) {
      return <MapPin className="h-4 w-4 text-indigo-600" />;
    }
    return <FileCheck className="h-4 w-4 text-slate-600" />;
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-600" />
          <h3 className="text-base font-bold text-slate-900">
            Recent Statutory & Audit Activity
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Immutable Audit Trail
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {activities.map((item) => {
          const detailText = item.details?.description || `${item.entity_name} [${item.entity_id}] mutated`;
          return (
            <div key={item.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors rounded-sm px-1">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getActionIcon(item.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {item.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  {detailText}
                </p>

                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <User className="h-3 w-3 text-slate-400" />
                    {item.actor_name || "System"}
                  </span>
                  {item.actor_role && (
                    <>
                      <span>•</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {item.actor_role}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
