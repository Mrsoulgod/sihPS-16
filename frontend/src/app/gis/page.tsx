"use client";

import React, { useState } from "react";
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

type TabType = "PARCELS" | "CONFLICTS" | "ULPIN";

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = projectList && projectList.length > 0 ? projectList : MOCK_PROJECTS;

  // Selected corridor
  const [selectedProjectId, setSelectedProjectId] = useState<string>("PRJ-NH48-PKG4");
  const [activeTab, setActiveTab] = useState<TabType>("PARCELS");
  const [sidebarSearch, setSidebarSearch] = useState<string>("");
  const [selectedKhasraId, setSelectedKhasraId] = useState<string | undefined>(undefined);
  const [ulpinSearchInput, setUlpinSearchInput] = useState<string>("");

  const activeProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0].id : "PRJ-NH48-PKG4");

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  const effectiveGis =
    gisData && gisData.features && gisData.features.length > 0
      ? gisData
      : getGisGeoJsonByProjectId(activeProjectId);

  const allFeatures = effectiveGis.features || [];
  const parcelFeatures = allFeatures.filter((f) => f.properties?.layer_type === "PARCEL" || !f.properties?.layer_type);

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

  const filteredSidebarParcels = parcelFeatures.filter((f) => {
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Corridor Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#138808]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                National Cadastral GIS & Spatial Workstation
              </h1>
              <p className="text-xs text-gray-500">
                Authoritative PostGIS spatial cadastre with multi-village boundaries, Bhu-Aadhaar ULPIN, and 60m RoW alignment.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={activeProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedKhasraId(undefined);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#138808] min-w-[280px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} — {p.title.slice(0, 38)}...
              </option>
            ))}
          </select>
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

      {/* 3. Main Workstation Layout: Side Panel + Large Map */}
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
    </div>
  );
}
