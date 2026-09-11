"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin,
  Sparkles,
  RefreshCw,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  FileCheck,
  Award,
  CreditCard,
  Compass,
  Check,
  X,
  Edit3,
  Send,
  Download,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  FamilyCaseDetailResponse,
  EligibilityReviewPayload,
  EntitlementAssessmentPayload,
  AllotmentActionPayload,
  VerificationActionPayload,
} from "@/lib/types/social";
import {
  reviewEligibility,
  assessEntitlements,
  issueAllotment,
  verifyAndCompleteCase,
} from "@/lib/api/social";

interface FamilyCaseWorkspaceProps {
  initialData: FamilyCaseDetailResponse;
  onRefresh?: () => void;
}

export function FamilyCaseWorkspace({
  initialData,
  onRefresh,
}: FamilyCaseWorkspaceProps) {
  const [data, setData] = useState<FamilyCaseDetailResponse>(initialData);
  const [activeTab, setActiveTab] = useState<
    "summary" | "eligibility" | "entitlements" | "allotments" | "documents" | "implementation" | "verification" | "timeline"
  >("summary");

  // Modal / Action States
  const [showEligModal, setShowEligModal] = useState(false);
  const [eligStatus, setEligStatus] = useState("ELIGIBLE");
  const [eligCategory, setEligCategory] = useState(data.eligibility.eligibility_category || "Section 31 Schedule II (Titleholder Agriculturalist)");
  const [eligBasis, setEligBasis] = useState(data.eligibility.eligibility_basis || "Verified in Jamabandi revenue records and on-ground survey.");
  const [eligRemarks, setEligRemarks] = useState(data.eligibility.remarks || "");

  const [showEntitleModal, setShowEntitleModal] = useState(false);
  const [entitlePlot, setEntitlePlot] = useState<number>(Number(data.entitlements.entitled_plot_sqyd) || 150);
  const [subsistenceGrant, setSubsistenceGrant] = useState<number>(Number(data.entitlements.subsistence_grant_inr) || 36000);
  const [transportAllowance, setTransportAllowance] = useState<number>(Number(data.entitlements.transportation_allowance_inr) || 50000);
  const [resettleAllowance, setResettleAllowance] = useState<number>(Number(data.entitlements.one_time_resettlement_allowance_inr) || 50000);

  const [showAllotModal, setShowAllotModal] = useState(false);
  const [allotType, setAllotType] = useState("PLOT");
  const [assetId, setAssetId] = useState("Plot A-12, Sector 4, Manpura Colony");
  const [allotOrderNo, setAllotOrderNo] = useState("CALA/JAI/2026/RR-108");
  const [allotValue, setAllotValue] = useState<number>(650000);

  const [showVerifModal, setShowVerifModal] = useState(false);
  const [verifRemarks, setVerifRemarks] = useState("Physical inspection verified. House constructed and family settled.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Eligibility Review Submit
  const handleSaveEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: EligibilityReviewPayload = {
        eligibility_status: eligStatus,
        eligibility_category: eligCategory,
        eligibility_basis: eligBasis,
        eligibility_remarks: eligRemarks,
      };
      const updated = await reviewEligibility(data.family_id, payload);
      setData(updated);
      setActionSuccess("eligibility");
      setTimeout(() => {
        setActionSuccess(null);
        setShowEligModal(false);
        setSuccessMsg(`Eligibility successfully updated to ${eligStatus}`);
        setTimeout(() => setSuccessMsg(null), 4000);
        if (onRefresh) onRefresh();
      }, 700);
    } catch (err: any) {
      alert(err.message || "Failed to update eligibility");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Entitlements Submit
  const handleSaveEntitlements = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: EntitlementAssessmentPayload = {
        entitled_plot_sqyd: Number(entitlePlot),
        subsistence_grant_inr: Number(subsistenceGrant),
        transportation_allowance_inr: Number(transportAllowance),
        one_time_resettlement_allowance_inr: Number(resettleAllowance),
      };
      const updated = await assessEntitlements(data.family_id, payload);
      setData(updated);
      setActionSuccess("entitlements");
      setTimeout(() => {
        setActionSuccess(null);
        setShowEntitleModal(false);
        setSuccessMsg("Entitlement assessment package recorded.");
        setTimeout(() => setSuccessMsg(null), 4000);
        if (onRefresh) onRefresh();
      }, 700);
    } catch (err: any) {
      alert(err.message || "Failed to update entitlements");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Allotment Submit
  const handleSaveAllotment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: AllotmentActionPayload = {
        scheme_id: data.allotments.scheme_id,
        allotment_type: allotType,
        asset_identifier: assetId,
        allotment_order_no: allotOrderNo,
        allocated_value_inr: Number(allotValue),
        status: "ALLOTTED",
        remarks: "Sanction allotment order generated by Social Officer.",
      };
      const updated = await issueAllotment(data.family_id, payload);
      setData(updated);
      setActionSuccess("allotment");
      setTimeout(() => {
        setActionSuccess(null);
        setShowAllotModal(false);
        setSuccessMsg(`Allotment order ${allotOrderNo} issued.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        if (onRefresh) onRefresh();
      }, 700);
    } catch (err: any) {
      alert(err.message || "Failed to issue allotment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verification & Completion Submit
  const handleVerifyComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: VerificationActionPayload = {
        verification_status: "VERIFIED",
        physical_relocation_confirmed: true,
        grant_receipt_confirmed: true,
        remarks: verifRemarks,
      };
      const updated = await verifyAndCompleteCase(data.family_id, payload);
      setData(updated);
      setActionSuccess("verify");
      setTimeout(() => {
        setActionSuccess(null);
        setShowVerifModal(false);
        setSuccessMsg("Family case verified & settled successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
        if (onRefresh) onRefresh();
      }, 700);
    } catch (err: any) {
      alert(err.message || "Failed to verify case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { summary, eligibility, entitlements, allotments, documents, implementation, verification, timeline, audit_history } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <Link href="/affected-families" className="hover:text-emerald-700">
              Affected Families
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">{summary.family_reference_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summary.head_of_family_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {summary.village_name}, Tehsil {summary.tehsil_name} • Khasra {summary.khasra_number} • {summary.project_title}
          </p>
        </div>

        {/* Status Pill & Action CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
              summary.case_status === "COMPLETED" || summary.case_status === "SETTLED"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : summary.case_status === "ALLOTTED"
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-amber-100 text-amber-800 border-amber-300"
            }`}
          >
            STAGE: {summary.case_status}
          </span>
          {summary.blocking_possession && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm">
              ⚠️ Blocking Possession
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Statutory Workflow Lifecycle Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs font-semibold">
          {[
            { label: "1. Identified", done: true },
            { label: "2. Survey", done: true },
            { label: "3. Eligibility", done: eligibility.eligibility_status === "ELIGIBLE" },
            { label: "4. Entitlement", done: entitlements.entitlement_status === "SANCTIONED" },
            { label: "5. Allotment", done: allotments.allotment_status === "ALLOTTED" },
            { label: "6. Implementation", done: implementation.current_status === "IN_PROGRESS" || implementation.current_status === "VERIFIED" },
            { label: "7. Verification", done: verification.verification_status === "VERIFIED" },
            { label: "8. Settled", done: summary.case_status === "SETTLED" || summary.case_status === "COMPLETED" },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step.done ? "bg-[#138808] text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={step.done ? "text-slate-900 font-bold" : "text-slate-400"}>
                {step.label}
              </span>
              {idx < 7 && <div className={`w-8 h-0.5 ${step.done ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto border border-slate-200">
        {[
          { id: "summary", label: "A. Case Summary" },
          { id: "eligibility", label: "B. Eligibility" },
          { id: "entitlements", label: "C. Entitlements" },
          { id: "allotments", label: "D. Allotments" },
          { id: "documents", label: "E. Documents" },
          { id: "implementation", label: "F. Implementation" },
          { id: "verification", label: "G. Verification" },
          { id: "timeline", label: "H. Timeline & Audit" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-md border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB A: SUMMARY */}
      {activeTab === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Family Identification & Cadastral Linkage</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Family Reference ID</span>
                <span className="font-mono font-bold text-slate-900">{summary.family_reference_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Head of Family</span>
                <span className="font-semibold text-slate-900">{summary.head_of_family_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Displacement Status</span>
                <span className="font-semibold text-slate-900">{summary.displacement_status}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Family Type</span>
                <span className="font-semibold text-slate-900">{summary.family_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Social Category</span>
                <span className="font-semibold text-slate-900">{summary.social_category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Family Members Count</span>
                <span className="font-semibold text-slate-900">{summary.family_members_count} persons</span>
              </div>
              <div>
                <span className="text-slate-400 block">Masked Contact</span>
                <span className="font-mono text-slate-900">{summary.contact_masked || "Masked"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Target SLA Date</span>
                <span className="font-mono text-slate-900">{summary.sla_due_date || "2026-09-25"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <span>Project & Land Parcel Association</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <span className="text-slate-400 block">Project Title</span>
                <span className="font-bold text-slate-900">{summary.project_title}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Project Code</span>
                <span className="font-mono text-slate-900">{summary.project_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Khasra Number</span>
                <span className="font-mono font-bold text-slate-900">{summary.khasra_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Village</span>
                <span className="font-semibold text-slate-900">{summary.village_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tehsil / District</span>
                <span className="font-semibold text-slate-900">{summary.tehsil_name}, {summary.district_name}</span>
              </div>
            </div>

            {summary.blocking_possession && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block">⚠️ Critical Possession Dependency:</span>
                Physical handover of Khasra {summary.khasra_number} is dependent on final relocation verification for this family.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: ELIGIBILITY */}
      {activeTab === "eligibility" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurable R&R Eligibility Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory determination under RFCTLARR 2013 Section 31 and Second Schedule
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEligModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Eligibility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block">Current Eligibility Status</span>
              <span
                className={`inline-block px-2.5 py-1 rounded-md font-mono font-bold text-xs mt-1 ${
                  eligibility.eligibility_status === "ELIGIBLE"
                    ? "bg-emerald-100 text-emerald-800"
                    : eligibility.eligibility_status === "UNDER_REVIEW"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {eligibility.eligibility_status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Eligibility Category</span>
              <span className="font-bold text-slate-900 mt-1 block">{eligibility.eligibility_category}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assessing Authority</span>
              <span className="font-semibold text-slate-900 mt-1 block">{eligibility.assessing_authority}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-700">Legal & Factual Basis:</span>
            <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
              {eligibility.eligibility_basis || "No basis notes recorded."}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-700">Social Officer Remarks:</span>
            <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
              {eligibility.remarks || "No additional remarks."}
            </p>
          </div>
        </div>
      )}

      {/* TAB C: ENTITLEMENTS */}
      {activeTab === "entitlements" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Entitlement & Assistance Assessment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Second Schedule statutory entitlement package
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEntitleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Entitlements</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-semibold block">Entitled Plot Area</span>
              <div className="text-xl font-black text-slate-900 mt-1">{entitlements.entitled_plot_sqyd} sq.yd</div>
              <span className="text-[10px] text-slate-400">Resettlement Colony</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-semibold block">Subsistence Grant</span>
              <div className="text-xl font-black text-emerald-700 mt-1">₹{Number(entitlements.subsistence_grant_inr).toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-slate-400">₹3,000/mo × 12 months</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-semibold block">Transportation Allowance</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{Number(entitlements.transportation_allowance_inr).toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-slate-400">One-time shifting cost</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] text-slate-500 font-semibold block">Resettlement Allowance</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{Number(entitlements.one_time_resettlement_allowance_inr).toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-slate-400">One-time resettlement</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold">
            <span>Total Financial Assistance Package</span>
            <span className="text-base font-black">₹{Number(entitlements.total_assistance_inr).toLocaleString("en-IN")}</span>
          </div>

          <p className="text-xs text-slate-500">
            Source Parameter: <span className="font-semibold text-slate-700">{entitlements.source_parameter}</span>
          </p>
        </div>
      )}

      {/* TAB D: ALLOTMENTS */}
      {activeTab === "allotments" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Resettlement Plot & Grant Allotments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official allotment sanction orders under {allotments.scheme_title || "R&R Scheme"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllotModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Issue Allotment Order</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase font-mono bg-slate-50">
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Asset / Identifier</th>
                  <th className="py-2.5 px-3">Sanction Order</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allotments.items.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{alt.allotment_reference}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                        {alt.allotment_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">{alt.asset_identifier}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{alt.allotment_order_no}</td>
                    <td className="py-3 px-3 text-slate-500">{alt.allotment_date}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      ₹{Number(alt.allocated_value_inr).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {alt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB E: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">R&R Case Supporting Documents</h2>
          <div className="space-y-3">
            {documents.submitted_documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{doc.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {doc.file_name} • Hash: {doc.file_hash?.slice(0, 16)}... • Uploaded by {doc.uploaded_by}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB F: IMPLEMENTATION */}
      {activeTab === "implementation" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Relocation & Implementation Tracking</h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Overall Implementation Progress</span>
              <span>{implementation.progress_percent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#138808] h-full rounded-full transition-all"
                style={{ width: `${implementation.progress_percent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-500 font-semibold block">Physical Plot Handover</span>
              <span className="font-bold text-emerald-700 text-sm block mt-1">
                {implementation.physical_possession_handed_over ? "✅ Handed Over" : "⏳ Pending"}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-500 font-semibold block">DBT Financial Grants</span>
              <span className="font-bold text-emerald-700 text-sm block mt-1">
                {implementation.grant_transferred ? "✅ Transferred" : "⏳ In Progress"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB G: VERIFICATION & COMPLETION */}
      {activeTab === "verification" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Final On-Ground Verification & Sign-off</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign off physical relocation and mark family case as SETTLED / COMPLETED
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVerifModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Complete Case</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-700">Verification Status:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold ml-2">
              {verification.verification_status}
            </span>
            <p className="text-slate-600 mt-2">
              Officer: <span className="font-semibold text-slate-900">{verification.verifying_officer_name}</span> ({verification.verifying_officer_designation})
            </p>
            <p className="text-slate-600">
              Observations: <span className="font-medium text-slate-900">{verification.observations}</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB H: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Statutory Case Event Timeline</h2>
          <div className="space-y-4">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{event.title}</span>
                  <p className="text-slate-600">{event.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {event.actor_name} ({event.actor_role}) • {event.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Eligibility Review Modal */}
      {showEligModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Update R&R Eligibility Review</h3>
              <button type="button" onClick={() => setShowEligModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEligibility} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Eligibility Decision</label>
                <select
                  value={eligStatus}
                  onChange={(e) => setEligStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="ELIGIBLE">ELIGIBLE</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
                  <option value="REWORK_REQUIRED">REWORK_REQUIRED</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Eligibility Category</label>
                <input
                  type="text"
                  value={eligCategory}
                  onChange={(e) => setEligCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Legal & Factual Basis</label>
                <textarea
                  rows={3}
                  value={eligBasis}
                  onChange={(e) => setEligBasis(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Remarks</label>
                <input
                  type="text"
                  value={eligRemarks}
                  onChange={(e) => setEligRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEligModal(false)}
                  disabled={isSubmitting || actionSuccess === "eligibility"}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || actionSuccess === "eligibility"}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 ${
                    actionSuccess === "eligibility" ? "bg-emerald-700" : "bg-[#138808] hover:bg-emerald-700"
                  }`}
                >
                  {actionSuccess === "eligibility" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span>Eligibility Saved</span>
                    </>
                  ) : isSubmitting ? (
                    "Saving..."
                  ) : (
                    "Save Eligibility"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Entitlements Modal */}
      {showEntitleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Record Entitlement Package</h3>
              <button type="button" onClick={() => setShowEntitleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEntitlements} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Entitled Plot Area (sq.yd)</label>
                <input
                  type="number"
                  value={entitlePlot}
                  onChange={(e) => setEntitlePlot(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subsistence Grant (₹)</label>
                <input
                  type="number"
                  value={subsistenceGrant}
                  onChange={(e) => setSubsistenceGrant(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Transportation Allowance (₹)</label>
                <input
                  type="number"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">One-Time Resettlement Allowance (₹)</label>
                <input
                  type="number"
                  value={resettleAllowance}
                  onChange={(e) => setResettleAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEntitleModal(false)}
                  disabled={isSubmitting || actionSuccess === "entitlements"}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || actionSuccess === "entitlements"}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 ${
                    actionSuccess === "entitlements" ? "bg-emerald-700" : "bg-[#138808] hover:bg-emerald-700"
                  }`}
                >
                  {actionSuccess === "entitlements" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span>Entitlements Saved</span>
                    </>
                  ) : isSubmitting ? (
                    "Saving..."
                  ) : (
                    "Save Entitlements"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Allotment Order Modal */}
      {showAllotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Issue Allotment Order</h3>
              <button type="button" onClick={() => setShowAllotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAllotment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Allotment Type</label>
                <select
                  value={allotType}
                  onChange={(e) => setAllotType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="PLOT">Resettlement Plot</option>
                  <option value="HOUSING_UNIT">Constructed Housing Unit</option>
                  <option value="SUBSISTENCE_ALLOWANCE">Subsistence Allowance (DBT)</option>
                  <option value="TRANSPORT_ALLOWANCE">Transport Allowance (DBT)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Identifier / Plot Number</label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold"
                  placeholder="e.g. Plot B-14, Manpura Resettlement Colony"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sanction Order Number</label>
                <input
                  type="text"
                  value={allotOrderNo}
                  onChange={(e) => setAllotOrderNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Allocated Value (₹)</label>
                <input
                  type="number"
                  value={allotValue}
                  onChange={(e) => setAllotValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAllotModal(false)}
                  disabled={isSubmitting || actionSuccess === "allotment"}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || actionSuccess === "allotment"}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 ${
                    actionSuccess === "allotment" ? "bg-emerald-700" : "bg-[#138808] hover:bg-emerald-700"
                  }`}
                >
                  {actionSuccess === "allotment" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span>Sanction Order Issued</span>
                    </>
                  ) : isSubmitting ? (
                    "Issuing..."
                  ) : (
                    "Issue Sanction Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Verification & Completion Modal */}
      {showVerifModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Sign Off Verification & Settle Case</h3>
              <button type="button" onClick={() => setShowVerifModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleVerifyComplete} className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-medium">
                ✅ Confirm that the family has physically relocated to the allotted site and received sanctioned assistance grants.
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Verification Observations & Sign-off Notes</label>
                <textarea
                  rows={4}
                  value={verifRemarks}
                  onChange={(e) => setVerifRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowVerifModal(false)}
                  disabled={isSubmitting || actionSuccess === "verify"}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || actionSuccess === "verify"}
                  className={`px-4 py-2 text-white rounded-xl font-bold transition flex items-center gap-1.5 ${
                    actionSuccess === "verify" ? "bg-emerald-700" : "bg-[#138808] hover:bg-emerald-700"
                  }`}
                >
                  {actionSuccess === "verify" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span>Case Verified & Settled</span>
                    </>
                  ) : isSubmitting ? (
                    "Submitting..."
                  ) : (
                    "Sign Off & Complete Case"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
