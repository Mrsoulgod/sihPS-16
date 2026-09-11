"use client";

import React, { useState } from "react";
import { DistrictEscalationItem } from "@/lib/types/dashboard";
import Link from "next/link";
import {
  AlertOctagon,
  Clock,
  User,
  Building,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface DistrictEscalationsQueueProps {
  escalations: DistrictEscalationItem[];
}

export function DistrictEscalationsQueue({ escalations }: DistrictEscalationsQueueProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = escalations.filter((item) => {
    if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pTitle = (item.project_title || "").toLowerCase();
      const dName = (item.district_name || "").toLowerCase();
      const reason = (item.reason || "").toLowerCase();
      if (!pTitle.includes(q) && !dName.includes(q) && !reason.includes(q)) {
        return false;
      }
    }
    return true;
  });

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200 font-mono flex items-center gap-1">
                <AlertOctagon className="h-3 w-3 inline" />
                DISTRICT ESCALATIONS
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {filtered.length} Active Operational Issues
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
              District Operational Escalation Queue
            </h3>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[160px]">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search escalation..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#138808]"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#138808]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Escalations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 font-bold">Priority</th>
              <th className="py-3 px-3 font-bold">District & Project</th>
              <th className="py-3 px-3 font-bold">Issue Type</th>
              <th className="py-3 px-4 font-bold">Operational Bottleneck / Reason</th>
              <th className="py-3 px-3 font-bold">Current Responsible Authority</th>
              <th className="py-3 px-3 font-bold text-center">Age / Status</th>
              <th className="py-3 px-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No active district escalations match the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const targetProjectUrl = item.project_id
                  ? `/projects/${item.project_id}`
                  : "/projects";

                return (
                  <tr key={item.escalation_id} className="hover:bg-slate-50 transition-colors">
                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded border font-mono uppercase ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* District & Project */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 font-sans">
                        {item.district_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {item.project_title}
                      </div>
                    </td>

                    {/* Issue Type */}
                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-700">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {item.issue_type.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 text-slate-800 max-w-[320px]">
                      <p className="line-clamp-2 leading-relaxed">{item.reason}</p>
                    </td>

                    {/* Current Owner */}
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-medium">{item.current_owner}</span>
                      </div>
                    </td>

                    {/* Age / Status */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-800 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{item.age_days}d</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                        {item.status}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={targetProjectUrl}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#138808] text-white hover:bg-emerald-700 font-medium text-[11px] transition-colors shadow-2xs"
                      >
                        <span>Review</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
