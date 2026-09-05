"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePossessionDetail, useUpdatePossessionStatus } from "@/lib/hooks/usePossession";
import { formatDate, formatAreaAcres, formatAreaSqm } from "@/lib/utils";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  MapPin,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Award,
  ExternalLink,
  Info,
} from "lucide-react";

export default function PossessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const possessionId = params?.possessionId as string;

  const { data: detail, isLoading, error } = usePossessionDetail(possessionId);
  const updateStatusMutation = useUpdatePossessionStatus();

  const [remarks, setRemarks] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState("TAKEN");

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2" />
        <p>Loading possession details...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">Possession Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          Unable to locate possession ID {possessionId}.
        </p>
        <Link
          href="/possession"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Possession Directory
        </Link>
      </div>
    );
  }

  const isTaken = detail.status === "TAKEN";
  const isUrgency = detail.possession_type === "SECTION_40_URGENCY_CLAUSE";

  const handleUpdateStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        possessionId,
        status: targetStatus,
        remarks: remarks || "Status transitioned via administrative review.",
      });
      setShowStatusModal(false);
    } catch (err: any) {
      alert("Failed to update status: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/possession"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Possession Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">
              {detail.possession_reference}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isTaken
                  ? "bg-green-100 text-green-800"
                  : detail.status === "SCHEDULED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {detail.status}
            </span>
            {isUrgency ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Section 40 (Urgency Clause)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Section 38 (Regular Handover)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {detail.project_code} — {detail.project_title}
          </p>
        </div>

        {/* Action Button */}
        {!isTaken && (
          <button
            onClick={() => {
              setTargetStatus("TAKEN");
              setShowStatusModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            Record Formal Handover
          </button>
        )}
      </div>

      {/* Prerequisite Compliance Checklist Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
            <ShieldCheck className="h-5 w-5 text-blue-700" />
            <h3>Prerequisite Compliance & Statutory Verification</h3>
          </div>
          <span className="text-xs text-gray-500">
            Governed by Section 38 / 40 Standards
          </span>
        </div>

        <p className="text-xs text-gray-600">
          In accordance with statutory acquisition rules, physical possession takeover is only sanctioned when statutory prerequisites have been satisfied.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {detail.prerequisite_checks && detail.prerequisite_checks.map((chk, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                chk.is_satisfied
                  ? "bg-green-50/60 border-green-200"
                  : "bg-amber-50/60 border-amber-200"
              }`}
            >
              {chk.is_satisfied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{chk.check_name}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      chk.is_satisfied ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {chk.status_label}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">{chk.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Handover Certificate Document Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Section 38 Handover & Taking-Over Certificate
              </h3>
              <p className="text-[10px] text-gray-500">
                Official bilateral instrument executed between Competent Authority and Acquiring Agency.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-gray-800">
            {detail.certificate_number || "CERT-PENDING"}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Handing Over Authority */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-lg text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Handing Over Authority (Revenue / CALA)
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {detail.handed_over_by_officer_name}
              </p>
              <p className="text-gray-600">
                Designation: {detail.handed_over_by_designation || "Competent Authority Land Acquisition"}
              </p>
              <p className="text-gray-600">
                Jurisdiction: {detail.district_name}, {detail.state_name}
              </p>
            </div>

            {/* Taking Over Agency */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-lg text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Taking Over Authority (Acquiring Agency)
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {detail.taken_by_officer_name}
              </p>
              <p className="text-gray-600">
                Organization: {detail.taken_by_organization || "National Highways Authority of India"}
              </p>
              <p className="text-gray-600">
                Project: {detail.project_title}
              </p>
            </div>
          </div>

          {/* Parcel Details */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Khasra Number</span>
              <span className="font-mono font-bold text-gray-900">{detail.khasra_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Acquired Extent</span>
              <span className="font-mono font-semibold text-gray-900 block">
                {formatAreaAcres(detail.area_acres)}
              </span>
              <span className="text-[10px] text-gray-500 font-mono block">
                {formatAreaSqm(detail.acquired_area_sqm)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Handover Date</span>
              <span className="font-semibold text-gray-900">{formatDate(detail.possession_date)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Encumbrance Status</span>
              <span className="font-semibold text-green-700">
                {detail.is_encumbrance_free ? "Encumbrance-Free" : "Pending Clearance"}
              </span>
            </div>
          </div>

          {detail.award_number && (
            <div className="border-t border-gray-100 pt-3 text-xs flex items-center justify-between">
              <span className="text-gray-500">Statutory Award Sanction:</span>
              <Link
                href={`/awards/${detail.award_id}`}
                className="text-purple-700 font-semibold font-mono hover:underline inline-flex items-center gap-1"
              >
                {detail.award_number}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {detail.remarks && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
              <span className="font-semibold text-gray-800 block mb-0.5">Official Sanction Remarks:</span>
              {detail.remarks}
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-base">
              <FileCheck className="h-5 w-5" />
              <h3>Record Physical Possession Takeover</h3>
            </div>
            <p className="text-xs text-gray-600">
              Confirming formal physical takeover of Khasra <strong>{detail.khasra_number}</strong> ({formatAreaAcres(detail.area_acres)}) under Section 38. The parcel status will transition to <strong>POSSESSION_TAKEN</strong>.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Joint Inspection Notes / Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter field inspection notes..."
                rows={3}
                className="w-full p-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white rounded-md font-medium disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? "Recording Handover..." : "Confirm Possession Takeover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
