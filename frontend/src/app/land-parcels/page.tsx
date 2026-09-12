"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useParcels, useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { useProjects } from "@/lib/hooks/useProjects";
import { ParcelTable } from "@/components/parcels/ParcelTable";
import {
  Layers,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Map,
  Table as TableIcon,
  Columns,
  Compass,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-200">
        Loading Cadastral Spatial Map...
      </div>
    ),
  }
);

export default function LandParcelsPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isDisputed, setIsDisputed] = useState<boolean | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"SPLIT" | "MAP" | "TABLE">("SPLIT");

  const { data: projectList } = useProjects();
  const projects = projectList || [];
  const { data: gisData } = useProjectParcelsGis(projectId || (projects[0]?.id));

  const {
    data: parcelList,
    isLoading,
    error,
  } = useParcels({
    project_id: projectId || undefined,
    status: status || undefined,
    search: search || undefined,
    is_disputed: isDisputed,
    page_size: 50,
  });

  const parcels = parcelList?.items || [];
  const totalCount = parcelList?.total_records || parcels.length;

  const underVerificationCount = parcels.filter(
    (p) => p.acquisition_status === "VERIFICATION_PENDING" || p.verification_status === "SURVEYED"
  ).length;
  const acquiredCount = parcels.filter(
    (p) => p.acquisition_status === "ACQUIRED" || p.possession_status === "POSSESSION_TAKEN"
  ).length;
  const disputedCount = parcels.filter((p) => p.is_disputed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary-700" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Cadastral Land Parcel Directory
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Authoritative revenue cadastre records, khasra demarcation, asset verification, and ownership tracking.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Parcels</span>
            <p className="text-sm font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-500">Under Survey</span>
            <p className="text-sm font-bold text-amber-600">{underVerificationCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500">Acquired</span>
            <p className="text-sm font-bold text-green-600">{acquiredCount}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Khasra or Khata number (e.g. 104/1)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-1 min-w-[200px]">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 min-w-[160px]">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="IDENTIFIED">IDENTIFIED</option>
            <option value="VERIFICATION_PENDING">VERIFICATION PENDING</option>
            <option value="SURVEYED">SURVEYED</option>
            <option value="NOTIFIED">NOTIFIED</option>
            <option value="COMPENSATION_DETERMINED">COMPENSATION DETERMINED</option>
            <option value="ACQUIRED">ACQUIRED</option>
            <option value="POSSESSION_TAKEN">POSSESSION TAKEN</option>
          </select>
        </div>

        {/* Dispute Checkbox */}
        <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isDisputed === true}
            onChange={(e) => setIsDisputed(e.target.checked ? true : undefined)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="font-medium text-red-700 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Disputed Only ({disputedCount})
          </span>
        </label>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("SPLIT")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              viewMode === "SPLIT" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Split Cadastre Map and Table"
          >
            <Columns className="h-3.5 w-3.5 text-[#138808]" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("MAP")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              viewMode === "MAP" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Full Interactive Cadastral Map"
          >
            <Map className="h-3.5 w-3.5 text-[#138808]" />
            <span className="hidden sm:inline">Spatial Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("TABLE")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
              viewMode === "TABLE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Tabular Khasra Registry"
          >
            <TableIcon className="h-3.5 w-3.5 text-[#138808]" />
            <span className="hidden sm:inline">Table Only</span>
          </button>
        </div>
      </div>

      {/* Interactive Spatial Cadastre Map (Split or Map Mode) */}
      {(viewMode === "SPLIT" || viewMode === "MAP") && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Compass className="h-4 w-4 text-[#138808]" />
              <span>Interactive PostGIS Cadastral Overlay</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Click any parcel to inspect khasra details
            </span>
          </div>
          <div className={`${viewMode === "MAP" ? "h-[580px]" : "h-[460px]"} w-full rounded-lg overflow-hidden border border-slate-200 shadow-inner`}>
            <LeafletParcelMap
              geoJson={gisData}
              height="100%"
              title="Cadastral Overlay"
              onParcelClick={(parcelId: string) => {
                router.push(`/land-parcels/${parcelId}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Parcel Table (Split or Table Mode) */}
      {(viewMode === "SPLIT" || viewMode === "TABLE") && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <ParcelTable
            parcels={parcels}
            isLoading={isLoading}
            onSelectParcel={(parcelId) => {
              router.push(`/land-parcels/${parcelId}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
