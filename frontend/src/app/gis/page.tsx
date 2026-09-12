"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { MOCK_PROJECTS } from "@/lib/api/mock_fallback";
import { DEFAULT_FALLBACK_GIS } from "@/components/gis/LeafletParcelMap";
import {
  MapPin,
  Building2,
  Layers,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] min-h-[500px] w-full rounded-xl bg-slate-900 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-700">
        Loading GIS Spatial Cadastre Engine...
      </div>
    ),
  }
);

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = (projectList && projectList.length > 0) ? projectList : MOCK_PROJECTS;

  // Default to first project (Delhi-Jaipur Expressway) if available
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const activeProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0].id : "PRJ-NH48-PKG4");

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  const effectiveGis =
    gisData && gisData.features && gisData.features.length > 0
      ? gisData
      : DEFAULT_FALLBACK_GIS;

  const features = effectiveGis.features || [];
  const totalParcels = features.length;
  const acquiredParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "ACQUIRED" ||
      f.properties.acquisition_status === "POSSESSION_TAKEN"
  ).length;
  const underVerificationParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "VERIFICATION_PENDING" ||
      f.properties.acquisition_status === "SECTION_11_NOTIFIED" ||
      f.properties.verification_status === "SURVEYED" ||
      f.properties.verification_status === "IN_PROGRESS"
  ).length;
  const disputedParcels = features.filter((f) => f.properties.is_disputed).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary-700" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              National Cadastral GIS & Spatial Map
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Authoritative PostGIS spatial cadastre with multi-village boundaries, khasra demarcations, and acquisition status.
          </p>
        </div>

        {/* Project Selector Bar */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={activeProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 min-w-[280px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} — {p.title.slice(0, 42)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Parcels</span>
            <p className="text-base font-bold text-gray-900">{totalParcels}</p>
          </div>
          <Layers className="h-5 w-5 text-gray-300" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-green-500 block">Acquired</span>
            <p className="text-base font-bold text-green-600">{acquiredParcels}</p>
          </div>
          <div className="h-3.5 w-3.5 rounded bg-green-500" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 block">Under Verification / Notified</span>
            <p className="text-base font-bold text-amber-600">{underVerificationParcels}</p>
          </div>
          <div className="h-3.5 w-3.5 rounded bg-amber-500" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-500 block">Disputed / Critical</span>
            <p className="text-base font-bold text-red-600">{disputedParcels}</p>
          </div>
          <div className="h-3.5 w-3.5 rounded bg-red-500" />
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-xl border border-gray-200 bg-slate-900 shadow-sm overflow-hidden h-[620px] min-h-[500px]">
        <LeafletParcelMap
          geoJson={effectiveGis}
          height="100%"
          title="National Cadastral Map"
          onParcelClick={(parcelId: string) => {
            router.push(`/land-parcels/${parcelId}`);
          }}
        />
      </div>
    </div>
  );
}

