"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useParcelDetail } from "@/lib/hooks/useParcels";
import { FieldVerificationModal } from "@/components/parcels/FieldVerificationModal";
import {
  Layers,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  FileText,
  Trees,
  Home,
  Droplets,
} from "lucide-react";

// Dynamically import Leaflet map
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Loading Cadastral Boundary...
      </div>
    ),
  }
);

export default function ParcelDetailPage() {
  const params = useParams();
  const parcelId = params?.parcelId as string;
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const { data: parcel, isLoading, error } = useParcelDetail(parcelId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-28 w-full bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-96 w-full bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="max-w-xl mx-auto my-12 rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
        <h2 className="text-base font-bold">Land Parcel Not Found</h2>
        <p className="text-xs mt-1">The requested cadastral parcel record could not be loaded.</p>
        <Link
          href="/land-parcels"
          className="mt-4 inline-flex items-center text-xs font-semibold text-primary-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Parcel Cadastre
        </Link>
      </div>
    );
  }

  // Create a single-feature GeoJSON for the mini map
  const parcelGeoJson = parcel.geojson_polygon
    ? {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            id: parcel.id,
            geometry: parcel.geojson_polygon,
            properties: {
              parcel_id: parcel.id,
              khasra_number: parcel.khasra_number,
              khata_number: parcel.khata_number,
              village_name: parcel.village_name,
              total_area_acres: parcel.total_area_acres,
              acquired_area_acres: parcel.acquired_area_acres,
              land_type: parcel.land_type,
              acquisition_status: parcel.acquisition_status,
              status_label: parcel.acquisition_status,
              verification_status: parcel.verification_status,
              is_disputed: parcel.is_disputed,
              current_stage: parcel.current_workflow_stage,
              fillColor: parcel.is_disputed
                ? "#dc2626"
                : parcel.acquisition_status === "ACQUIRED"
                ? "#16a34a"
                : parcel.acquisition_status === "VERIFICATION_PENDING"
                ? "#d97706"
                : "#22c55e",
            },
          },
        ],
        metadata: {
          center: [parcel.centroid_latitude || 27.7050, parcel.centroid_longitude || 76.2050] as [number, number],
        },
      }
    : undefined;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/land-parcels" className="hover:text-gray-900 transition-colors">
          Land Parcels
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-semibold text-gray-800">Khasra #{parcel.khasra_number}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                Khasra #{parcel.khasra_number}
              </span>
              {parcel.khata_number && (
                <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  Khata #{parcel.khata_number}
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  parcel.acquisition_status === "ACQUIRED"
                    ? "bg-green-100 text-green-800"
                    : parcel.acquisition_status === "VERIFICATION_PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {parcel.acquisition_status}
              </span>
              {parcel.is_disputed && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  DISPUTED
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Parcel {parcel.khasra_number} • {parcel.village_name || "Revenue Village"}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                Project:{" "}
                <Link
                  href={`/projects/${parcel.project_id}`}
                  className="font-semibold text-primary-700 hover:underline ml-0.5"
                >
                  {parcel.project_title || "Linked Project"}
                </Link>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                District:{" "}
                <strong className="text-gray-700 ml-0.5">
                  {parcel.district_name || "District"}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                Land Category:{" "}
                <strong className="text-gray-700 ml-0.5">{parcel.land_type}</strong>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              <UserCheck className="h-4 w-4 mr-1.5" />
              Record Field Verification
            </button>
          </div>
        </div>

        {/* Metrics Ribbon */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Demarcated Area</span>
            <p className="text-base font-bold text-gray-900 mt-0.5">{parcel.total_area_acres} Acres</p>
            <span className="text-[10px] text-gray-500">{(parcel.total_area_acres * 0.404686).toFixed(3)} Hectares</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Circle Rate Valuation</span>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              ₹{parcel.circle_rate_per_sqm ? (parcel.circle_rate_per_sqm * 4046.86 * parcel.total_area_acres / 100000).toFixed(2) : "N/A"} Lakh
            </p>
            <span className="text-[10px] text-gray-500">
              @ ₹{parcel.circle_rate_per_sqm?.toLocaleString() || "N/A"} / sqm
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Verification Status</span>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {parcel.verification_status || "PENDING"}
            </p>
            <span className="text-[10px] text-emerald-600">
              {parcel.field_verifications?.length || 0} survey report(s)
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Statutory Stage</span>
            <p className="text-sm font-bold text-primary-700 mt-0.5">
              {parcel.current_workflow_stage || "LAND_VERIFICATION"}
            </p>
            <span className="text-[10px] text-gray-500">Current acquisition step</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ownership & Survey Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Land Ownership & Masked PII */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary-700" />
                  Recorded Landowners & Titleholders ({parcel.owners?.length || 0})
                </h3>
                <p className="text-xs text-gray-500">
                  Authoritative Jamabandi records. Sensitive Aadhaar & bank details masked per data privacy standards.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {parcel.owners && parcel.owners.length > 0 ? (
                parcel.owners.map((owner) => (
                  <div
                    key={owner.id}
                    className="rounded-lg border border-gray-200 p-3.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-gray-900">{owner.full_name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100">
                            {owner.social_category || "GENERAL"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Relation: <strong>{owner.relative_name || "N/A"}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-primary-800">
                          {owner.ownership_share_percent}% Share
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {owner.extent_area_acres ? `${owner.extent_area_acres.toFixed(3)} Acres` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Masked Data Grid */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] border-t border-gray-200/60 pt-2 text-gray-600">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Aadhaar / National ID</span>
                        <span className="font-mono text-gray-800">{owner.masked_aadhaar}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Bank Institution</span>
                        <span className="font-mono text-gray-800">{owner.bank_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Bank Account</span>
                        <span className="font-mono text-gray-800">{owner.masked_bank_account}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  No landowner records attached.
                </div>
              )}
            </div>
          </div>

          {/* Field Verification Survey History */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary-700" />
                  Ground Survey & Field Verification Reports
                </h3>
                <p className="text-xs text-gray-500">
                  Chronological physical site survey inspection records by Field Officers.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {parcel.field_verifications && parcel.field_verifications.length > 0 ? (
                parcel.field_verifications.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              v.verification_status === "SURVEYED" || v.verification_status === "RECOMMENDED"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {v.verification_status}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">
                            Verified by {v.verified_by_name || "Field Officer"} ({v.verified_by_role})
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Survey Date: {new Date(v.verification_date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Verified Ground Assets */}
                    <div className="grid grid-cols-3 gap-2 rounded bg-gray-50 p-2 text-xs border border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Trees className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{v.trees_count} Trees</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Home className="h-3.5 w-3.5 text-amber-600" />
                        <span>{v.structures_count} Structures</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Droplets className="h-3.5 w-3.5 text-blue-600" />
                        <span>{v.wells_count} Wells</span>
                      </div>
                    </div>

                    {v.ground_survey_notes && (
                      <p className="text-xs text-gray-600 italic bg-gray-50/50 p-2 rounded">
                        &ldquo;{v.ground_survey_notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  No ground verification reports recorded yet. Click &quot;Record Field Verification&quot; to submit.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Cadastral Map & Parcel Boundaries */}
        <div className="space-y-6">
          {/* Cadastral Boundary Map */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary-700" />
              Cadastral Boundary Geometry
            </h3>
            <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200">
              {parcelGeoJson ? (
                <LeafletParcelMap geoJson={parcelGeoJson as any} height="100%" />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No spatial polygon geometry available.
                </div>
              )}
            </div>
            <div className="text-[11px] text-gray-500 space-y-1 pt-1">
              <p>
                Coordinate Reference: <strong>EPSG:4326 (WGS 84)</strong>
              </p>
              <p>
                Spatial System: <strong>PostGIS 3.4 Polygon</strong>
              </p>
            </div>
          </div>

          {/* Statutory Documents */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary-700" />
              Attached Land Documents
            </h3>
            <div className="space-y-2">
              {[
                { name: "Jamabandi Extract (RoR)", size: "420 KB", date: "Jan 2024" },
                { name: "Cadastral Map Trace (Aks Shajra)", size: "1.8 MB", date: "Feb 2024" },
                { name: "Field Survey Form 4", size: "640 KB", date: "Mar 2024" },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded border border-gray-100 hover:bg-gray-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-800">{doc.name}</p>
                      <span className="text-[10px] text-gray-400">{doc.date} • {doc.size}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-primary-700 font-semibold cursor-pointer hover:underline">
                    View
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Field Verification Modal */}
      <FieldVerificationModal
        parcelId={parcel.id}
        khasraNumber={parcel.khasra_number}
        villageName={parcel.village_name}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
}
