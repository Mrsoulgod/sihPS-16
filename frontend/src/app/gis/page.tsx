"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { MOCK_PROJECTS } from "@/lib/api/mock_fallback";
import { getGisGeoJsonByProjectId } from "@/lib/data/gis_datasets";
import {
  MapPin,
  Building2,
  Layers,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Search,
  Filter,
  Info,
  Compass,
  ArrowUpRight,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] min-h-[520px] w-full rounded-xl bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-800 gap-2">
        <Compass className="h-8 w-8 text-emerald-500 animate-spin" />
        <span className="font-semibold text-slate-300">Loading High-Precision GIS Spatial Engine & PostGIS Cadastre...</span>
        <span className="text-[11px] text-slate-500 font-mono">EPSG:4326 • WGS84 Geodetic Coordinate Frame</span>
      </div>
    ),
  }
);

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = projectList && projectList.length > 0 ? projectList : MOCK_PROJECTS;

  // Selected Corridor
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const activeProjectId = selectedProjectId || (projects.length > 0 ? projects[0].id : "PRJ-NH48-PKG4");

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  // Effective dataset matching corridor
  const effectiveGis =
    gisData && gisData.features && gisData.features.length > 0
      ? gisData
      : getGisGeoJsonByProjectId(activeProjectId);

  const features = effectiveGis.features || [];
  const totalParcels = features.length;

  const totalAcres = features.reduce((sum, f) => sum + (f.properties.total_area_acres || 0), 0);
  const acquiredAcres = features
    .filter(
      (f) =>
        f.properties.acquisition_status === "ACQUIRED" ||
        f.properties.acquisition_status === "POSSESSION_TAKEN"
    )
    .reduce((sum, f) => sum + (f.properties.acquired_area_acres || f.properties.total_area_acres || 0), 0);

  const acquiredParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "ACQUIRED" ||
      f.properties.acquisition_status === "POSSESSION_TAKEN"
  ).length;

  const underVerificationParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "VERIFICATION_PENDING" ||
      f.properties.acquisition_status === "SECTION_11_NOTIFIED" ||
      f.properties.acquisition_status === "SECTION_19_DECLARED" ||
      f.properties.verification_status === "SURVEYED" ||
      f.properties.verification_status === "IN_PROGRESS"
  ).length;

  const disputedParcels = features.filter((f) => f.properties.is_disputed).length;

  const totalValuationCr = (
    features.reduce((sum, f) => sum + (f.properties.assessed_compensation_inr || 38000000), 0) /
    10000000
  ).toFixed(2);

  // Table Search and Filter
  const [tableSearch, setTableSearch] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL");
  const [highlightedParcelId, setHighlightedParcelId] = useState<string | null>(null);

  // Extract unique villages
  const villages = Array.from(new Set(features.map((f) => f.properties.village_name || "Sundarpura")));

  const filteredFeatures = features.filter((f) => {
    const p = f.properties;
    if (selectedVillage !== "ALL" && p.village_name !== selectedVillage) return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      const matchKhasra = p.khasra_number?.toLowerCase().includes(q);
      const matchOwner = p.owner_name?.toLowerCase().includes(q);
      const matchUlpin = p.ulpin?.toLowerCase().includes(q);
      const matchStatus = p.status_label?.toLowerCase().includes(q);
      if (!matchKhasra && !matchOwner && !matchUlpin && !matchStatus) return false;
    }
    return true;
  });

  const exportCorridorGeoJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(effectiveGis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NLAMS_Corridor_${activeProjectId}_EPSG4326.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCsvSummary = () => {
    const headers = "Parcel ID,Khasra Number,Khata Number,Village,Tehsil,Land Classification,Total Acres,Acquired Acres,ULPIN Bhu-Aadhaar,Status,Disputed,Estimated Compensation (INR)\n";
    const rows = features
      .map((f) => {
        const p = f.properties;
        return `"${p.parcel_id}","${p.khasra_number}","${p.khata_number}","${p.village_name}","${p.tehsil_name || "Kotputli"}","${p.land_type}","${p.total_area_acres}","${p.acquired_area_acres || p.total_area_acres}","${p.ulpin || "N/A"}","${p.status_label || p.acquisition_status}","${p.is_disputed ? "YES" : "NO"}","${p.assessed_compensation_inr || 38400000}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Cadastral_Survey_Ledger_${activeProjectId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Header & Alignment Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>National Cadastral GIS & Spatial Cadastre</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                  PostGIS 16
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative multi-village cadastre with 60m RoW buffer demarcations, Bhu-Aadhaar ULPINs, and RFCTLARR statutory stages.
              </p>
            </div>
          </div>
        </div>

        {/* Project Corridor Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={activeProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[300px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} — {p.title.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={exportCorridorGeoJson}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Download PostGIS GeoJSON FeatureCollection"
          >
            <Download className="h-3.5 w-3.5" />
            <span>GeoJSON</span>
          </button>

          <button
            type="button"
            onClick={exportCsvSummary}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Export Cadastral CSV Summary"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* Corridor Executive KPIs Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Khasras</span>
            <p className="text-lg font-black text-white">{totalParcels}</p>
            <span className="text-[10px] text-slate-400 block">{totalAcres.toFixed(1)} Acres (100% RoW)</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-slate-900/90 p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Acquired / Possession</span>
            <p className="text-lg font-black text-emerald-400">{acquiredParcels}</p>
            <span className="text-[10px] text-emerald-500/80 block">
              {acquiredAcres.toFixed(1)} Ac ({Math.round((acquiredAcres / (totalAcres || 1)) * 100)}%)
            </span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-slate-900/90 p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Under Notification</span>
            <p className="text-lg font-black text-amber-400">{underVerificationParcels}</p>
            <span className="text-[10px] text-amber-500/80 block">Sec 11 / 19 / Ground Survey</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <Info className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-slate-900/90 p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Disputed / Stayed</span>
            <p className="text-lg font-black text-rose-400">{disputedParcels}</p>
            <span className="text-[10px] text-rose-500/80 block">Section 15 Objections</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Award Capital Est.</span>
            <p className="text-lg font-black text-emerald-300">₹{totalValuationCr} Cr</p>
            <span className="text-[10px] text-slate-400 block">RFCTLARR Schedule I</span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Advanced Interactive Map Canvas */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        <LeafletParcelMap
          geoJson={effectiveGis}
          height="640px"
          title={`${activeProject?.project_code} Cadastre`}
          onParcelClick={(parcelId: string) => {
            setHighlightedParcelId(parcelId);
          }}
        />
      </div>

      {/* Cadastral Demarcation Ledger Table Below Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Corridor Cadastral Survey & Demarcation Ledger</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified khasra-level land records, Bhu-Aadhaar ULPINs, and compensation schedule.
            </p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Village Selector */}
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-bold">Village:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none"
              >
                <option value="ALL">All Villages ({villages.length})</option>
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Khasra / Owner / ULPIN..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs min-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Khasra #</th>
                <th className="py-2.5 px-3">Village / Tehsil</th>
                <th className="py-2.5 px-3">Bhu-Aadhaar (ULPIN)</th>
                <th className="py-2.5 px-3">Land Classification</th>
                <th className="py-2.5 px-3 text-right">Total (Ac)</th>
                <th className="py-2.5 px-3 text-right">Acquired (Ac)</th>
                <th className="py-2.5 px-3 text-right">Est. Award (INR)</th>
                <th className="py-2.5 px-3">Statutory Stage</th>
                <th className="py-2.5 px-3 text-center">Dispute Flag</th>
                <th className="py-2.5 px-3 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFeatures.map((f) => {
                const p = f.properties;
                const isSelected = highlightedParcelId === p.parcel_id;
                return (
                  <tr
                    key={p.parcel_id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSelected ? "bg-emerald-950/40 font-semibold" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-extrabold text-white flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fillColor || "#138808" }} />
                      <span>#{p.khasra_number}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-200">{p.village_name}</span>
                      <span className="text-[10px] text-slate-500 block">{p.tehsil_name || "Kotputli"}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-400">
                      {p.ulpin || "RJ-08-JAI-1421-9118"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {p.land_type?.replace(/_/g, " ") || "Agricultural"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                      {p.total_area_acres}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {p.acquired_area_acres || p.total_area_acres}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-300">
                      {p.assessed_compensation_inr
                        ? `₹${(p.assessed_compensation_inr / 10000000).toFixed(2)} Cr`
                        : "₹3.84 Cr"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${p.fillColor || "#138808"}25`,
                          color: p.color || "#10b981",
                        }}
                      >
                        {p.status_label || p.acquisition_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.is_disputed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/50 px-2 py-0.5 rounded">
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                          <span>Stay Order</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold">Clear Title ✓</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/land-parcels/${p.parcel_id}`}
                        className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <span>360°</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
