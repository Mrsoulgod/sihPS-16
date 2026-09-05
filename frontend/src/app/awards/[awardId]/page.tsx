"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAwardDetail, useSignAward, useUpdateAwardStatus } from "@/lib/hooks/useAwards";
import { useInitiateBatch } from "@/lib/hooks/useDisbursements";
import { formatINR, formatCrores, formatDate, formatNumber, formatAreaAcres, formatAreaSqm } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Layers,
  CreditCard,
  Hash,
  Info,
  ExternalLink,
} from "lucide-react";

export default function AwardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const awardId = params?.awardId as string;

  const { data: award, isLoading, error } = useAwardDetail(awardId);
  const signMutation = useSignAward();
  const updateStatusMutation = useUpdateAwardStatus();
  const initiateBatchMutation = useInitiateBatch();

  const [remarks, setRemarks] = useState("");
  const [showSignModal, setShowSignModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2" />
        <p>Loading award details...</p>
      </div>
    );
  }

  if (error || !award) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">Award Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">Unable to find award with ID {awardId}.</p>
        <Link
          href="/awards"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-purple-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Awards Directory
        </Link>
      </div>
    );
  }

  const handleSign = async () => {
    try {
      await signMutation.mutateAsync({
        awardId,
        remarks: remarks || "Statutory award verified and sealed by Competent Authority.",
      });
      setShowSignModal(false);
    } catch (err: any) {
      alert("Failed to sign award: " + (err?.message || "Unknown error"));
    }
  };

  const handleInitiateBatch = async () => {
    try {
      await initiateBatchMutation.mutateAsync({
        award_id: awardId,
        remarks: "PFMS DBT disbursement batch generated for Award " + award.award_number,
      });
      setShowBatchModal(false);
      router.push(`/disbursements?award_id=${awardId}`);
    } catch (err: any) {
      alert("Failed to initiate payment batch: " + (err?.message || "Unknown error"));
    }
  };

  const hasDemoSign = !!award.digital_sign_hash;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/awards"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Awards Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">
              {award.award_number}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                award.status === "ISSUED"
                  ? "bg-green-100 text-green-800"
                  : award.status === "APPROVED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {award.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {award.project_code} — {award.project_title} ({award.district_name}, {award.state_name})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!hasDemoSign && (
            <button
              onClick={() => setShowSignModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <FileCheck className="h-4 w-4" />
              Apply Demo e-Sign / Stamp
            </button>
          )}

          <button
            onClick={() => setShowBatchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Initiate PFMS DBT Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Award Amount</span>
          <span className="text-lg font-extrabold text-gray-900 font-mono mt-0.5 block">
            {formatINR(award.total_award_amount_inr)}
          </span>
          <span className="text-[10px] text-gray-400">Section 23 statutory total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-green-500 block">Disbursed via PFMS</span>
          <span className="text-lg font-extrabold text-green-700 font-mono mt-0.5 block">
            {formatINR(award.total_disbursed_inr)}
          </span>
          <span className="text-[10px] text-green-600 font-medium">
            {formatNumber(award.disbursement_percent, 1)}% Completed
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">Remaining Balance</span>
          <span className="text-lg font-extrabold text-amber-700 font-mono mt-0.5 block">
            {formatINR(award.remaining_inr)}
          </span>
          <span className="text-[10px] text-gray-400">Under processing / pending</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-purple-500 block">Scope & Extent</span>
          <span className="text-lg font-extrabold text-purple-700 font-mono mt-0.5 block">
            {award.total_parcels_count} Parcels
          </span>
          <span className="text-[10px] text-gray-400">
            {award.total_area_acres ? formatAreaAcres(award.total_area_acres) : "—"}
          </span>
        </div>
      </div>

      {/* Demo e-Sign / Approval Stamp Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 rounded-md text-purple-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Demo e-Sign / Approval Stamp
              </h3>
              <p className="text-[11px] text-gray-400">
                Cryptographic authentication stamp demonstration for prototype verification.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Simulated Demonstration
          </span>
        </div>

        {hasDemoSign ? (
          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-900">
                {award.approval_stamp_label || "Demo e-Sign / Approval Stamp"}
              </span>
              <span className="text-[11px] text-purple-700 font-medium">
                Applied on {formatDate(award.approval_date || award.award_date)}
              </span>
            </div>
            <p className="text-gray-600 text-[11px]">
              Competent Authority (CALA): <strong>{award.cala_user_name}</strong>
              {award.cala_designation && ` (${award.cala_designation})`}
            </p>
            <div className="flex items-center gap-2 font-mono text-[10px] text-purple-800 bg-white p-2 rounded border border-purple-200 overflow-x-auto">
              <Hash className="h-3 w-3 shrink-0 text-purple-500" />
              <span className="truncate">Digital Stamp Hash: {award.digital_sign_hash}</span>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              Notice: This simulated cryptographic approval stamp demonstrates integrity validation within the NLAMS workflow.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Pending official CALA e-signature stamping.</span>
            </div>
            <button
              onClick={() => setShowSignModal(true)}
              className="text-xs text-purple-700 font-medium hover:underline"
            >
              Sign now →
            </button>
          </div>
        )}
      </div>

      {/* Covered Parcels & Assessments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Layers className="h-4 w-4 text-purple-700" />
            <h3>Covered Land Parcels & Compensation Determinations</h3>
          </div>
          <span className="text-xs text-gray-500">
            {award.parcels?.length || 0} parcel(s) included in this award
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Khasra Number</th>
                <th className="py-2.5 px-4">Village</th>
                <th className="py-2.5 px-4">Beneficiaries</th>
                <th className="py-2.5 px-4 text-right">Acquired Extent</th>
                <th className="py-2.5 px-4">Assessment Reference</th>
                <th className="py-2.5 px-4 text-right">Assessed Amount</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {award.parcels && award.parcels.length > 0 ? (
                award.parcels.map((p) => (
                  <tr key={p.parcel_id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      Khasra {p.khasra_number}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{p.village_name}</td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-gray-700">
                      {p.owner_names && p.owner_names.length > 0
                        ? p.owner_names.join(", ")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {formatAreaSqm(p.acquired_area_sqm)}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary-800">
                      {p.assessment_reference || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatINR(p.assessed_amount_inr)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.compensation_assessment_id ? (
                        <Link
                          href={`/compensation/${p.compensation_assessment_id}`}
                          className="inline-flex items-center gap-1 text-primary-700 hover:underline font-medium text-xs"
                        >
                          Breakdown
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-xs text-gray-400">
                    No parcels mapped to this award.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-base">
              <ShieldCheck className="h-5 w-5" />
              <h3>Apply Demo e-Sign / Approval Stamp</h3>
            </div>
            <p className="text-xs text-gray-600">
              Applying simulated Competent Authority digital approval stamp for Award{" "}
              <strong>{award.award_number}</strong> with total compensation of{" "}
              <strong>{formatINR(award.total_award_amount_inr)}</strong>.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Official Sanction Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter statutory sanction remarks..."
                rows={3}
                className="w-full p-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={signMutation.isPending}
                className="px-4 py-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white rounded-md font-medium disabled:opacity-50"
              >
                {signMutation.isPending ? "Applying Stamp..." : "Confirm & Stamp Award"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Initiation Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-base">
              <CreditCard className="h-5 w-5" />
              <h3>Initiate PFMS-Compatible Payment Batch</h3>
            </div>
            <p className="text-xs text-gray-600">
              Generate a simulated Direct Benefit Transfer (DBT) batch for all recognized landowners under Award{" "}
              <strong>{award.award_number}</strong>. Bank details will be masked and mock UTR tracking will be activated.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateBatch}
                disabled={initiateBatchMutation.isPending}
                className="px-4 py-1.5 text-xs bg-primary-700 hover:bg-primary-800 text-white rounded-md font-medium disabled:opacity-50"
              >
                {initiateBatchMutation.isPending ? "Generating Batch..." : "Generate PFMS Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
