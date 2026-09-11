"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, MapPin, Trees, Home, Droplets } from "lucide-react";
import { useFieldVerification } from "@/lib/hooks/useParcels";

interface FieldVerificationModalProps {
  parcelId: string;
  khasraNumber: string;
  villageName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FieldVerificationModal({
  parcelId,
  khasraNumber,
  villageName,
  isOpen,
  onClose,
  onSuccess,
}: FieldVerificationModalProps) {
  const [discrepanciesFound, setDiscrepanciesFound] = useState(false);
  const [findings, setFindings] = useState("");
  const [treesCount, setTreesCount] = useState(0);
  const [structuresCount, setStructuresCount] = useState(0);
  const [wellsCount, setWellsCount] = useState(0);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [recommendation, setRecommendation] = useState<"RECOMMENDED" | "RE_SURVEY_REQUIRED" | "REJECTED">("RECOMMENDED");
  const [remarks, setRemarks] = useState("");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const verifyMutation = useFieldVerification(parcelId);

  if (!isOpen) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
      },
      (err) => {
        setGpsError(`Unable to retrieve GPS coordinates: ${err.message}`);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verifyMutation.mutateAsync({
        discrepancies_found: discrepanciesFound,
        findings: findings || undefined,
        trees_count: Number(treesCount) || 0,
        structures_count: Number(structuresCount) || 0,
        wells_count: Number(wellsCount) || 0,
        latitude: latitude,
        longitude: longitude,
        remarks: remarks || undefined,
        recommendation: recommendation,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch {
      // Error handled by verifyMutation.error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Record Field Verification</h2>
            <p className="text-xs text-gray-500">
              Khasra #{khasraNumber} {villageName ? `• Village: ${villageName}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {verifyMutation.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
              <span>
                {verifyMutation.error instanceof Error
                  ? verifyMutation.error.message
                  : "Failed to record field verification"}
              </span>
            </div>
          )}

          {/* Recommendation */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Survey Recommendation *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "RECOMMENDED", label: "Recommended", color: "border-green-500 bg-green-50 text-green-800" },
                { id: "RE_SURVEY_REQUIRED", label: "Re-Survey", color: "border-amber-500 bg-amber-50 text-amber-800" },
                { id: "REJECTED", label: "Disputed / Reject", color: "border-red-500 bg-red-50 text-red-800" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRecommendation(item.id as any)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    recommendation === item.id
                      ? `${item.color} shadow-sm ring-1 ring-current`
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-primary-600" />
                GPS Coordinates
              </span>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="text-xs text-primary-700 hover:text-primary-800 font-medium underline"
              >
                Auto-Capture Location
              </button>
            </div>
            {gpsError && (
              <p className="text-xs text-red-600 mb-2">{gpsError}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude ?? ""}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 27.702511"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude ?? ""}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 76.201452"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Assets On Ground */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Verified Assets on Ground
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                  <Trees className="h-3 w-3 mr-1 text-emerald-600" /> Trees
                </label>
                <input
                  type="number"
                  min="0"
                  value={treesCount}
                  onChange={(e) => setTreesCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                  <Home className="h-3 w-3 mr-1 text-amber-600" /> Structures
                </label>
                <input
                  type="number"
                  min="0"
                  value={structuresCount}
                  onChange={(e) => setStructuresCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                  <Droplets className="h-3 w-3 mr-1 text-blue-600" /> Wells
                </label>
                <input
                  type="number"
                  min="0"
                  value={wellsCount}
                  onChange={(e) => setWellsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Discrepancies toggle */}
          <div className="pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={discrepanciesFound}
                onChange={(e) => setDiscrepanciesFound(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-gray-800">
                Discrepancies or Boundary Mismatch Found on Ground
              </span>
            </label>
          </div>

          {discrepanciesFound && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Discrepancy Details *
              </label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={2}
                placeholder="Describe boundary overlaps, encroached areas, or unrecorded structures..."
                className="w-full rounded-md border border-amber-300 bg-amber-50/30 px-3 py-2 text-xs text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Field Officer Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Add field observations, witness statements, or general verification notes..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={verifyMutation.isPending || isSuccess}
              className="rounded-lg px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyMutation.isPending || isSuccess}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-colors ${
                isSuccess ? "bg-emerald-700" : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isSuccess
                ? "Verification Recorded"
                : verifyMutation.isPending
                ? "Submitting..."
                : "Submit Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
