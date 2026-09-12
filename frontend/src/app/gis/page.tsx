"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { MOCK_PROJECTS } from "@/lib/api/mock_fallback";
import { DEFAULT_FALLBACK_GIS } from "@/components/gis/LeafletParcelMap";
import { getGisGeoJsonByProjectId } from "@/lib/data/gis_datasets";
import {
  MapPin,
  Building2,
  Layers,
  ShieldAlert,
  Compass,
  FileCheck2,
  Trees,
  Home,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Download,
  BadgeCheck,
  AlertTriangle,
  Info,
  Maximize2,
  Table as TableIcon,
  Map as MapIcon,
  Columns2,
  ArrowUpDown,
  Eye,
  FileSpreadsheet,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[650px] min-h-[500px] w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-800 gap-3">
        <Compass className="h-8 w-8 text-[#138808] animate-spin" />
        <div className="font-semibold text-slate-300">Initializing PostGIS Spatial Cadastre Engine...</div>
        <div className="text-[11px] text-slate-500 font-mono">Loading EPSG:4326 WGS84 GeoJSON Features</div>
      </div>
    ),
  }
);

type ViewMode = "SPATIAL" | "TABLE" | "SPLIT";
type TabType = "PARCELS" | "CONFLICTS" | "ULPIN";

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = projectList && projectList.length > 0 ? projectList : MOCK_PROJECTS;

  // Selected corridor & view mode
  const [selectedProjectId, setSelectedProjectId] = useState<string>("PRJ-NH48-PKG4");
  const [viewMode, setViewMode] = useState<ViewMode>("SPATIAL");
  const [activeTab, setActiveTab] = useState<TabType>("PARCELS");
  const [sidebarSearch, setSidebarSearch] = useState<string>("");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableStatusFilter, setTableStatusFilter] = useState<string>("ALL");
  const [selectedKhasraId, setSelectedKhasraId] = useState<string | undefined>(undefined);
  const [ulpinSearchInput, setUlpinSearchInput] = useState<string>("");
  const [copiedUlpin, setCopiedUlpin] = useState<string | null>(null);

  const activeProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0].id : "PRJ-NH48-PKG4");

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  const effectiveGis =
    gisData && gisData.features && gisData.features.length > 0
      ? gisData
      : getGisGeoJsonByProjectId(activeProjectId);

  const allFeatures = effectiveGis.features || [];
  const parcelFeatures = allFeatures.filter(
    (f) => f.properties?.layer_type === "PARCEL" || !f.properties?.layer_type
  );

  // Metrics
  const totalParcels = parcelFeatures.length;
  const totalAreaAcres = parcelFeatures.reduce((acc, f) => acc + (f.properties?.total_area_acres || 0), 0);
  const acquiredAreaAcres = parcelFeatures
    .filter(
      (f) =>
        f.properties?.acquisition_status === "ACQUIRED" ||
        f.properties?.acquisition_status === "POSSESSION_TAKEN"
    )
    .reduce((acc, f) => acc + (f.properties?.acquired_area_acres || f.properties?.total_area_acres || 0), 0);

  const totalAssessedCr = (
    parcelFeatures.reduce((acc, f) => acc + (f.properties?.assessed_compensation_inr || 0), 0) / 10000000
  ).toFixed(2);

  const disputedParcels = parcelFeatures.filter((f) => f.properties?.is_disputed);
  const ecoSensitiveOverlaps = allFeatures.filter((f) => f.properties?.layer_type === "ECO_SENSITIVE").length;

  const filteredSidebarParcels = useMemo(() => {
    return parcelFeatures.filter((f) => {
      if (!sidebarSearch.trim()) return true;
      const q = sidebarSearch.toLowerCase();
      const p = f.properties || {};
      return (
        p.khasra_number?.toLowerCase().includes(q) ||
        p.ulpin?.toLowerCase().includes(q) ||
        p.owner_name?.toLowerCase().includes(q) ||
        p.village_name?.toLowerCase().includes(q)
      );
    });
  }, [parcelFeatures, sidebarSearch]);

  const filteredTableParcels = useMemo(() => {
    return parcelFeatures.filter((f) => {
      const p = f.properties || {};
      if (tableStatusFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED" && p.acquisition_status !== "POSSESSION_TAKEN") return false;
      if (tableStatusFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED" && p.acquisition_status !== "SECTION_19_DECLARED") return false;
      if (tableStatusFilter === "AWARD" && p.acquisition_status !== "AWARD_ENQUIRY" && p.current_stage !== "SECTION_23") return false;
      if (tableStatusFilter === "DISPUTED" && !p.is_disputed) return false;

      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase();
      return (
        p.khasra_number?.toLowerCase().includes(q) ||
        p.ulpin?.toLowerCase().includes(q) ||
        p.owner_name?.toLowerCase().includes(q) ||
        p.village_name?.toLowerCase().includes(q) ||
        p.khata_number?.toLowerCase().includes(q)
      );
    });
  }, [parcelFeatures, tableSearch, tableStatusFilter]);

  const handleCopyUlpin = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedUlpin(ulpin);
    setTimeout(() => setCopiedUlpin(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      "ULPIN",
      "Khasra No",
      "Khata No",
      "Village",
      "Tehsil",
      "Total Area (Acres)",
      "Acquired Area (Acres)",
      "Area (Bigha)",
      "Classification",
      "Khatedar (Owner)",
      "Circle Rate (Rs/sqm)",
      "Assessed Award (INR)",
      "Status",
      "Disputed",
    ];

    const rows = filteredTableParcels.map((f) => {
      const p = f.properties || {};
      return [
        `"${p.ulpin || ""}"`,
        `"${p.khasra_number || ""}"`,
        `"${p.khata_number || ""}"`,
        `"${p.village_name || ""}"`,
        `"${p.tehsil_name || ""}"`,
        p.total_area_acres || 0,
        p.acquired_area_acres || 0,
        p.area_bigha || ((p.total_area_acres || 0) * 1.6).toFixed(2),
        `"${p.land_type || ""}"`,
        `"${p.owner_name || ""}"`,
        p.circle_rate_sqm || 0,
        p.assessed_compensation_inr || 0,
        `"${p.status_label || p.acquisition_status || ""}"`,
        p.is_disputed ? "YES" : "NO",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NLAMS_Cadastre_Register_${activeProjectId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* 1. Top Header, Project Selector & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#138808] shrink-0">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                National Cadastral GIS & Spatial Workstation
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                PostGIS EPSG:4326
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Authoritative multi-village cadastral registry, Bhu-Aadhaar ULPIN integration, and statutory RoW alignment.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[380px] xl:min-w-[420px]">
          {/* Project Selector (Fills width) */}
          <div className="w-full flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl shadow-2xs hover:border-gray-300 transition-colors">
            <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
            <select
              value={activeProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedKhasraId(undefined);
              }}
              className="w-full bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} — {p.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher Pills (Fills width evenly across all 3 buttons) */}
          <div className="w-full bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("SPATIAL")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "SPATIAL"
                  ? "bg-[#138808] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Spatial Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "TABLE"
                  ? "bg-[#138808] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Cadastre Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("SPLIT")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "SPLIT"
                  ? "bg-[#138808] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Split View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Corridor Land</span>
            <p className="text-lg font-bold text-gray-900">{totalAreaAcres.toFixed(1)} Acres</p>
            <span className="text-[10px] text-gray-500">{totalParcels} Khasra Cadastres</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-green-600 block">Acquired & Handed Over</span>
            <p className="text-lg font-bold text-green-700">{acquiredAreaAcres.toFixed(1)} Acres</p>
            <span className="text-[10px] text-green-600 font-semibold">
              {totalAreaAcres > 0 ? ((acquiredAreaAcres / totalAreaAcres) * 100).toFixed(0) : 0}% RoW Cleared
            </span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Estimated Solatium Award</span>
            <p className="text-lg font-bold text-blue-700">₹{totalAssessedCr} Cr</p>
            <span className="text-[10px] text-blue-500">RFCTLARR 2013 100% Solatium</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Litigation / Stays</span>
            <p className="text-lg font-bold text-rose-700">{disputedParcels.length} Parcels</p>
            <span className="text-[10px] text-rose-500 font-medium">Under Sec 15 Objections</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE A: SPATIAL MAP WORKSTATION */}
      {viewMode === "SPATIAL" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Side Tabbed Workstation Panel */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col h-[650px] overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 pb-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("PARCELS")}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                  activeTab === "PARCELS"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Parcels ({totalParcels})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("CONFLICTS")}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                  activeTab === "CONFLICTS"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Conflicts ({disputedParcels.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ULPIN")}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg transition-all ${
                  activeTab === "ULPIN"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ULPIN
              </button>
            </div>

            {/* Tab 1: Khasra Parcels List */}
            {activeTab === "PARCELS" && (
              <div className="flex-1 flex flex-col min-h-0 pt-3">
                <div className="relative mb-2">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter Khasra / Owner..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#138808]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredSidebarParcels.map((f) => {
                    const p = f.properties || {};
                    const isSelected = selectedKhasraId === p.parcel_id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedKhasraId(p.parcel_id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-500 shadow-xs"
                            : "bg-gray-50/60 border-gray-200 hover:bg-gray-100/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">Khasra #{p.khasra_number}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${p.color || '#138808'}20`,
                              color: p.color || '#138808',
                            }}
                          >
                            {p.status_label || p.acquisition_status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                          <span>{p.village_name}</span>
                          <span className="font-semibold text-gray-700">{p.total_area_acres} Acres</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                          Owner: {p.owner_name || "Joint"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Conflict & Overlap Analysis */}
            {activeTab === "CONFLICTS" && (
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 text-xs">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Statutory Overlap Analysis
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Automated spatial intersection check against 60m Right of Way and forest buffer boundaries.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-gray-700 text-[11px] uppercase tracking-wider">
                    Litigation Cases ({disputedParcels.length})
                  </div>
                  {disputedParcels.map((f) => {
                    const p = f.properties || {};
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedKhasraId(p.parcel_id)}
                        className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer hover:bg-rose-50 transition-all"
                      >
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <span>Khasra #{p.khasra_number}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-rose-100 rounded text-rose-800">
                            {p.current_stage || "SECTION_15"}
                          </span>
                        </div>
                        <div className="text-[11px] text-rose-700 mt-1">
                          {p.dispute_reason || "Section 15 valuation objection pending hearing."}
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-rose-200 flex justify-between text-[10px] text-rose-600">
                          <span>{p.village_name}</span>
                          <span>{p.total_area_acres} Acres</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {ecoSensitiveOverlaps > 0 && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <div className="font-bold flex items-center gap-1.5">
                      <Trees className="h-4 w-4 text-emerald-600" />
                      MoEFCC Eco-Sensitive Zone Overlap
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      Corridor intersects {ecoSensitiveOverlaps} eco-sensitive forest buffer area. Requires Wildlife Clearance Form-A.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Bhu-Aadhaar ULPIN Engine */}
            {activeTab === "ULPIN" && (
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Bhu-Aadhaar (ULPIN) Verification
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    14-digit geo-referenced alphanumeric unique land parcel identification based on latitude/longitude centroid.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Enter 14-Digit ULPIN</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. RJ-08-JAI-142A-9124"
                      value={ulpinSearchInput}
                      onChange={(e) => setUlpinSearchInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#138808]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const matched = parcelFeatures.find(
                          (f) => f.properties?.ulpin?.toLowerCase() === ulpinSearchInput.trim().toLowerCase()
                        );
                        if (matched) setSelectedKhasraId(matched.properties.parcel_id);
                      }}
                      className="px-3 py-1.5 bg-[#138808] hover:bg-green-700 text-white font-bold rounded-lg text-xs"
                    >
                      Locate
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Corridor ULPIN Register
                  </div>
                  {parcelFeatures.map((f) => {
                    const p = f.properties || {};
                    if (!p.ulpin) return null;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedKhasraId(p.parcel_id)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer font-mono text-[11px] text-gray-700 flex items-center justify-between"
                      >
                        <span>{p.ulpin}</span>
                        <span className="text-[10px] text-gray-400 font-sans">Khasra #{p.khasra_number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Map Canvas */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-950 shadow-md overflow-hidden h-[650px]">
            <LeafletParcelMap
              geoJson={effectiveGis}
              selectedParcelId={selectedKhasraId}
              height="100%"
              title="National Cadastral Map"
              onParcelClick={(parcelId: string) => {
                setSelectedKhasraId(parcelId);
              }}
            />
          </div>
        </div>
      )}

      {/* 4. VIEW MODE B: FULL TABULAR CADASTRE REGISTER */}
      {viewMode === "TABLE" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          {/* Table Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Khasra, ULPIN, Owner, Village..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#138808] w-64 md:w-80"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                {[
                  { id: "ALL", label: "All Parcels" },
                  { id: "ACQUIRED", label: "Acquired" },
                  { id: "NOTIFIED", label: "Notified" },
                  { id: "AWARD", label: "Award Pending" },
                  { id: "DISPUTED", label: "Disputed" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTableStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
                      tableStatusFilter === st.id
                        ? "bg-white text-gray-900 shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export CSV CTA */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#138808] border border-emerald-300 rounded-lg text-xs font-bold transition-all shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Cadastre CSV</span>
            </button>
          </div>

          {/* Interactive Data Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-3">Khasra / Khata</th>
                  <th className="py-3 px-3">Bhu-Aadhaar (ULPIN)</th>
                  <th className="py-3 px-3">Revenue Location</th>
                  <th className="py-3 px-3">Land Classification</th>
                  <th className="py-3 px-3">Extent (Acres / Bigha)</th>
                  <th className="py-3 px-3">Khatedar (Owner)</th>
                  <th className="py-3 px-3">Assessed Solatium Award</th>
                  <th className="py-3 px-3">Acquisition Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTableParcels.map((f) => {
                  const p = f.properties || {};
                  return (
                    <tr
                      key={f.id}
                      className={`hover:bg-emerald-50/40 transition-colors ${
                        p.is_disputed ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap">
                        <div>Khasra #{p.khasra_number}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Khata #{p.khata_number}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-emerald-700 whitespace-nowrap">
                        {p.ulpin ? (
                          <div className="flex items-center gap-1">
                            <span>{p.ulpin}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyUlpin(p.ulpin!)}
                              className="text-gray-400 hover:text-emerald-700"
                              title="Copy ULPIN"
                            >
                              {copiedUlpin === p.ulpin ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not Seeded</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        <div className="font-semibold text-gray-800">{p.village_name}</div>
                        <div className="text-[10px] text-gray-400">
                          {p.tehsil_name || "Tehsil"}, {p.district_name || "Jaipur"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {p.land_type || "Agricultural"}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{p.total_area_acres} Acres</div>
                        <div className="text-[10px] text-gray-500">
                          {p.area_bigha || ((p.total_area_acres || 0) * 1.6).toFixed(2)} Bigha
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-800">
                        <div className="font-medium truncate max-w-[160px]">{p.owner_name || "Joint Khatedars"}</div>
                        <div className="text-[10px] text-gray-400">{p.owner_count || 1} Registered Owner(s)</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-700 whitespace-nowrap">
                        {p.assessed_compensation_inr ? (
                          <div>₹{((p.assessed_compensation_inr) / 10000000).toFixed(2)} Cr</div>
                        ) : (
                          <span className="text-gray-400">Assessment Pending</span>
                        )}
                        <div className="text-[10px] text-gray-400 font-normal">
                          Circle: ₹{p.circle_rate_sqm || 850}/sq.m
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded text-[10px] font-bold block w-fit"
                          style={{
                            backgroundColor: `${p.color || '#138808'}18`,
                            color: p.color || '#138808',
                            border: `1px solid ${p.color || '#138808'}40`,
                          }}
                        >
                          {p.status_label || p.acquisition_status}
                        </span>
                        {p.is_disputed && (
                          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Litigation Stay
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKhasraId(p.parcel_id);
                              setViewMode("SPATIAL");
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                            title="Locate on Spatial Map"
                          >
                            <MapIcon className="h-3.5 w-3.5 text-[#138808]" />
                          </button>
                          <Link
                            href={`/land-parcels/${p.parcel_id}`}
                            className="px-2.5 py-1 bg-[#138808] hover:bg-green-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                          >
                            <span>360° Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW MODE C: SPLIT VIEW (MAP + TABLE SIDE BY SIDE) */}
      {viewMode === "SPLIT" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Interactive Map (Left 7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 shadow-md overflow-hidden h-[680px]">
            <LeafletParcelMap
              geoJson={effectiveGis}
              selectedParcelId={selectedKhasraId}
              height="100%"
              title="National Cadastral Map"
              onParcelClick={(parcelId: string) => {
                setSelectedKhasraId(parcelId);
              }}
            />
          </div>

          {/* Synchronous Cadastre Register (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-[#138808]" />
                <span className="text-xs font-bold text-gray-900">Cadastre Records ({totalParcels})</span>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="text-[11px] font-bold text-[#138808] hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative my-2">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Khasra / Owner..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#138808]"
              />
            </div>

            {/* Scrollable Records */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTableParcels.map((f) => {
                const p = f.properties || {};
                const isSelected = selectedKhasraId === p.parcel_id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedKhasraId(p.parcel_id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-400"
                        : "bg-gray-50/60 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">Khasra #{p.khasra_number}</span>
                        {p.ulpin && (
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {p.ulpin}
                          </span>
                        )}
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${p.color || '#138808'}20`,
                          color: p.color || '#138808',
                        }}
                      >
                        {p.status_label || p.acquisition_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200/80 text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Extent</span>
                        <span className="font-bold text-gray-800">{p.total_area_acres} Acres</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Solatium Award</span>
                        <span className="font-bold text-emerald-700">
                          {p.assessed_compensation_inr ? `₹${(p.assessed_compensation_inr / 10000000).toFixed(2)} Cr` : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-600 mt-1.5 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">Owner: {p.owner_name || "Joint Owners"}</span>
                      <Link
                        href={`/land-parcels/${p.parcel_id}`}
                        className="text-[#138808] font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>360°</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
