"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useAffectedFamilyDetail,
  useUpdateEligibility,
  useCreateAllotment,
} from "@/lib/hooks/useRandR";
import { useAuth } from "@/lib/hooks/useAuth";
import { RoleCode } from "@/lib/types/auth";
import { FamilyCaseWorkspace } from "@/components/randr/FamilyCaseWorkspace";
import { FamilyCaseDetailResponse } from "@/lib/types/social";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Home,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  IndianRupee,
  Clock,
  Edit3,
  PlusCircle,
} from "lucide-react";

export default function AffectedFamilyDetailPage() {
  const params = useParams();
  const familyId = params?.familyId as string;
  const { user } = useAuth();

  const { data: family, isLoading, error } = useAffectedFamilyDetail(familyId);
  const updateEligibilityMutation = useUpdateEligibility();
  const createAllotmentMutation = useCreateAllotment();

  // Eligibility Modal State
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligStatus, setEligStatus] = useState<any>("APPROVED");
  const [eligCategory, setEligCategory] = useState("SCHEDULE_II_BENEFICIARY");
  const [assessingAuth, setAssessingAuth] = useState("CALA & ADM (Land Acquisition), Jaipur");
  const [eligBasis, setEligBasis] = useState("RFCTLARR Act Second Schedule mandatory entitlement verification.");
  const [eligRemarks, setEligRemarks] = useState("");

  // Allotment Modal State
  const [showAllotmentModal, setShowAllotmentModal] = useState(false);
  const [allotCategory, setAllotCategory] = useState("HOUSING_RESETTLEMENT");
  const [allotType, setAllotType] = useState<any>("PLOT");
  const [assetId, setAssetId] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [allotDate, setAllotDate] = useState(new Date().toISOString().split("T")[0]);
  const [allocVal, setAllocVal] = useState("1200000");
  const [allotRemarks, setAllotRemarks] = useState("");

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
        <p>Loading Affected Family 360° record...</p>
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">Affected Family Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          Unable to locate family record with ID {familyId}.
        </p>
        <Link
          href="/affected-families"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to PAF Directory
        </Link>
      </div>
    );
  }

  const trace = family.acquisition_trace;
  const allotments = family.allotments || [];

  // Phase 11G: Dedicated R&R Case Management Workspace for Social Officer
  if (user?.role_id === RoleCode.SOCIAL_OFFICER) {
    const workspaceData: FamilyCaseDetailResponse = {
      family_id: family.id,
      summary: {
        family_reference_id: family.family_reference_id || "PAF-NH48-001",
        head_of_family_name: family.head_of_family_name,
        project_id: trace?.project?.id,
        project_title: trace?.project?.title || "Delhi–Jaipur Expressway Expansion",
        project_code: trace?.project?.project_code || "PRJ-NH48-PKG4",
        parcel_id: trace?.parcel?.id,
        khasra_number: trace?.parcel?.khasra_number || "412/1",
        village_name: trace?.parcel?.village_name || family.village_name || "Manpura",
        tehsil_name: "Kotputli",
        district_name: "Jaipur",
        displacement_status: family.displacement_category || "TITLEHOLDER_DISPLACED",
        family_type: family.family_type || "PDF_DISPLACED_REQUIRING_RELOCATION",
        social_category: family.social_category || "GEN",
        family_members_count: family.family_members_count || 4,
        contact_masked: family.contact_masked || "+91 98XXX-XX123",
        case_status: family.rehabilitation_status === "SETTLED" ? "SETTLED" : (family.allotted_plot_number ? "ALLOTTED" : "IDENTIFIED"),
        current_stage: family.allotted_plot_number ? "VERIFICATION" : "ELIGIBILITY",
        sla_due_date: "2026-09-25",
        blocking_possession: Boolean(family.displacement_category === "TITLEHOLDER_DISPLACED" && family.rehabilitation_status !== "SETTLED"),
      },
      eligibility: {
        eligibility_status: family.eligibility_status || "UNDER_REVIEW",
        eligibility_category: family.eligibility_category || "Section 31 Schedule II (Titleholder)",
        eligibility_basis: family.eligibility_basis || "Jamabandi land records verified.",
        assessing_authority: family.assessing_authority || "CALA Jaipur",
        assessment_date: family.eligibility_assessment_date || "2026-08-20",
        verification_status: family.eligibility_status === "ELIGIBLE" || family.eligibility_status === "APPROVED" ? "APPROVED" : "PENDING",
        remarks: family.eligibility_remarks || "",
        can_edit_eligibility: true,
      },
      entitlements: {
        entitlement_status: (family.entitled_plot_sqyd || 0) > 0 ? "SANCTIONED" : "PENDING",
        entitlement_category: "HOUSING_RESETTLEMENT",
        entitled_plot_sqyd: family.entitled_plot_sqyd || 150,
        subsistence_grant_inr: family.subsistence_grant_inr || 36000,
        transportation_allowance_inr: family.transportation_allowance_inr || 50000,
        one_time_resettlement_allowance_inr: family.one_time_resettlement_allowance_inr || 50000,
        total_assistance_inr: (family.subsistence_grant_inr || 36000) + (family.transportation_allowance_inr || 50000) + (family.one_time_resettlement_allowance_inr || 50000),
        source_parameter: "RFCTLARR 2013 Second Schedule Standard Entitlement Matrix",
        is_grant_disbursed: family.is_grant_disbursed,
        remarks: "Calculated under statutory standard entitlement matrix.",
      },
      allotments: {
        allotment_status: family.allotted_plot_number || allotments.length > 0 ? "ALLOTTED" : "NOT_ALLOTTED",
        scheme_id: family.scheme_id,
        scheme_title: trace?.scheme?.scheme_title || "Manpura Modern Resettlement Colony",
        resettlement_site_name: trace?.scheme?.resettlement_site_name || "Manpura Sector 4",
        allotted_plot_number: family.allotted_plot_number,
        items: allotments.map((alt) => ({
          id: alt.id,
          allotment_reference: alt.allotment_reference || `ALT-${alt.id.slice(0, 6)}`,
          entitlement_category: alt.entitlement_category || "HOUSING_RESETTLEMENT",
          allotment_type: alt.allotment_type || "PLOT",
          asset_identifier: alt.asset_identifier || "Resettlement Plot",
          allotment_order_no: alt.allotment_order_no || "CALA/2026/RR",
          allotment_date: alt.allotment_date || "2026-08-25",
          delivery_date: alt.delivery_date,
          allocated_value_inr: Number(alt.allocated_value_inr) || 0,
          responsible_authority: alt.responsible_authority || "Social Officer",
          status: alt.status || "ALLOTTED",
          remarks: alt.remarks,
        })),
      },
      documents: {
        required_documents: [
          "Jamabandi / Revenue Record",
          "Social Category Certificate",
          "Family Ration Card / Composition Proof",
          "Ground Survey Verification Form",
          "Sanctioned Allotment Letter",
        ],
        submitted_documents: [
          {
            id: "00000000-0000-0000-0000-000000000601",
            document_type: "REVENUE_RECORD",
            title: `Jamabandi Khasra ${trace?.parcel?.khasra_number || "412/1"}`,
            file_name: "jamabandi_record.pdf",
            version: 1,
            file_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            uploaded_at: "2026-08-10 10:30:00 UTC",
            uploaded_by: "patwari_kotputli",
            is_verified: true,
          },
        ],
        verification_status: "VERIFIED",
      },
      implementation: {
        current_status: family.rehabilitation_status === "SETTLED" ? "VERIFIED" : (family.allotted_plot_number ? "IN_PROGRESS" : "NOT_STARTED"),
        progress_percent: family.rehabilitation_status === "SETTLED" ? 100 : (family.allotted_plot_number ? 75 : 25),
        pending_action: family.allotted_plot_number ? "Verify Physical Relocation" : "Review Eligibility",
        physical_possession_handed_over: Boolean(family.allotted_plot_number),
        grant_transferred: family.is_grant_disbursed,
        milestones: [
          { name: "Family Survey Conducted", completed: true, date: "2026-08-15" },
          { name: "Eligibility Approved", completed: family.eligibility_status === "ELIGIBLE" || family.eligibility_status === "APPROVED", date: "2026-08-20" },
          { name: "Plot Allotment Order Issued", completed: Boolean(family.allotted_plot_number), date: "2026-08-25" },
          { name: "Financial Grant Transferred", completed: family.is_grant_disbursed, date: "2026-08-30" },
          { name: "Relocation Verification Sign-off", completed: family.rehabilitation_status === "SETTLED", date: "2026-09-22" },
        ],
      },
      verification: {
        verification_status: family.rehabilitation_status === "SETTLED" ? "VERIFIED" : "PENDING",
        verification_date: family.rehabilitation_status === "SETTLED" ? "2026-09-01" : undefined,
        verifying_officer_name: "Smt. Meenakshi Sundaram",
        verifying_officer_designation: "Social Development & R&R Officer",
        observations: "On-ground family relocation and plot construction verification in progress.",
      },
      timeline: [
        {
          stage: "IDENTIFICATION",
          title: "Affected Family Enumerated",
          description: "Family identified during joint land acquisition survey under Section 3A.",
          actor_name: "patwari_kotputli",
          actor_role: "Field Officer",
          timestamp: "2026-08-01 10:00:00 UTC",
          status: "COMPLETED",
        },
        {
          stage: "SURVEY",
          title: "Social Baseline Survey Completed",
          description: "Baseline family survey conducted; family composition and residence documented.",
          actor_name: "randr_jaipur",
          actor_role: "Social Officer",
          timestamp: "2026-08-15 14:30:00 UTC",
          status: "COMPLETED",
        },
      ],
      audit_history: [
        {
          action: "RECORD_ACCESSED",
          actor: "randr_jaipur",
          timestamp: "2026-09-08 10:00:00 UTC",
          details: "Case opened in 360° workspace",
        },
      ],
    };

    return <FamilyCaseWorkspace initialData={workspaceData} />;
  }

  const handleUpdateEligibility = async () => {
    try {
      await updateEligibilityMutation.mutateAsync({
        familyId,
        payload: {
          eligibility_status: eligStatus,
          eligibility_category: eligCategory,
          assessing_authority: assessingAuth,
          eligibility_basis: eligBasis,
          eligibility_remarks: eligRemarks || "Eligibility status verified through CALA review.",
        },
      });
      setShowEligibilityModal(false);
    } catch (err: any) {
      alert("Failed to update eligibility: " + (err?.message || "Unknown error"));
    }
  };

  const handleCreateAllotment = async () => {
    try {
      await createAllotmentMutation.mutateAsync({
        familyId,
        payload: {
          family_id: familyId,
          scheme_id: family.scheme_id || undefined,
          entitlement_category: allotCategory,
          allotment_type: allotType,
          asset_identifier: assetId,
          allotment_order_no: orderNo,
          allotment_date: allotDate,
          allocated_value_inr: allocVal,
          status: "ALLOTTED",
          remarks: allotRemarks,
        },
      });
      setShowAllotmentModal(false);
      setAssetId("");
      setOrderNo("");
    } catch (err: any) {
      alert("Failed to record allotment: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/affected-families"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Affected Families
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight font-mono">
              {family.family_reference_id}
            </h1>
            <span className="text-lg font-bold text-gray-900 font-sans">
              — {family.head_of_family_name}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                family.eligibility_status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : family.eligibility_status === "ELIGIBLE"
                  ? "bg-blue-100 text-blue-800"
                  : family.eligibility_status === "DISPUTED"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {family.eligibility_status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{family.social_category}</span>
            <span>•</span>
            <span>{family.family_members_count} Family Members</span>
            <span>•</span>
            <span>{family.village_name}</span>
            {family.khasra_number && (
              <>
                <span>•</span>
                <span className="font-mono text-emerald-700 font-medium">Khasra {family.khasra_number}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEligibilityModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
            <span>Review Eligibility</span>
          </button>
          <button
            onClick={() => setShowAllotmentModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Record Allotment</span>
          </button>
        </div>
      </div>

      {/* 360° Horizontal Acquisition Trace Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              360° End-to-End Acquisition Traceability
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {family.project_code} • Khasra {family.khasra_number || "—"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {/* 1. Project */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">1. Project</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5" title={trace?.project_title}>
              {trace?.project_code || family.project_code}
            </div>
            <span className="text-[10px] text-green-700 font-medium block">Approved</span>
          </div>

          {/* 2. Parcel */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">2. Cadastral</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5">
              Kh. {trace?.khasra_number || family.khasra_number || "—"}
            </div>
            <span className="text-[10px] text-blue-700 font-medium block truncate">
              {trace?.parcel_status?.replace(/_/g, " ") || "Demarcated"}
            </span>
          </div>

          {/* 3. Landowner */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">3. Landowner</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5" title={trace?.owner_name || ""}>
              {trace?.owner_name || family.head_of_family_name}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">Verified</span>
          </div>

          {/* 4. Compensation */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">4. Assessment</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5 font-mono text-[11px]">
              {trace?.compensation_reference || "ASSESS-REQ"}
            </div>
            <span className="text-[10px] text-green-700 font-medium block">
              {trace?.compensation_status || "Approved"}
            </span>
          </div>

          {/* 5. Award */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">5. Award Sec. 23</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5 font-mono text-[11px]">
              {trace?.award_number || "AWD/2026/001"}
            </div>
            <span className="text-[10px] text-green-700 font-medium block">
              {trace?.award_status || "Pronounced"}
            </span>
          </div>

          {/* 6. Possession */}
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 block uppercase">6. Possession</span>
            <div className="font-semibold text-gray-900 text-xs truncate mt-0.5 font-mono text-[11px]">
              {trace?.possession_reference || "POS/2026/001"}
            </div>
            <span className="text-[10px] text-blue-700 font-medium block">
              {trace?.possession_status || "Taken"}
            </span>
          </div>

          {/* 7. R&R Entitlement */}
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-700 block uppercase">7. R&R Status</span>
            <div className="font-semibold text-emerald-950 text-xs truncate mt-0.5 font-mono text-[11px]">
              {family.family_reference_id}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">
              {family.rehabilitation_status?.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Demographics and Census Survey Details */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>PAF Socio-Demographic Census</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Head of Family</span>
              <p className="font-semibold text-gray-900 text-sm">{family.head_of_family_name}</p>
              <span className="font-mono text-emerald-700 text-[11px] font-medium">{family.family_reference_id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Family Members</span>
                <p className="font-semibold text-gray-900">{family.family_members_count} persons</p>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Social Category</span>
                <p className="font-semibold text-gray-900">{family.social_category}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 block text-[11px]">Contact Identifier (Masked)</span>
              <p className="font-mono text-gray-700 font-medium">{family.contact_masked || "+91 98XXX X4201"}</p>
              <span className="text-[10px] text-gray-400">PII protected for privacy governance</span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 block text-[11px]">Displacement Classification</span>
              <p className="font-semibold text-gray-800">{family.displacement_category?.replace(/_/g, " ")}</p>
              <span className="text-[10px] text-gray-500">{family.family_type?.replace(/_/g, " ")}</span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 block text-[11px]">Associated R&R Scheme</span>
              <Link
                href={`/r-and-r/${family.scheme_id}`}
                className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>{family.scheme_title}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Configurable Eligibility Assessment & Entitlement Ledger */}
        <div className="md:col-span-2 space-y-6">
          {/* Eligibility Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Configurable R&R Eligibility Assessment</span>
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  family.eligibility_status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : family.eligibility_status === "ELIGIBLE"
                    ? "bg-blue-100 text-blue-800"
                    : family.eligibility_status === "DISPUTED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {family.eligibility_status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Statutory Entitlement Category</span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {family.eligibility_category?.replace(/_/g, " ") || "SCHEDULE_II_BENEFICIARY"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Assessing Authority</span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {family.assessing_authority || "CALA & Competent Authority"}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Assessed: {formatDate(family.eligibility_assessment_date) || "Statutory Review Complete"}
                </span>
              </div>
            </div>

            {family.eligibility_basis && (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-950">
                <span className="font-semibold block text-[11px]">Legal & Statutory Basis:</span>
                <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">{family.eligibility_basis}</p>
              </div>
            )}

            {family.eligibility_remarks && (
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700 block text-[11px]">Assessment Remarks:</span>
                <p className="mt-0.5 text-gray-600">{family.eligibility_remarks}</p>
              </div>
            )}
          </div>

          {/* Statutory Entitlements & Allotments Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="h-4 w-4 text-emerald-600" />
                <span>Statutory Second Schedule Entitlements</span>
              </h3>
              <span className="text-xs text-emerald-700 font-semibold font-mono">
                Plot: {family.allotted_plot_number || "Pending Allocation"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[11px] text-gray-500 block">Entitled Plot Area</span>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {Number(family.entitled_plot_sqyd || 150).toFixed(0)} sq. yd.
                </p>
                <span className="text-[10px] text-gray-400">Homestead plot in model colony</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[11px] text-gray-500 block">Subsistence Grant</span>
                <p className="text-base font-bold text-emerald-800 mt-1">
                  ₹{Number(family.subsistence_grant_inr || 36000).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {family.is_grant_disbursed ? "✓ DBT Disbursed" : "Pending Payment"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[11px] text-gray-500 block">Resettlement Allowance</span>
                <p className="text-base font-bold text-gray-900 mt-1">
                  ₹{Number(family.one_time_resettlement_allowance_inr || 50000).toLocaleString("en-IN")}
                </p>
                <span className="text-[10px] text-gray-400">One-time relocation grant</span>
              </div>
            </div>

            {/* Allotments Ledger Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Delivered Allotments & Assets ({allotments.length})
              </h4>

              {allotments.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100">
                  <Home className="h-6 w-6 mx-auto text-gray-300 mb-1" />
                  <p>No specific plot or grant allotment orders recorded for this family yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Allotment Ref</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Asset Identifier</th>
                        <th className="py-2.5 px-3">Order No. & Date</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allotments.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                            {a.allotment_reference}
                          </td>
                          <td className="py-2.5 px-3">{a.allotment_type}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">{a.asset_identifier || "—"}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {a.allotment_order_no || "—"}
                            <span className="text-[10px] text-gray-400 block">{formatDate(a.allotment_date)}</span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            ₹{Number(a.allocated_value_inr || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                a.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : a.status === "ALLOTTED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Eligibility Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Configurable R&R Eligibility Assessment
                </h3>
              </div>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Eligibility Decision</label>
                <select
                  value={eligStatus}
                  onChange={(e) => setEligStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="APPROVED">APPROVED (Deemed Entitled by CALA)</option>
                  <option value="ELIGIBLE">ELIGIBLE (Survey Verified)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Pending Title / Survey)</option>
                  <option value="DISPUTED">DISPUTED (R&R Authority Hearing)</option>
                  <option value="INELIGIBLE">INELIGIBLE (Non-qualifying occupant)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Entitlement Category</label>
                <input
                  type="text"
                  value={eligCategory}
                  onChange={(e) => setEligCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Assessing Authority</label>
                <input
                  type="text"
                  value={assessingAuth}
                  onChange={(e) => setAssessingAuth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Statutory Legal Basis</label>
                <textarea
                  rows={2}
                  value={eligBasis}
                  onChange={(e) => setEligBasis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Assessment Remarks</label>
                <textarea
                  rows={2}
                  value={eligRemarks}
                  onChange={(e) => setEligRemarks(e.target.value)}
                  placeholder="Enter administrative review notes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowEligibilityModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateEligibility}
                disabled={updateEligibilityMutation.isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
              >
                {updateEligibilityMutation.isPending ? "Saving..." : "Save Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Allotment Modal */}
      {showAllotmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Record Entitlement / Plot Allotment
                </h3>
              </div>
              <button
                onClick={() => setShowAllotmentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Entitlement Category</label>
                  <select
                    value={allotCategory}
                    onChange={(e) => setAllotCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="HOUSING_RESETTLEMENT">Housing / Homestead Plot</option>
                    <option value="SUBSISTENCE_GRANT">Subsistence Grant</option>
                    <option value="LIVELIHOOD_SUPPORT">Livelihood Kit / Unit</option>
                    <option value="TRANSPORT_ALLOWANCE">Transportation Allowance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Allotment Type</label>
                  <select
                    value={allotType}
                    onChange={(e) => setAllotType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="PLOT">Homestead Plot</option>
                    <option value="HOUSING_UNIT">Constructed House</option>
                    <option value="CASH_GRANT">Direct Cash Grant</option>
                    <option value="LIVELIHOOD_ASSET">Livelihood Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Asset Identifier / Plot Number</label>
                <input
                  type="text"
                  placeholder="e.g. Plot B-22, Sector 4 Enclave"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Allotment Order No.</label>
                  <input
                    type="text"
                    placeholder="e.g. CALA/RR/2026/ORD-165"
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Allocated Value (₹)</label>
                  <input
                    type="number"
                    value={allocVal}
                    onChange={(e) => setAllocVal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Allotment Date</label>
                <input
                  type="date"
                  value={allotDate}
                  onChange={(e) => setAllotDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={allotRemarks}
                  onChange={(e) => setAllotRemarks(e.target.value)}
                  placeholder="Allotment conditions, patta delivery notes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAllotmentModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAllotment}
                disabled={createAllotmentMutation.isPending || !assetId}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
              >
                {createAllotmentMutation.isPending ? "Recording..." : "Issue Allotment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
