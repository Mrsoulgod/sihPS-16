"use client";

import React, { useState, useMemo } from "react";
import { DistrictPerformanceItem } from "@/lib/types/dashboard";
import {
  MapPin,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface DistrictPerformanceMatrixProps {
  districts: DistrictPerformanceItem[];
  onSelectDistrict?: (districtId: string) => void;
  selectedDistrictId?: string | null;
}

type SortField =
  | "district_name"
  | "project_count"
  | "land_proposed_acres"
  | "land_acquired_acres"
  | "acquisition_percent"
  | "compensation_assessed_cr"
  | "compensation_disbursed_cr"
  | "possession_percent"
  | "randr_completion_percent"
  | "overdue_tasks_count";

type RiskFilter = "ALL" | "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
type StatusFilter = "ALL" | "ON_TRACK" | "AT_RISK" | "DELAYED";

export function DistrictPerformanceMatrix({
  districts,
  onSelectDistrict,
  selectedDistrictId,
}: DistrictPerformanceMatrixProps) {
  const [sortField, setSortField] = useState<SortField>("acquisition_percent");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredDistricts = useMemo(() => {
    return districts
      .filter((d) => {
        if (searchQuery.trim()) {
          const dName = (d.district_name || "").toLowerCase();
          if (!dName.includes(searchQuery.toLowerCase())) {
            return false;
          }
        }
        if (riskFilter !== "ALL" && (d.risk_level || "LOW") !== riskFilter) {
          return false;
        }
        if (statusFilter !== "ALL" && (d.status || "NORMAL") !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] ?? 0;
        let valB: any = b[sortField] ?? 0;
        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [districts, sortField, sortAsc, searchQuery, riskFilter, statusFilter]);

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-200";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "MODERATE":
        return "bg-blue-100 text-blue-900 border-blue-200";
      default:
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELAYED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "AT_RISK":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Title & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                SUBORDINATE DISTRICT JURISDICTIONS
              </span>
              <span className="text-xs text-slate-500 font-medium font-mono">
                {filteredDistricts.length} Districts Displayed
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 font-serif">
              District Acquisition & Compensation Performance
            </h3>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[160px]">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter district..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#138808]"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#138808]"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#138808]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200 select-none">
            <tr>
              <th
                onClick={() => handleSort("district_name")}
                className="py-3 px-3.5 font-bold cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>District</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("project_count")}
                className="py-3 px-2.5 font-bold text-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Projects</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("land_proposed_acres")}
                className="py-3 px-2.5 font-bold text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Proposed</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("land_acquired_acres")}
                className="py-3 px-2.5 font-bold text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Acquired</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("acquisition_percent")}
                className="py-3 px-3 font-bold cursor-pointer hover:bg-slate-200 transition-colors min-w-[130px]"
              >
                <div className="flex items-center gap-1">
                  <span>Acq %</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("compensation_assessed_cr")}
                className="py-3 px-2.5 font-bold text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Assessed</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("compensation_disbursed_cr")}
                className="py-3 px-2.5 font-bold text-right cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Disbursed</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("possession_percent")}
                className="py-3 px-2.5 font-bold text-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Possession %</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("randr_completion_percent")}
                className="py-3 px-2.5 font-bold text-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>R&R %</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("overdue_tasks_count")}
                className="py-3 px-2.5 font-bold text-center cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Overdue</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-2.5 font-bold text-center">Risk</th>
              <th className="py-3 px-3 font-bold text-center">Status</th>
              <th className="py-3 px-3 text-right">Drilldown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
            {filteredDistricts.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-slate-500 font-sans">
                  No districts match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredDistricts.map((d) => {
                const isSelected = selectedDistrictId === d.district_id;
                return (
                  <tr
                    key={d.district_id}
                    onClick={() => onSelectDistrict && onSelectDistrict(d.district_id)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? "bg-emerald-50/60 font-semibold" : ""
                    }`}
                  >
                    {/* District Name */}
                    <td className="py-3 px-3.5 font-sans font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                        <span>{d.district_name}</span>
                      </div>
                    </td>

                    {/* Projects */}
                    <td className="py-3 px-2.5 text-center font-bold text-slate-800">
                      {d.project_count}
                    </td>

                    {/* Proposed */}
                    <td className="py-3 px-2.5 text-right text-slate-700">
                      {d.land_proposed_acres.toFixed(1)} <span className="text-[9px] text-slate-400">Ac</span>
                    </td>

                    {/* Acquired */}
                    <td className="py-3 px-2.5 text-right font-medium text-emerald-800">
                      {d.land_acquired_acres.toFixed(1)} <span className="text-[9px] text-slate-400">Ac</span>
                    </td>

                    {/* Acquisition % */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#138808] h-full rounded-full"
                            style={{ width: `${Math.min(100, d.acquisition_percent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-900 w-9 text-right">
                          {d.acquisition_percent.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Assessed */}
                    <td className="py-3 px-2.5 text-right text-slate-700">
                      ₹{d.compensation_assessed_cr.toFixed(1)} <span className="text-[9px] text-slate-400">Cr</span>
                    </td>

                    {/* Disbursed */}
                    <td className="py-3 px-2.5 text-right font-medium text-emerald-800">
                      ₹{d.compensation_disbursed_cr.toFixed(1)} <span className="text-[9px] text-slate-400">Cr</span>
                    </td>

                    {/* Possession % */}
                    <td className="py-3 px-2.5 text-center text-slate-800">
                      <span className="font-semibold">{d.possession_percent.toFixed(1)}%</span>
                    </td>

                    {/* R&R % */}
                    <td className="py-3 px-2.5 text-center text-slate-800">
                      <span className="font-semibold">{d.randr_completion_percent.toFixed(1)}%</span>
                    </td>

                    {/* Overdue Tasks */}
                    <td className="py-3 px-2.5 text-center">
                      {(d.overdue_tasks_count ?? 0) > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                          {d.overdue_tasks_count}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-2.5 text-center">
                      <span
                        className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${getRiskBadge(
                          d.risk_level
                        )}`}
                      >
                        {d.risk_level || "LOW"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${getStatusBadge(
                          d.status
                        )}`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Drilldown Arrow */}
                    <td className="py-3 px-3 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-400 inline group-hover:text-slate-900" />
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
