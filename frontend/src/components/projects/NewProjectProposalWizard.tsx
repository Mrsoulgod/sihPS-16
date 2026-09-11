"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/context/NotificationContext";
import { createProjectProposal, uploadDocument } from "@/lib/api/projects";
import {
  Building2,
  MapPin,
  Layers,
  Compass,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  Upload,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

interface UploadedDocMeta {
  id?: string;
  name: string;
  type: string;
  size: string;
  hash: string;
  uploadedAt: string;
}

export function NewProjectProposalWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { forwardActionNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Agency Identity
  const agencyName = user?.organization || "National Highways Authority of India (NHAI)";
  const userName = user?.full_name || "Project Director, PIU Jaipur";

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    title: "",
    project_code: "",
    project_type: "HIGHWAY",
    project_category: "CENTRAL_SECTOR",
    description: "",
    objective: "",
    sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
    estimated_project_cost_cr: 850.0,
    priority: "HIGH",
    proposed_start_date: "2026-10-01",
    target_completion_date: "2028-12-31",

    // Step 2: Location
    state_id: user?.state_id || "IN-RJ",
    primary_district_id: user?.district_id || "DST-JAI",
    tehsil_name: "Kotputli",
    villagesText: "Sundarpura, Pragpura, Bhabroo, Shahpura",
    start_location: "KM 142.000 (Jaipur Border)",
    end_location: "KM 198.500 (Chandwaji Junction)",
    project_length_km: 56.5,

    // Step 3: Land Requirement
    total_land_required_acres: 245.5,
    land_unit: "ACRES",
    government_land_acres: 45.0,
    private_land_acres: 185.5,
    other_land_acres: 15.0,
    expected_parcel_count: 180,
    affected_villages_count: 4,
    proposed_land_remarks: "Requires acquisition of 185.5 Acres private agricultural land and 15 Acres panchayat common land.",

    // Step 4: Alignment
    coordinatesText: "27.7050, 76.2010\n27.5500, 76.1000\n27.3800, 75.9800\n27.2200, 75.8500",
    alignment_type: "FOUR_LANE_DUAL_CARRIAGEWAY",

    // Step 6: Submission remarks
    submission_remarks: "DPR and proposed land schedule submitted for statutory Section 3A / Section 11 scrutiny.",
  });

  // Step 5: Uploaded Documents list
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocMeta[]>([
    {
      name: "NHAI_DPR_Jaipur_Bypass_Annexure_I.pdf",
      type: "DPR",
      size: "14.2 MB",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      uploadedAt: new Date().toISOString(),
    },
    {
      name: "Proposed_Land_Schedule_Kotputli.xlsx",
      type: "LAND_SCHEDULE",
      size: "2.8 MB",
      hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      uploadedAt: new Date().toISOString(),
    },
  ]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newDoc: UploadedDocMeta = {
      name: file.name,
      type: docType,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      hash: fakeHash,
      uploadedAt: new Date().toISOString(),
    };
    setUploadedDocs((prev) => [...prev, newDoc]);
  };

  const handleSave = async (isDraft: boolean) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!formData.title || !formData.project_code) {
        throw new Error("Project Title and Project Code are required.");
      }

      const villagesArray = formData.villagesText
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const coordPairs: Array<[number, number]> = formData.coordinatesText
        .split("\n")
        .map((line) => {
          const parts = line.split(",").map((p) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return [parts[0], parts[1]] as [number, number];
          }
          return null;
        })
        .filter((c): c is [number, number] => c !== null);

      const payload = {
        title: formData.title,
        project_code: formData.project_code,
        project_type: formData.project_type,
        project_category: formData.project_category,
        description: formData.description || `Statutory project proposal for ${formData.title}`,
        objective: formData.objective || "Expansion and modernization of critical infrastructure corridor.",
        sponsoring_ministry: formData.sponsoring_ministry,
        estimated_project_cost_cr: Number(formData.estimated_project_cost_cr) || 500,
        priority: formData.priority,
        proposed_start_date: formData.proposed_start_date,
        target_completion_date: formData.target_completion_date,
        state_id: formData.state_id,
        primary_district_id: formData.primary_district_id,
        tehsil_name: formData.tehsil_name,
        villages: villagesArray,
        start_location: formData.start_location,
        end_location: formData.end_location,
        project_length_km: Number(formData.project_length_km) || 50,
        total_land_required_acres: Number(formData.total_land_required_acres) || 100,
        land_unit: formData.land_unit,
        government_land_acres: Number(formData.government_land_acres) || 0,
        private_land_acres: Number(formData.private_land_acres) || 0,
        other_land_acres: Number(formData.other_land_acres) || 0,
        expected_parcel_count: Number(formData.expected_parcel_count) || 50,
        affected_villages_count: Number(formData.affected_villages_count) || villagesArray.length,
        proposed_land_remarks: formData.proposed_land_remarks,
        preliminary_coordinates: coordPairs,
        alignment_geojson: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordPairs.map(([lat, lng]) => [lng, lat]),
          },
          properties: {
            title: formData.title,
            type: formData.alignment_type,
          },
        },
        is_draft: isDraft,
      };

      const res = await createProjectProposal(payload);
      if (res.success && res.data) {
        setSuccessMessage(
          isDraft
            ? "Project proposal saved as DRAFT successfully."
            : "Project proposal SUBMITTED successfully. Assigned to CALA Jaipur for statutory scrutiny."
        );

        if (!isDraft) {
          forwardActionNotification(
            agencyName,
            "ROLE_DISTRICT_CALA",
            `New Proposal: ${formData.title || "Statutory Land Acquisition"}`,
            `Proposal submitted for ${formData.total_land_required_acres || "100"} Acres across ${formData.villages || "Jaipur Corridor"}. Scrutiny assigned to District Magistrate / CALA.`,
            formData.project_code || "PROPOSAL-2026",
            `/projects/${res.data.id}`,
            "PROJECT_PROPOSAL"
          );
        }

        setTimeout(() => {
          router.push(`/projects/${res.data.id}`);
        }, 1500);
      } else {
        throw new Error(res.message || "Failed to create project proposal.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving the project proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Project Details", icon: Building2 },
    { num: 2, title: "Location", icon: MapPin },
    { num: 3, title: "Land Requirement", icon: Layers },
    { num: 4, title: "Proposed Alignment", icon: Compass },
    { num: 5, title: "Documents", icon: FileText },
    { num: 6, title: "Review & Submit", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-[#138808] border border-emerald-200 uppercase">
                {agencyName}
              </span>
              <span className="text-xs text-slate-500">Created by: {userName}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-[#138808]" />
              New Project Proposal
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Initiate a statutory land acquisition project proposal for District / CALA scrutiny.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition flex items-center gap-2 shadow-xs disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        </div>

        {/* Step Progress Indicator (Logo Green Diagonal Hover Gradient) */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {steps.map((s, sIdx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            const isOrange = sIdx % 2 === 0;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-300 flex items-center gap-2 group cursor-pointer shadow-2xs hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-emerald-50 border-[#138808] text-[#138808] shadow-xs font-bold"
                    : isCompleted
                    ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    : isOrange
                    ? "bg-white border-slate-200 text-slate-600 hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#138808] text-white"
                      : isCompleted
                      ? "bg-[#138808] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isCompleted ? "✓" : s.num}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold leading-tight truncate text-slate-900">{s.title}</div>
                  <div className={`text-[10px] ${isActive ? "text-[#138808] font-bold" : "text-slate-400"}`}>
                    Step {s.num}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[#138808] text-xs flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#138808]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Content Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* STEP 1: PROJECT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#138808]" />
                Step 1: Project Details & Sponsoring Authority
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Core metadata, administrative identity, and budgetary projections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. NH-48 6-Laning & Jaipur Western Ring Road Connector"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. NHAI-RJ-JAI-2026-004"
                  value={formData.project_code}
                  onChange={(e) => handleChange("project_code", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                <select
                  value={formData.project_type}
                  onChange={(e) => handleChange("project_type", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="HIGHWAY">Expressway / National Highway</option>
                  <option value="RAILWAY">Dedicated Freight Corridor / Railway</option>
                  <option value="METRO">Metro Rail / Urban Transit</option>
                  <option value="ENERGY">Transmission / Renewable Corridor</option>
                  <option value="URBAN_INFRASTRUCTURE">Industrial Corridor / Port Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category</label>
                <select
                  value={formData.project_category}
                  onChange={(e) => handleChange("project_category", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="CENTRAL_SECTOR">Central Sector (100% GoI Funded)</option>
                  <option value="STATE_SPONSORED">Centrally Sponsored / Joint Venture</option>
                  <option value="PPP_HAM">PPP - Hybrid Annuity Model (HAM)</option>
                  <option value="PPP_BOT">PPP - Build Operate Transfer (BOT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sponsoring Ministry</label>
                <input
                  type="text"
                  value={formData.sponsoring_ministry}
                  onChange={(e) => handleChange("sponsoring_ministry", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Project Cost (INR Crore)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimated_project_cost_cr}
                  onChange={(e) => handleChange("estimated_project_cost_cr", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="CRITICAL">Critical (PM-GatiShakti High Impact)</option>
                  <option value="HIGH">High Priority</option>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Start Date</label>
                <input
                  type="date"
                  value={formData.proposed_start_date}
                  onChange={(e) => handleChange("proposed_start_date", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) => handleChange("target_completion_date", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description & Scope</label>
                <textarea
                  rows={2}
                  placeholder="Provide scope overview, alignment corridor, and connectivity objectives..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>
            </div>

            {/* Readonly Auto-Attached Agency Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Authenticated Implementing Agency:</span> {agencyName}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-[#138808] border border-emerald-200 font-bold">
                Auto-Attached Scope
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#138808]" />
                Step 2: Master Geography & Alignment Route
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory revenue boundaries (State, District, Tehsil, Villages) for CALA assignment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <select
                  value={formData.state_id}
                  onChange={(e) => handleChange("state_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="IN-RJ">Rajasthan (IN-RJ)</option>
                  <option value="IN-GJ">Gujarat (IN-GJ)</option>
                  <option value="IN-HR">Haryana (IN-HR)</option>
                  <option value="IN-MP">Madhya Pradesh (IN-MP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary District (CALA Jurisdiction)</label>
                <select
                  value={formData.primary_district_id}
                  onChange={(e) => handleChange("primary_district_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="DST-JAI">Jaipur (DST-JAI)</option>
                  <option value="DST-ALW">Alwar (DST-ALW)</option>
                  <option value="DST-DAU">Dausa (DST-DAU)</option>
                  <option value="DST-AJM">Ajmer (DST-AJM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tehsil</label>
                <input
                  type="text"
                  value={formData.tehsil_name}
                  onChange={(e) => handleChange("tehsil_name", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Length (KM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.project_length_km}
                  onChange={(e) => handleChange("project_length_km", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Location / Chainage</label>
                <input
                  type="text"
                  value={formData.start_location}
                  onChange={(e) => handleChange("start_location", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Location / Chainage</label>
                <input
                  type="text"
                  value={formData.end_location}
                  onChange={(e) => handleChange("end_location", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Affected Revenue Villages (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.villagesText}
                  onChange={(e) => handleChange("villagesText", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LAND REQUIREMENT */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#138808]" />
                Step 3: Proposed Land Requirement Statement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Initial land acquisition schedule according to DPR feasibility study.
              </p>
            </div>

            {/* Mandatory Statutory Disclaimer */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="font-bold">PROPOSED LAND REQUIREMENT:</strong> This statement represents the
                implementing agency&apos;s preliminary requirement. Official acquisition figures and cadastral boundaries
                will be verified and published by the CALA authority after field ground-truthing.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Land Required <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_land_required_acres}
                  onChange={(e) => handleChange("total_land_required_acres", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Land Area Unit</label>
                <select
                  value={formData.land_unit}
                  onChange={(e) => handleChange("land_unit", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                >
                  <option value="ACRES">Acres</option>
                  <option value="HECTARES">Hectares</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Parcel Count (Khasras)</label>
                <input
                  type="number"
                  value={formData.expected_parcel_count}
                  onChange={(e) => handleChange("expected_parcel_count", parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Private Agricultural / Abadi Land</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.private_land_acres}
                  onChange={(e) => handleChange("private_land_acres", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Government / Forest Land</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.government_land_acres}
                  onChange={(e) => handleChange("government_land_acres", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Other / Panchayat / Riverbed Land</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.other_land_acres}
                  onChange={(e) => handleChange("other_land_acres", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Land Acquisition Remarks</label>
                <textarea
                  rows={2}
                  value={formData.proposed_land_remarks}
                  onChange={(e) => handleChange("proposed_land_remarks", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PROPOSED ALIGNMENT */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#138808]" />
                Step 4: Proposed Alignment & GIS Centerline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preliminary centerline coordinates for GIS overlay and scrutiny analysis.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <strong className="font-bold">PROPOSED ALIGNMENT:</strong> This geometry represents the engineering
                centerline from DPR studies. It will not automatically alter official cadastral maps until joint boundary
                demarcation with revenue patwaris is declared.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alignment Centerline Coordinates (Latitude, Longitude per line)
                </label>
                <textarea
                  rows={6}
                  value={formData.coordinatesText}
                  onChange={(e) => handleChange("coordinatesText", e.target.value)}
                  className="w-full font-mono text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-[#138808] focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                />
                <p className="text-[11px] text-slate-500 mt-1">Format: 27.7050, 76.2010 (WGS-84 Decimal Degrees)</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2">GIS Alignment Specifications</div>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Spheroid: WGS 84 / UTM Zone 43N</li>
                    <li>• ROW Width: 60 Meters (Standard National Expressway)</li>
                    <li>• Curve Radius: Compliant with IRC:73 standards</li>
                    <li>• Buffer Overlap: 200m Environmental Impact Corridor</li>
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700">
                  Centerline vertices: <strong>{formData.coordinatesText.split("\n").filter(Boolean).length} points</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENTS */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#138808]" />
                Step 5: Statutory Documents & DPR Repository
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload verified DPR reports, alignment drawings, and administrative approvals with SHA-256 tamper hashing.
              </p>
            </div>

            {/* Document Upload Slots (Logo Green & Saffron Diagonal Hover Gradients) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: "DPR", label: "Detailed Project Report (DPR)", req: true },
                { type: "LAND_SCHEDULE", label: "Land Requirement Statement (Khasra Schedule)", req: true },
                { type: "ALIGNMENT_KML", label: "Alignment Drawing / KML GeoPackage", req: false },
                { type: "ADMIN_APPROVAL", label: "In-Principle Ministry Administrative Approval", req: true },
              ].map((doc, idx) => {
                const isOrange = idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md ${
                      isOrange
                        ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                        : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {doc.label}
                        </span>
                        {doc.req && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            * Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload signed PDF or spreadsheet schedule
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        Browse File
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(doc.type, e)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Uploaded Documents List */}
            <div className="mt-6">
              <div className="text-xs font-bold text-slate-700 mb-2">Uploaded & Hashed Files ({uploadedDocs.length})</div>
              <div className="space-y-2">
                {uploadedDocs.map((doc, i) => {
                  const isOrange = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 ${
                        isOrange
                          ? "bg-white hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400"
                          : "bg-white hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-[#138808]" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {doc.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                            SHA-256: {doc.hash}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{doc.size}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#138808]" />
                Step 6: Review Proposal Summary & Submission
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Carefully verify proposal details before dispatching to District CALA for statutory scrutiny.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Project Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  1. Project Details
                </h3>
                <div className="text-xs space-y-1 text-slate-600">
                  <div><strong>Title:</strong> {formData.title || "Not Specified"}</div>
                  <div><strong>Code:</strong> {formData.project_code || "Not Specified"}</div>
                  <div><strong>Agency:</strong> {agencyName}</div>
                  <div><strong>Ministry:</strong> {formData.sponsoring_ministry}</div>
                  <div><strong>Estimated Cost:</strong> ₹{formData.estimated_project_cost_cr} Cr</div>
                  <div><strong>Timeline:</strong> {formData.proposed_start_date} to {formData.target_completion_date}</div>
                </div>
              </div>

              {/* Box 2: Location */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]">
                <h3 className="text-xs font-bold text-[#138808] uppercase tracking-wider mb-2">
                  2. Jurisdiction
                </h3>
                <div className="text-xs space-y-1 text-slate-600">
                  <div><strong>State:</strong> Rajasthan (IN-RJ)</div>
                  <div><strong>District:</strong> Jaipur (DST-JAI)</div>
                  <div><strong>Tehsil:</strong> {formData.tehsil_name}</div>
                  <div><strong>Route:</strong> {formData.start_location} → {formData.end_location}</div>
                  <div><strong>Length:</strong> {formData.project_length_km} KM</div>
                  <div><strong>Villages:</strong> {formData.villagesText}</div>
                </div>
              </div>

              {/* Box 3: Land Requirement */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md hover:bg-gradient-to-br hover:from-amber-500/10 hover:via-white hover:to-orange-500/15 hover:border-amber-400">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  3. Proposed Land
                </h3>
                <div className="text-xs space-y-1 text-slate-600">
                  <div><strong>Total Land:</strong> {formData.total_land_required_acres} {formData.land_unit}</div>
                  <div><strong>Private Land:</strong> {formData.private_land_acres} {formData.land_unit}</div>
                  <div><strong>Govt / Forest:</strong> {formData.government_land_acres} {formData.land_unit}</div>
                  <div><strong>Expected Parcels:</strong> {formData.expected_parcel_count} Khasras</div>
                </div>
              </div>

              {/* Box 4: Documents Attached */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-300 group cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md hover:bg-gradient-to-br hover:from-[#138808]/12 hover:via-white hover:to-[#138808]/18 hover:border-[#138808]">
                <h3 className="text-xs font-bold text-[#138808] uppercase tracking-wider mb-2">
                  4. Documents Attached
                </h3>
                <div className="text-xs space-y-1 text-slate-600">
                  {uploadedDocs.map((d, idx) => (
                    <div key={idx} className="truncate">• {d.name} ({d.size})</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submission Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Submission Remarks for CALA Officer
              </label>
              <textarea
                rows={2}
                value={formData.submission_remarks}
                onChange={(e) => handleChange("submission_remarks", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
              />
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                className="px-5 py-2 text-xs font-bold bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg transition flex items-center gap-1 shadow-sm hover:shadow-md"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-black bg-[#138808] hover:bg-[#0f6c06] text-white rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting Proposal..." : "SUBMIT PROJECT PROPOSAL"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
