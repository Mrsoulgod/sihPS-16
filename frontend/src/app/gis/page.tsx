"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { useProjectParcelsGis } from "@/lib/hooks/useParcels";
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
      <div className="h-full min-h-[500px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Loading GIS Spatial Cadastre Engine...
      </div>
    ),
  }
);

export default function GisMapPage() {
  const router = useRouter();
  const { data: projectList } = useProjects();
  const projects = projectList || [];

  // Default to first project (Delhi-Jaipur Expressway) if available
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const activeProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0].id : "");

  const { data: gisData } = useProjectParcelsGis(activeProjectId);

  const features = gisData?.features || [];
  const totalParcels = features.length;
  const acquiredParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "ACQUIRED" ||
      f.properties.acquisition_status === "POSSESSION_TAKEN"
  ).length;
  const underVerificationParcels = features.filter(
    (f) =>
      f.properties.acquisition_status === "VERIFICATION_PENDING" ||
      f.properties.verification_status === "SURVEYED"
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
                {p.project_code} — {p.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics & Legend Ribbon */}
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
            <span className="text-[10px] uppercase font-bold text-amber-500 block">Under Verification</span>
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
      <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-17rem)] min-h-[500px]">
        <LeafletParcelMap
          geoJson={gisData}
          height="100%"
          onParcelClick={(parcelId: string) => {
            router.push(`/land-parcels/${parcelId}`);
          }}
        />

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/95 backdrop-blur-sm p-3 shadow-lg border border-gray-200 text-xs space-y-2 pointer-events-auto">
          <div className="font-bold text-[11px] text-gray-800 uppercase tracking-wider">
            Cadastre Legend
          </div>
          <div className="space-y-1 text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#16a34a] border border-green-700 shrink-0" />
              <span>Acquired / Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#22c55e] border border-green-600 shrink-0" />
              <span>Proposed / Active Demarcation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#d97706] border border-amber-600 shrink-0" />
              <span>Under Field Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#dc2626] border border-red-700 shrink-0" />
              <span>Disputed / High Sensitivity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#94a3b8] border border-slate-500 shrink-0" />
              <span>Inactive / Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
