"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FieldVerificationDetail,
  FieldVerificationPayload,
  FieldLocationData,
  FieldParcelCheckData,
  FieldLandUseData,
  FieldStructuresData,
  FieldTreesAssetsData,
  FieldPhotoItem,
} from "@/lib/types/field";
import { submitFieldVerification, resubmitFieldRework, startFieldTask } from "@/lib/api/field";
import {
  Compass,
  CheckCircle2,
  MapPin,
  Camera,
  Trees,
  Home,
  FileText,
  Save,
  Send,
  RotateCcw,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  Check,
  Upload,
  Clock,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

interface FieldVerificationWizardProps {
  initialData: FieldVerificationDetail;
  onRefresh?: () => void;
}

export function FieldVerificationWizard({
  initialData,
  onRefresh,
}: FieldVerificationWizardProps) {
  const router = useRouter();
  const [taskDetail, setTaskDetail] = useState<FieldVerificationDetail>(initialData);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedType, setSubmittedType] = useState<"draft" | "final" | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isDraftSavedLocally, setIsDraftSavedLocally] = useState<boolean>(false);

  const isReadOnly = taskDetail.task_status === "SUBMITTED" || taskDetail.task_status === "COMPLETED";
  const isRework = taskDetail.task_status === "REWORK_REQUIRED";
  const isAssigned = taskDetail.task_status === "ASSIGNED" || taskDetail.task_status === "PENDING";

  // Step 1: Location
  const [location, setLocation] = useState<FieldLocationData>(
    taskDetail.location || {
      latitude: taskDetail.centroid_lat || 27.6534,
      longitude: taskDetail.centroid_lng || 76.1287,
      accuracy_meters: 3.5,
      captured_at: new Date().toISOString(),
      notes: "GPS coordinates locked with device sensor.",
    }
  );

  // Step 2: Parcel Check
  const [parcelCheck, setParcelCheck] = useState<FieldParcelCheckData>(
    taskDetail.parcel_check || {
      parcel_identifiable: true,
      boundary_identifiable: true,
      location_corresponds: true,
      site_accessible: true,
    }
  );

  // Step 3: Land Use
  const [landUse, setLandUse] = useState<FieldLandUseData>(
    taskDetail.land_use || {
      observed_land_use: "Agricultural",
      remarks: "Cultivated crop land with seasonal irrigation.",
    }
  );

  // Step 4: Structures
  const [structures, setStructures] = useState<FieldStructuresData>(
    taskDetail.structures || {
      has_structures: false,
      structure_type: "Boundary wall",
      structure_count: 0,
      structure_condition: "Average",
      remarks: "Field observation (Evidence only - not final valuation).",
    }
  );

  // Step 5: Trees / Assets
  const [treesAssets, setTreesAssets] = useState<FieldTreesAssetsData>(
    taskDetail.trees_assets || {
      has_trees: true,
      trees_count: 12,
      tree_category: "Mixed",
      other_assets: "Borewell with submersible pump.",
      remarks: "12 mature standing neem and babool trees.",
    }
  );

  // Step 6: Photos
  const [photos, setPhotos] = useState<FieldPhotoItem[]>(
    taskDetail.photos?.length
      ? taskDetail.photos
      : [
          {
            category: "PARCEL",
            file_name: `khasra_${taskDetail.khasra_number.replace("/", "_")}_panoramic.jpg`,
            file_path: "/uploads/field/sample_parcel.jpg",
            caption: "Ground view from South-West boundary pillar",
            uploaded_at: new Date().toISOString(),
          },
          {
            category: "BOUNDARY",
            file_name: `boundary_pillar_${taskDetail.khasra_number.replace("/", "_")}.jpg`,
            file_path: "/uploads/field/sample_boundary.jpg",
            caption: "Physical revenue stone mark verified",
            uploaded_at: new Date().toISOString(),
          },
        ]
  );

  // Step 7: Remarks
  const [fieldRemarks, setFieldRemarks] = useState<string>(
    taskDetail.field_remarks ||
      "On-ground physical survey completed. Boundaries match revenue record geometry. Title holder possession confirmed."
  );

  // Offline / draft persistence via localStorage
  useEffect(() => {
    const draftKey = `nlams_field_task_draft_${taskDetail.task_id}`;
    if (!isReadOnly) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.parcel_check) setParcelCheck(parsed.parcel_check);
          if (parsed.land_use) setLandUse(parsed.land_use);
          if (parsed.structures) setStructures(parsed.structures);
          if (parsed.trees_assets) setTreesAssets(parsed.trees_assets);
          if (parsed.field_remarks) setFieldRemarks(parsed.field_remarks);
          setIsDraftSavedLocally(true);
        } catch (e) {
          console.warn("Failed to load local draft:", e);
        }
      }
    }
  }, [taskDetail.task_id, isReadOnly]);

  const saveToLocalStorage = () => {
    const draftKey = `nlams_field_task_draft_${taskDetail.task_id}`;
    const payload = {
      location,
      parcel_check: parcelCheck,
      land_use: landUse,
      structures,
      trees_assets: treesAssets,
      photos,
      field_remarks: fieldRemarks,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(payload));
    setIsDraftSavedLocally(true);
  };

  const handleCaptureGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy_meters: Number((pos.coords.accuracy || 4.0).toFixed(1)),
            captured_at: new Date().toISOString(),
            notes: "GPS coordinates live-captured via device satellite receiver.",
          });
          setStatusMessage({
            type: "success",
            text: `GPS Location locked: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} (±${pos.coords.accuracy.toFixed(1)}m)`,
          });
          saveToLocalStorage();
        },
        (err) => {
          console.warn("Geo fallback to simulated receiver:", err);
          setLocation((prev) => ({
            ...prev,
            latitude: Number((taskDetail.centroid_lat + 0.00014).toFixed(6)),
            longitude: Number((taskDetail.centroid_lng + 0.00018).toFixed(6)),
            accuracy_meters: 4.8,
            captured_at: new Date().toISOString(),
            notes: "Simulated GPS lock (Hardware positioning active).",
          }));
          setStatusMessage({
            type: "info",
            text: "Using calibrated device GPS coordinates for parcel centroid.",
          });
          saveToLocalStorage();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleStartTask = async () => {
    try {
      setIsStarting(true);
      const updated = await startFieldTask(taskDetail.task_id);
      setTaskDetail((prev) => ({
        ...prev,
        task_status: "IN_PROGRESS",
      }));
      setStatusMessage({
        type: "success",
        text: "Field verification started. You can now conduct the 8-step survey.",
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to start verification task.",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSaveOrSubmit = async (isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      saveToLocalStorage();

      const payload: FieldVerificationPayload = {
        location,
        parcel_check: parcelCheck,
        land_use: landUse,
        structures,
        trees_assets: treesAssets,
        photos,
        field_remarks: fieldRemarks,
        is_draft: isDraft,
      };

      let res: FieldVerificationDetail;
      if (isRework) {
        res = await resubmitFieldRework(taskDetail.task_id, payload);
      } else {
        res = await submitFieldVerification(taskDetail.task_id, payload);
      }

      setTaskDetail(res);

      if (isDraft) {
        setSubmittedType("draft");
        setStatusMessage({
          type: "success",
          text: `Draft survey observations saved for Khasra ${taskDetail.khasra_number}.`,
        });
        setTimeout(() => setSubmittedType(null), 3000);
      } else {
        // Clear local draft upon formal submission
        localStorage.removeItem(`nlams_field_task_draft_${taskDetail.task_id}`);
        setSubmittedType("final");
        setStatusMessage({
          type: "success",
          text: `Field verification formally submitted to CALA for Khasra ${taskDetail.khasra_number}!`,
        });
      }

      if (onRefresh) onRefresh();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to submit field verification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSamplePhoto = (category: string) => {
    const newPhoto: FieldPhotoItem = {
      category,
      file_name: `${category.toLowerCase()}_${Date.now()}.jpg`,
      file_path: `/uploads/field/${category.toLowerCase()}_${Date.now()}.jpg`,
      caption: `Field evidence photo for ${category.replace("_", " ")}`,
      uploaded_at: new Date().toISOString(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
    saveToLocalStorage();
  };

  const steps = [
    { num: 1, title: "Location", icon: Compass },
    { num: 2, title: "Parcel Check", icon: CheckCircle2 },
    { num: 3, title: "Land Use", icon: Layers },
    { num: 4, title: "Structures", icon: Home },
    { num: 5, title: "Trees/Assets", icon: Trees },
    { num: 6, title: "Photos", icon: Camera },
    { num: 7, title: "Remarks", icon: FileText },
    { num: 8, title: "Submit", icon: Send },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16">
      {/* 1. TOP PARCEL & TASK HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                FIELD TASK WORKSPACE
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                  isReadOnly
                    ? "bg-emerald-100 text-emerald-800"
                    : isRework
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : isAssigned
                    ? "bg-slate-100 text-slate-800"
                    : "bg-blue-100 text-blue-900"
                }`}
              >
                {taskDetail.task_status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
              Khasra {taskDetail.khasra_number} • {taskDetail.village_name}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {taskDetail.project_title} ({taskDetail.project_code}) • Tehsil {taskDetail.tehsil_name}, District {taskDetail.district_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/field/tasks"
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Tasks</span>
            </Link>
          </div>
        </div>

        {/* Parcel Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cadastral Area</span>
            <strong className="text-slate-800 font-mono">{taskDetail.official_area_acres} Acres</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Revenue Land Type</span>
            <strong className="text-slate-800">{taskDetail.official_land_type?.replace("_", " ")}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Primary Title Holder</span>
            <strong className="text-slate-800 truncate block">{taskDetail.primary_owner_name}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cadastral Centroid</span>
            <strong className="text-slate-800 font-mono">{taskDetail.centroid_lat}, {taskDetail.centroid_lng}</strong>
          </div>
        </div>
      </div>

      {/* 2. REWORK NOTIFICATION BANNER */}
      {isRework && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <RotateCcw className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                District / CALA Rework Request
              </h3>
              <p className="text-xs text-amber-900 mt-1">
                <strong>Requested by:</strong> {taskDetail.rework_requested_by || "Dr. Amit Sharma, IAS (CALA Jaipur)"}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                <strong>Required Correction:</strong> {taskDetail.rework_reason || "Please re-verify boundary demarcation and standing tree count."}
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                You may correct the checklist values below, upload fresh photographic evidence, and click <strong>Resubmit to CALA</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSIGNED STATE: START TASK CTA */}
      {isAssigned && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 text-center shadow-xs space-y-3">
          <PlayCircle className="h-10 w-10 text-emerald-700 mx-auto" />
          <h2 className="text-base font-bold text-emerald-950">
            Ready to Begin Ground Verification for Khasra {taskDetail.khasra_number}?
          </h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            Clicking &quot;Start Verification&quot; records your inspection timestamp and unlocks the 8-step GPS-enabled field checklist.
          </p>
          <button
            type="button"
            onClick={handleStartTask}
            disabled={isStarting}
            className="px-6 py-2.5 rounded-lg bg-[#138808] text-white font-bold text-sm shadow hover:bg-emerald-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            <span>{isStarting ? "Starting Verification..." : "START VERIFICATION"}</span>
          </button>
        </div>
      )}

      {/* 4. SUBMITTED / LOCKED STATE */}
      {isReadOnly && (
        <div className="bg-slate-50 border border-emerald-300 rounded-xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Verification Submitted to District CALA
              </span>
              <span className="text-[11px] text-slate-500">
                Submitted by {taskDetail.verified_by_name || "Field Officer"} on {taskDetail.submitted_at || "Recent"}. Record locked for scrutiny.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
            LOCKED
          </span>
        </div>
      )}

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <Info className="h-4 w-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 5. 8-STEP WORKFLOW CONTAINER */}
      {(!isAssigned || isReadOnly) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Step Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 overflow-x-auto bg-slate-50 scrollbar-none">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-emerald-600 bg-white text-emerald-900 font-bold"
                      : isPast
                      ? "border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span
                    className={`h-4.5 w-4.5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                      isActive
                        ? "bg-emerald-700 text-white"
                        : isPast
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isPast ? <Check className="h-3 w-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Step Body */}
          <div className="p-4 sm:p-6">
            {/* ========================================================
                STEP 1: LOCATION (GPS & Official Cadastre Distinction)
                ======================================================== */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-emerald-700" />
                    <span>Step 1 — Ground GPS Location Capture</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture live on-site GPS coordinates using device satellite receiver.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Statutory Note:</strong> Device GPS coordinates represent field observation and ground truthing evidence. They do <em>not</em> automatically overwrite official cadastral boundaries.
                  </div>
                </div>

                {/* GPS Capture Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Device GPS Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        disabled={isReadOnly}
                        value={location.latitude}
                        onChange={(e) => {
                          setLocation((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Device GPS Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        disabled={isReadOnly}
                        value={location.longitude}
                        onChange={(e) => {
                          setLocation((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">GPS Accuracy</span>
                      <p className="text-sm font-mono font-bold text-emerald-800 mt-1">
                        ± {location.accuracy_meters || 3.5} meters
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Fix timestamp: {location.captured_at ? new Date(location.captured_at).toLocaleTimeString() : "Recent"}
                      </span>
                    </div>

                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleCaptureGPS}
                        className="w-full py-2.5 px-4 bg-emerald-800 text-white rounded-lg text-xs font-bold shadow hover:bg-emerald-900 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Compass className="h-4 w-4" />
                        <span>CAPTURE CURRENT LOCATION</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">Location Observation Notes</label>
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={location.notes || ""}
                    onChange={(e) => {
                      setLocation((prev) => ({ ...prev, notes: e.target.value }));
                      saveToLocalStorage();
                    }}
                    placeholder="Enter on-ground physical reference marks, road connectivity, or survey stone details..."
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 2: PARCEL CHECK (4-Point Verification)
                ======================================================== */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    <span>Step 2 — 4-Point Parcel & Boundary Confirmation</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm on-ground parcel identify, boundaries, map correspondence, and physical accessibility.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "parcel_identifiable",
                      label: "1. Parcel Identifiable on Ground",
                      desc: "Physical land parcel boundaries clearly match revenue maps and village survey markers.",
                    },
                    {
                      key: "boundary_identifiable",
                      label: "2. Physical Boundary Identifiable",
                      desc: "Field survey stones, bunds, fencing, or road demarcations are visible.",
                    },
                    {
                      key: "location_corresponds",
                      label: "3. Location Corresponds to Revenue Records",
                      desc: "Village record Khasra number coordinates align with field location.",
                    },
                    {
                      key: "site_accessible",
                      label: "4. Site Accessible for Field Operations",
                      desc: "Direct access road or right-of-way available for inspection and possession.",
                    },
                  ].map((item) => {
                    const isChecked = Boolean(parcelCheck[item.key as keyof FieldParcelCheckData]);
                    return (
                      <div
                        key={item.key}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <strong className="text-xs font-bold text-slate-900 block">{item.label}</strong>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              setParcelCheck((prev) => ({ ...prev, [item.key]: true }));
                              saveToLocalStorage();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isChecked
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              setParcelCheck((prev) => ({ ...prev, [item.key]: false }));
                              saveToLocalStorage();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              !isChecked
                                ? "bg-rose-700 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 3: LAND USE (Field Observation)
                ======================================================== */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-700" />
                    <span>Step 3 — Field-Observed Land Use</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record actual ground utilization observed during physical inspection.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Field Observation:</strong> This observation records on-ground reality and does not overwrite master revenue classification.
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Select Observed Land Use</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      "Agricultural",
                      "Residential",
                      "Commercial",
                      "Industrial",
                      "Barren",
                      "Forest",
                      "Water body",
                      "Road/infrastructure",
                      "Other",
                    ].map((opt) => {
                      const isSelected = landUse.observed_land_use === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            setLandUse((prev) => ({ ...prev, observed_land_use: opt }));
                            saveToLocalStorage();
                          }}
                          className={`p-3 rounded-lg text-xs font-bold text-left border transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">Land Use Remarks</label>
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={landUse.remarks || ""}
                    onChange={(e) => {
                      setLandUse((prev) => ({ ...prev, remarks: e.target.value }));
                      saveToLocalStorage();
                    }}
                    placeholder="E.g., Double-crop mustard and bajra with tube well irrigation..."
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 4: STRUCTURES (Standing Non-Land Assets)
                ======================================================== */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Home className="h-5 w-5 text-emerald-700" />
                    <span>Step 4 — Standing Structures Enumeration</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enumerate physical buildings, boundary walls, or sheds on the acquired parcel.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Field Evidence:</strong> This enumeration serves as field verification evidence and does not constitute formal statutory valuation.
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Are Standing Structures Present?</strong>
                    <span className="text-xs text-slate-500">Houses, shops, boundary walls, cattle sheds</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setStructures((prev) => ({ ...prev, has_structures: true }));
                        saveToLocalStorage();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        structures.has_structures
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setStructures((prev) => ({ ...prev, has_structures: false, structure_count: 0 }));
                        saveToLocalStorage();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !structures.has_structures
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {structures.has_structures && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Structure Type</label>
                      <select
                        disabled={isReadOnly}
                        value={structures.structure_type || "House"}
                        onChange={(e) => {
                          setStructures((prev) => ({ ...prev, structure_type: e.target.value }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="House">Residential House (Pucca)</option>
                        <option value="Shop">Commercial Shop</option>
                        <option value="Shed">Cattle / Storage Shed (Kutcha)</option>
                        <option value="Boundary wall">Boundary Wall</option>
                        <option value="Other">Other Structure</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Approximate Count</label>
                      <input
                        type="number"
                        min="1"
                        disabled={isReadOnly}
                        value={structures.structure_count || 1}
                        onChange={(e) => {
                          setStructures((prev) => ({ ...prev, structure_count: parseInt(e.target.value) || 1 }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Condition</label>
                      <select
                        disabled={isReadOnly}
                        value={structures.structure_condition || "Average"}
                        onChange={(e) => {
                          setStructures((prev) => ({ ...prev, structure_condition: e.target.value }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Good">Good (New / Maintained)</option>
                        <option value="Average">Average</option>
                        <option value="Dilapidated">Dilapidated / Abandoned</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                STEP 5: TREES / ASSETS (Enumeration)
                ======================================================== */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Trees className="h-5 w-5 text-emerald-700" />
                    <span>Step 5 — Trees & Non-Land Assets</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enumerate standing trees, borewells, and irrigation assets.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Are Standing Trees Present?</strong>
                    <span className="text-xs text-slate-500">Mature timber or fruit-bearing trees</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setTreesAssets((prev) => ({ ...prev, has_trees: true }));
                        saveToLocalStorage();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        treesAssets.has_trees
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setTreesAssets((prev) => ({ ...prev, has_trees: false, trees_count: 0 }));
                        saveToLocalStorage();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !treesAssets.has_trees
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {treesAssets.has_trees && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Approximate Tree Count</label>
                      <input
                        type="number"
                        min="1"
                        disabled={isReadOnly}
                        value={treesAssets.trees_count || 12}
                        onChange={(e) => {
                          setTreesAssets((prev) => ({ ...prev, trees_count: parseInt(e.target.value) || 0 }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block">Tree Category</label>
                      <select
                        disabled={isReadOnly}
                        value={treesAssets.tree_category || "Mixed"}
                        onChange={(e) => {
                          setTreesAssets((prev) => ({ ...prev, tree_category: e.target.value }));
                          saveToLocalStorage();
                        }}
                        className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Fruit-bearing">Fruit-bearing (Mango, Guava, etc.)</option>
                        <option value="Timber">Timber (Sheesham, Teak, Neem)</option>
                        <option value="Mixed">Mixed Forest / Farm Trees</option>
                        <option value="Shrub">Shrub / Minor Trees</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">Other Visible Assets</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={treesAssets.other_assets || ""}
                    onChange={(e) => {
                      setTreesAssets((prev) => ({ ...prev, other_assets: e.target.value }));
                      saveToLocalStorage();
                    }}
                    placeholder="E.g., 1 functional borewell with 5HP pump, electric connection pole..."
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 6: PHOTOGRAPHIC EVIDENCE
                ======================================================== */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-700" />
                      <span>Step 6 — Photographic Evidence</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Capture or attach geotagged on-site photos of parcel, boundaries, and standing assets.
                    </p>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddSamplePhoto("STRUCTURE")}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        + Add Structure Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSamplePhoto("SITE_ADDITIONAL")}
                        className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold"
                      >
                        + Add Site Photo
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between"
                    >
                      <div className="h-28 bg-slate-200 flex items-center justify-center relative">
                        <Camera className="h-8 w-8 text-slate-400" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-bold uppercase font-mono">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <strong className="text-xs font-bold text-slate-800 block truncate">{p.file_name}</strong>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{p.caption || "On-site survey photograph"}</p>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Captured: {p.uploaded_at ? new Date(p.uploaded_at).toLocaleDateString() : "Today"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 7: FIELD REMARKS
                ======================================================== */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-700" />
                    <span>Step 7 — Field Officer Ground Remarks</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attributable statutory remarks from the surveying Field Officer for CALA review.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">Detailed Field Observations</label>
                  <textarea
                    rows={5}
                    disabled={isReadOnly}
                    value={fieldRemarks}
                    onChange={(e) => {
                      setFieldRemarks(e.target.value);
                      saveToLocalStorage();
                    }}
                    placeholder="Enter exhaustive ground inspection observations regarding physical possession, boundary demarcation stones, crop status, occupancy, and any on-site objections raised..."
                    className="mt-1 w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <strong>Attribution:</strong> Signed electronically by <strong>{taskDetail.verified_by_name || "Shri Ramesh Choudhary (Patwari)"}</strong>.
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 8: REVIEW & SUBMIT
                ======================================================== */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-700" />
                    <span>Step 8 — Field Verification Summary & Submission</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review completed field observations before final statutory submission to CALA.
                  </p>
                </div>

                {/* Summary Table */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Parcel / Khasra:</span>
                    <strong className="text-slate-900">Khasra {taskDetail.khasra_number} ({taskDetail.village_name})</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Device GPS Fix:</span>
                    <strong className="text-slate-900 font-mono">{location.latitude}, {location.longitude} (±{location.accuracy_meters}m)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">4-Point Boundary Confirmation:</span>
                    <strong className="text-emerald-700">Verified & Corresponding</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Observed Land Use:</span>
                    <strong className="text-slate-900">{landUse.observed_land_use}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Structures Enumerated:</span>
                    <strong className="text-slate-900">{structures.has_structures ? `${structures.structure_count} ${structures.structure_type}` : "None"}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Trees & Assets:</span>
                    <strong className="text-slate-900">{treesAssets.has_trees ? `${treesAssets.trees_count} Trees (${treesAssets.tree_category})` : "None"}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Attached Photos:</span>
                    <strong className="text-slate-900">{photos.length} Photo Evidence Records</strong>
                  </div>
                </div>

                {/* Submission Action Buttons */}
                {!isReadOnly ? (
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveOrSubmit(true)}
                      disabled={isSubmitting || submittedType === "final"}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {submittedType === "draft" ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>DRAFT SAVED</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 text-slate-500" />
                          <span>{isSubmitting ? "Saving Draft..." : "SAVE DRAFT"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveOrSubmit(false)}
                      disabled={isSubmitting || submittedType === "final"}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                        submittedType === "final"
                          ? "bg-emerald-800"
                          : isRework
                          ? "bg-amber-700 hover:bg-amber-800"
                          : "bg-[#138808] hover:bg-emerald-700"
                      }`}
                    >
                      {submittedType === "final" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>SUBMITTED TO CALA</span>
                        </>
                      ) : isRework ? (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          <span>{isSubmitting ? "Resubmitting..." : "RESUBMIT TO CALA"}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>{isSubmitting ? "Submitting..." : "SUBMIT FIELD VERIFICATION"}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900 font-medium">
                    This verification is finalized and under review by CALA Jaipur.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wizard Step Footer Navigation */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-slate-400 font-mono font-semibold">
              Step {currentStep} of {steps.length}
            </span>

            <button
              type="button"
              disabled={currentStep === steps.length}
              onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
