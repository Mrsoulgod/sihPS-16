"use client";

import React from "react";
import { ProjectStatusCounts } from "@/lib/types/dashboard";
import { CheckCircle, AlertTriangle, Clock, Flag, Info } from "lucide-react";

interface ProjectStatusSummaryProps {
  status: ProjectStatusCounts;
}

export function ProjectStatusSummary({ status }: ProjectStatusSummaryProps) {
  const total = status.total || 1;

  const items = [
    {
      label: "On Track",
      count: status.on_track,
      pct: Math.round((status.on_track / total) * 100),
      desc: "Progressing within statutory SLA deadlines",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-950",
      accent: "text-[#138808] bg-emerald-100",
      badge: "Normal SLA",
      icon: CheckCircle,
    },
    {
      label: "At Risk",
      count: status.at_risk,
      pct: Math.round((status.at_risk / total) * 100),
      desc: "Litigation or disbursement backlog detected",
      color: "border-amber-200 bg-amber-50/40 text-amber-950",
      accent: "text-amber-700 bg-amber-100",
      badge: "Intervention Req.",
      icon: AlertTriangle,
    },
    {
      label: "Delayed",
      count: status.delayed,
      pct: Math.round((status.delayed / total) * 100),
      desc: "Statutory Section 11/19 timeline exceeded",
      color: "border-rose-200 bg-rose-50/40 text-rose-950",
      accent: "text-rose-700 bg-rose-100",
      badge: "Critical Escalation",
      icon: Clock,
    },
    {
      label: "Completed",
      count: status.completed,
      pct: Math.round((status.completed / total) * 100),
      desc: "Physical possession & R&R closure achieved",
      color: "border-slate-200 bg-slate-50/70 text-slate-900",
      accent: "text-slate-700 bg-slate-200",
      badge: "Handover Done",
      icon: Flag,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Pipeline Health & Risk Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated statutory compliance and timeline slippage classification
          </p>
        </div>
        <div className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
          {status.total} Total Monitored Projects
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-4 rounded-lg border ${item.color} flex flex-col justify-between transition-all hover:shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className={`h-7 w-7 rounded flex items-center justify-center ${item.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-serif">
                    {item.count}
                  </span>
                  <span className="text-xs font-semibold opacity-75">
                    ({item.pct}% of projects)
                  </span>
                </div>

                <p className="text-[11px] mt-1.5 opacity-85 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-semibold">
                <span className="uppercase tracking-wide">{item.badge}</span>
                <span className="opacity-70">RFCTLARR Rules</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
