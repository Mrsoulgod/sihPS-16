"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAssignedParcels } from "@/lib/api/field";
import { FieldAssignedParcel } from "@/lib/types/field";
import {
  Map as MapIcon,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Compass,
  ChevronRight,
  MapPin,
  ExternalLink,
  Layers,
  AlertTriangle,
} from "lucide-react";

export default function FieldAssignedParcelsPage() {
  const [parcels, setParcels] = useState<FieldAssignedParcel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loadParcels = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAssignedParcels();
      setParcels(data);
    } catch (err) {
      console.error("Failed to load assigned parcels:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.khasra_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primary_owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || p.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                CADASTRAL SURVEY INVENTORY
              </span>
              <span className="text-xs text-slate-500 font-medium">Tehsil Kotputli, Jaipur</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
              Assigned Land Parcels
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Demarcated revenue parcels assigned for on-ground verification, asset enumeration, and cadastral truthing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadParcels();
              }}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/field/tasks"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#138808] text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Task Workspace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. PARCELS LIST / TABLE */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
          ))}
        </div>
      ) : filteredParcels.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 mt-3">No Parcels Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? `No assigned parcels match "${searchQuery}".` : "No parcels found in inventory."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParcels.map((p) => {
            const isVerified = p.verification_status === "VERIFIED";

            return (
              <div
                key={p.parcel_id}
                className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                        isVerified
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.verification_status}
                    </span>

                    <span className="text-xs font-mono text-slate-500">
                      {p.lat && p.lng ? `${p.lat}, ${p.lng}` : "27.6534, 76.1287"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    Khasra {p.khasra_number}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {p.project_title} • Code: {p.project_code}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Village / Tehsil</span>
                      <strong className="text-slate-800">{p.village_name}, {p.tehsil_name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Area / Land Type</span>
                      <strong className="text-slate-800">{p.area_acres} Acres • {p.land_type?.replace("_", " ")}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Primary Title Holder</span>
                      <strong className="text-slate-800 truncate block">{p.primary_owner_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 inline" /> SLA Due: {p.due_date || "2026-09-20"}
                  </span>

                  <Link
                    href={`/land-parcels/${p.parcel_id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <span>View Cadastre 360</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
