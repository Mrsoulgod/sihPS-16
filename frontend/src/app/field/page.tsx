"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  MapPin,
  Camera,
  Trees,
  CheckCircle2,
  RefreshCw,
  Send,
  Save,
  ShieldAlert,
  UserCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useAuth } from "@/lib/hooks/useAuth";

interface AssignedParcel {
  id: string;
  project_id: string;
  khasra_number: string;
  khata_number: string;
  total_area_acres: number;
  acquired_area_acres: number;
  land_type: string;
  acquisition_status: string;
  is_disputed: boolean;
  owners: {
    owner_id: string;
    name: string;
    share_percentage: number;
  }[];
}

export default function FieldSurveyPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [parcels, setParcels] = useState<AssignedParcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<AssignedParcel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 4-point Statutory Verification Checklist
  const [boundaryVerified, setBoundaryVerified] = useState(false);
  const [occupancySurveyed, setOccupancySurveyed] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [assetsEnumerated, setAssetsEnumerated] = useState(false);
  const [treesCount, setTreesCount] = useState<number>(0);
  const [gpsCoordinates, setGpsCoordinates] = useState("27.6534 N, 76.1287 E");
  const [surveyRemarks, setSurveyRemarks] = useState("");

  const fetchAssignedParcels = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<AssignedParcel[]>("/api/v1/field/assigned-parcels");
      setParcels(res.data || []);
      if (res.data?.length && !selectedParcel) {
        setSelectedParcel(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load assigned parcels:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedParcels();
  }, []);

  const handleCaptureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoordinates(`${pos.coords.latitude.toFixed(5)} N, ${pos.coords.longitude.toFixed(5)} E`);
        },
        (err) => {
          console.warn("Geo fallback to default:", err);
        }
      );
    }
  };

  const handleSubmitVerification = async (isDraft: boolean) => {
    if (!selectedParcel) return;
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      const res = await apiClient<any>(`/api/v1/field/parcels/${selectedParcel.id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          boundary_verified: boundaryVerified,
          occupancy_and_crop_surveyed: occupancySurveyed,
          title_holder_kyc_verified: kycVerified,
          non_land_assets_enumerated: assetsEnumerated,
          survey_remarks: surveyRemarks || "Physical ground inspection executed as per Section 12/15 standard guidelines.",
          gps_coordinates: gpsCoordinates,
          trees_count: Number(treesCount),
          is_draft: isDraft,
        }),
      });
      setSuccessMessage(res.message || (isDraft ? "Draft survey saved successfully." : "Verification report submitted to CALA."));
      if (!isDraft) {
        fetchAssignedParcels();
      }
    } catch (err: any) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Mobile Officer Top Bar */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-700/10 p-2 text-emerald-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Revenue Field Officer Survey Portal
              </h1>
              <p className="text-xs font-medium text-muted-foreground">
                Cadastral Ground Truthing, 4-Point Verification Checklist & Tree Enumeration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
              Officer: {user?.full_name || "Revenue Inspector"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Assigned Parcels Selector */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Assigned Field Queue ({parcels.length})
          </h2>
          <div className="space-y-2.5">
            {parcels.map((p) => {
              const isSelected = selectedParcel?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedParcel(p);
                    setSuccessMessage(null);
                  }}
                  className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30 shadow-xs"
                      : "border-border bg-card hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">Khasra {p.khasra_number}</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {p.land_type}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Khata: {p.khata_number}</span>
                    <span>{Number(p.acquired_area_acres).toFixed(2)} Acres</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Point Checklist & Form */}
        <div className="md:col-span-2 space-y-5">
          {selectedParcel ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-5">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  Verification Dossier: Khasra {selectedParcel.khasra_number}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record title holder, physical boundaries, and agricultural assets.
                </p>
              </div>

              {successMessage && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Title Owners */}
              <div className="rounded-lg border border-border/70 bg-slate-50/50 p-3 text-xs">
                <span className="font-bold text-slate-700">Recorded Title Holders:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedParcel.owners?.map((o) => (
                    <span key={o.owner_id} className="rounded bg-white border border-border px-2 py-1 font-medium">
                      {o.name} ({o.share_percentage}%)
                    </span>
                  ))}
                </div>
              </div>

              {/* 4-Point Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mandatory Statutory 4-Point Verification
                </h4>

                <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={boundaryVerified}
                    onChange={(e) => setBoundaryVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-900">1. Physical Ground Boundary Matched with Cadastre</strong>
                    <p className="text-muted-foreground mt-0.5">Ground boundaries align with digital map polygon coordinates.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={occupancySurveyed}
                    onChange={(e) => setOccupancySurveyed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-900">2. Occupancy & Standing Crop Inspection Completed</strong>
                    <p className="text-muted-foreground mt-0.5">Physical possession status and standing rabi/kharif crops verified.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kycVerified}
                    onChange={(e) => setKycVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-900">3. Title Holder Physical Identification / KYC</strong>
                    <p className="text-muted-foreground mt-0.5">Land title holder KYC and bank account passbook verified for direct DBT.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assetsEnumerated}
                    onChange={(e) => setAssetsEnumerated(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-900">4. Non-Land Assets Enumeration (Trees, Wells, Structures)</strong>
                    <p className="text-muted-foreground mt-0.5">Number of fruit/timber trees and civil structures enumerated.</p>
                  </div>
                </label>
              </div>

              {/* Asset Details & GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enumerated Trees Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={treesCount}
                    onChange={(e) => setTreesCount(Number(e.target.value))}
                    className="w-full rounded border border-border px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    GPS Coordinates (Field Auto-Tag)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={gpsCoordinates}
                      className="w-full rounded border border-border bg-slate-50 px-3 py-1.5 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      className="rounded bg-slate-200 px-2.5 py-1.5 font-bold hover:bg-slate-300"
                      title="Capture Device GPS"
                    >
                      <MapPin className="h-4 w-4 text-slate-700" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field Survey Officer Remarks
                </label>
                <textarea
                  rows={2}
                  value={surveyRemarks}
                  onChange={(e) => setSurveyRemarks(e.target.value)}
                  placeholder="Record ground observations, tenant presence, or boundary notes..."
                  className="w-full rounded border border-border p-2.5 text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitVerification(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold shadow-xs hover:bg-muted"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !boundaryVerified || !occupancySurveyed || !kycVerified || !assetsEnumerated}
                  onClick={() => handleSubmitVerification(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Final Report to CALA
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground text-xs">
              Select a parcel from your queue to begin field verification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
