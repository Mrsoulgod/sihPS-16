"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ParcelListItem } from "@/lib/types/parcel";
import { Search, Filter, AlertTriangle, CheckCircle2, ArrowUpRight, Eye } from "lucide-react";

interface ParcelTableProps {
  parcels: ParcelListItem[];
  isLoading?: boolean;
  onSelectParcel?: (parcelId: string) => void;
  selectedParcelId?: string;
}

export function ParcelTable({
  parcels,
  isLoading,
  onSelectParcel,
  selectedParcelId,
}: ParcelTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.khasra_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.khata_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.village_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DISPUTED" && p.is_disputed) ||
      p.acquisition_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (p: ParcelListItem) => {
    if (p.is_disputed || p.acquisition_status === "DISPUTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="h-3 w-3 inline" />
          Disputed
        </span>
      );
    }

    if (["AWARD_PASSED", "DISBURSED", "POSSESSION_TAKEN"].includes(p.acquisition_status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 inline text-[#138808]" />
          {p.acquisition_status === "POSSESSION_TAKEN" ? "Possession Taken" : p.acquisition_status === "DISBURSED" ? "Disbursed" : "Award Declared"}
        </span>
      );
    }

    if (p.acquisition_status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {p.acquisition_status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by Khasra, Khata, or Village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="POSSESSION_TAKEN">Possession Taken</option>
            <option value="DISBURSED">Disbursed</option>
            <option value="AWARD_PASSED">Award Declared</option>
            <option value="VERIFIED">Field Verified</option>
            <option value="NOTIFIED_SEC11">Section 11</option>
            <option value="PROPOSED">Proposed</option>
            <option value="DISPUTED">Disputed Only</option>
          </select>
          <span className="text-xs text-slate-500 font-medium ml-2">
            ({filteredParcels.length} parcels)
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Khasra / Khata</th>
              <th className="py-2.5 px-3">Village / Tehsil</th>
              <th className="py-2.5 px-3 text-right">Area (Acres)</th>
              <th className="py-2.5 px-3">Land Classification</th>
              <th className="py-2.5 px-3">Acquisition Status</th>
              <th className="py-2.5 px-3">Ground Survey</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredParcels.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No cadastral parcels matching criteria.
                </td>
              </tr>
            ) : (
              filteredParcels.map((p) => {
                const isSelected = selectedParcelId === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectParcel && onSelectParcel(p.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-emerald-50/70 font-semibold" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Khasra {p.khasra_number}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Khata #{p.khata_number}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800">{p.village_name}</div>
                      <div className="text-[10px] text-slate-400">{p.district_name}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-serif font-bold text-slate-900">
                      {p.acquired_area_acres > 0 ? p.acquired_area_acres : p.total_area_acres}{" "}
                      <span className="text-[10px] font-normal text-slate-500">Ac</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-600 text-[11px] capitalize">
                        {p.land_type.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-3">{getStatusBadge(p)}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          p.verification_status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.verification_status === "VERIFIED" ? "✓ Verified" : "Pending"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/land-parcels/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#138808] hover:text-white text-slate-700 text-[11px] font-medium transition-colors shadow-2xs"
                      >
                        <span>360°</span>
                        <ArrowUpRight className="h-3 w-3" />
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
