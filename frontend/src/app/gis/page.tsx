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
  Download,
  FileSpreadsheet,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Table,
  ChevronRight,
  ShieldCheck,
  Trees,
  Home,
  Droplets,
  Share2,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] min-h-[520px] w-full rounded-xl bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-400 border border-slate-800 space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="font-semibold text-slate-300">Initializing High-Precision PostGIS Cadastral Engine...</p>
        <span className="text-[10px] text-slate-500 font-mono">EPSG:4326 WGS84 Geodetic Datum</span>
      </div>
    ),
  }
);

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = projectList && projectList.length > 0 ? projectList : MOCK_PROJECTS;

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedParcelId, setSelectedParcelId] = useState<string>("");
  const [showDirectoryTab, setShowDirectoryTab] = useState<boolean>(false);
  const [directoryFilter, setDirectoryFilter] = useState<string>("ALL");

  const activeProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0].id : "PRJ-NH48-PKG4");

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  // Fallback to project-specific dataset
  const effectiveGis =
    gisData && gisData.features && gisData.features.length > 0
      ? gisData
      : getGisGeoJsonByProjectId(activeProjectId) || DEFAULT_FALLBACK_GIS;

  const features = effectiveGis.features || [];
  const parcelFeatures = features.filter((f) => (f.properties?.layer_type || "PARCEL") === "PARCEL");
  
  const totalParcels = parcelFeatures.length;
  const acquiredParcels = parcelFeatures.filter(
    (f) =>
      f.properties.acquisition_status === "ACQUIRED" ||
      f.properties.acquisition_status === "POSSESSION_TAKEN"
  ).length;
  const underVerificationParcels = parcelFeatures.filter(
    (f) =>
      f.properties.acquisition_status === "VERIFICATION_PENDING" ||
      f.properties.acquisition_status === "SECTION_11_NOTIFIED" ||
      f.properties.acquisition_status === "SECTION_19_DECLARED" ||
      f.properties.verification_status === "SURVEYED" ||
      f.properties.verification_status === "IN_PROGRESS"
  ).length;
  const disputedParcels = parcelFeatures.filter((f) => f.properties.is_disputed).length;

  const totalAcres = parcelFeatures
    .reduce((acc, f) => acc + (f.properties.total_area_acres || 0), 0)
    .toFixed(2);

  const totalValuationCr = (
    parcelFeatures.reduce(
      (acc, f) => acc + (f.properties.assessed_compensation_inr || 0),
      0
    ) / 10000000
  ).toFixed(2);

  // Export Cadastral CSV
  const handleExportCsv = () => {
    const headers = [
      "Parcel ID",
      "ULPIN (Bhu-Aadhaar)",
      "Khasra Number",
      "Khata Number",
      "Village",
      "Tehsil",
      "Total Area (Acres)",
      "Acquired Area (Acres)",
      "Land Classification",
      "Acquisition Status",
      "Owner Name",
      "Assessed Compensation (INR)",
      "Disputed Flag",
    ];

    const rows = parcelFeatures.map((f) => {
      const p = f.properties;
      return [
        p.parcel_id,
        p.ulpin || "PENDING",
        p.khasra_number,
        p.khata_number,
        p.village_name,
        p.tehsil_name || "",
        p.total_area_acres,
        p.acquired_area_acres,
        p.land_type,
        p.acquisition_status,
        `"${p.owner_name || ""}"`,
        p.assessed_compensation_inr || 0,
        p.is_disputed ? "YES" : "NO",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cadastral_Survey_${activeProjectId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredDirectoryParcels = parcelFeatures.filter((f) => {
    const p = f.properties;
    if (directoryFilter === "ACQUIRED" && p.acquisition_status !== "ACQUIRED" && p.acquisition_status !== "POSSESSION_TAKEN") return false;
    if (directoryFilter === "NOTIFIED" && p.acquisition_status !== "SECTION_11_NOTIFIED" && p.acquisition_status !== "SECTION_19_DECLARED") return false;
    if (directoryFilter === "DISPUTED" && !p.is_disputed) return false;
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Authoritative Cadastral GIS & Spatial Map
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Bhu-Aadhaar Integrated
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-village PostGIS spatial demarcations with 60m RoW corridor buffers, statutory khasras, and valuation layers.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
            <select
              value={activeProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedParcelId("");
              }}
              className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none min-w-[240px] cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} — {p.title.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            title="Download CSV Cadastral Land Schedule"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Schedule CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDirectoryTab(!showDirectoryTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs ${
              showDirectoryTab
                ? "bg-slate-900 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>{showDirectoryTab ? "Hide Cadastre Table" : "Show Cadastre Table"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Total Khasras
            </span>
            <p className="text-xl font-black text-gray-900 mt-0.5">{totalParcels}</p>
            <span className="text-[10px] font-semibold text-gray-500">{totalAcres} Total Acres</span>
          </div>
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
              Acquired / Handed Over
            </span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{acquiredParcels}</p>
            <span className="text-[10px] font-semibold text-emerald-600">
              {totalParcels > 0 ? Math.round((acquiredParcels / totalParcels) * 100) : 0}% Corridor Cleared
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
              Under Sec 11 / 19
            </span>
            <p className="text-xl font-black text-amber-600 mt-0.5">{underVerificationParcels}</p>
            <span className="text-[10px] font-semibold text-amber-600">Statutory Hearing Stage</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider">
              Disputed / Stayed
            </span>
            <p className="text-xl font-black text-rose-600 mt-0.5">{disputedParcels}</p>
            <span className="text-[10px] font-semibold text-rose-600">High Court / Title Suits</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider">
              Est. Compensation
            </span>
            <p className="text-xl font-black text-blue-700 mt-0.5">₹{totalValuationCr} Cr</p>
            <span className="text-[10px] font-semibold text-blue-600">100% Solatium Included</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl border border-gray-300 bg-slate-950 shadow-lg overflow-hidden h-[640px] min-h-[520px]">
        <LeafletParcelMap
          geoJson={effectiveGis}
          selectedParcelId={selectedParcelId}
          height="100%"
          title={`${activeProject?.project_code || "Corridor"} Cadastre`}
          onSelectParcel={(parcelId: string) => {
            setSelectedParcelId(parcelId);
          }}
          onParcelClick={(parcelId: string) => {
            setSelectedParcelId(parcelId);
          }}
        />
      </div>

      {/* Optional Cadastral Directory Table */}
      {showDirectoryTab && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span>Cadastral Parcel Register (Khasra Schedule)</span>
                <span className="text-xs font-bold text-gray-500 font-mono">
                  ({filteredDirectoryParcels.length} Khasras)
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Direct statutory records extracted from State Land Revenue Registry & GIS Survey.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
              {[
                { id: "ALL", label: "All" },
                { id: "ACQUIRED", label: "Acquired" },
                { id: "NOTIFIED", label: "Notified" },
                { id: "DISPUTED", label: "Disputed" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDirectoryFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                    directoryFilter === f.id
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Khasra / ULPIN</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Area (Acres)</th>
                  <th className="py-2.5 px-3">Land Category</th>
                  <th className="py-2.5 px-3">Owner(s)</th>
                  <th className="py-2.5 px-3">Assessed Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDirectoryParcels.map((f) => {
                  const p = f.properties;
                  const isSelected = selectedParcelId === p.parcel_id;

                  return (
                    <tr
                      key={p.parcel_id}
                      onClick={() => setSelectedParcelId(p.parcel_id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        <div className="font-bold text-emerald-800">Khasra #{p.khasra_number}</div>
                        {p.ulpin ? (
                          <code className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1 py-0.5 rounded">
                            {p.ulpin}
                          </code>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        <span className="font-semibold">{p.village_name}</span>
                        <div className="text-[10px] text-gray-400">
                          {p.tehsil_name ? `${p.tehsil_name}, ` : ""}
                          {p.district_name || "Jaipur"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-800 font-medium">
                        {p.total_area_acres} Acres
                        <div className="text-[10px] text-gray-400">
                          Acquired: {p.acquired_area_acres || p.total_area_acres} Ac
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        <span className="capitalize">{p.land_type?.replace(/_/g, " ").toLowerCase()}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 max-w-[160px] truncate" title={p.owner_name}>
                        {p.owner_name || "Revenue Record (ROR)"}
                        {p.owner_count && p.owner_count > 1 ? (
                          <span className="text-[10px] text-gray-400 block">
                            ({p.owner_count} Joint Owners)
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {p.assessed_compensation_inr
                          ? `₹${(p.assessed_compensation_inr / 100000).toFixed(2)} Lakhs`
                          : "Under Assessment"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                          style={{
                            backgroundColor: p.is_disputed
                              ? "#fee2e2"
                              : p.acquisition_status === "ACQUIRED"
                              ? "#dcfce7"
                              : "#fef3c7",
                            color: p.is_disputed
                              ? "#991b1b"
                              : p.acquisition_status === "ACQUIRED"
                              ? "#166534"
                              : "#92400e",
                          }}
                        >
                          {p.status_label || p.acquisition_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/land-parcels/${p.parcel_id}`);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>360° Dossier</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
