"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDisbursementDetail, useProcessDisbursement } from "@/lib/hooks/useDisbursements";
import { formatINR, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Award,
} from "lucide-react";

export default function DisbursementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disbursementId = params?.disbursementId as string;

  const { data: detail, isLoading, error } = useDisbursementDetail(disbursementId);
  const processMutation = useProcessDisbursement();

  const [showSimulateModal, setShowSimulateModal] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
        <p>Loading payment transaction details...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">Disbursement Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          Unable to locate disbursement ID {disbursementId}.
        </p>
        <Link
          href="/disbursements"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Disbursements
        </Link>
      </div>
    );
  }

  const isDisbursed = detail.payment_status === "DISBURSED";
  const isProcessing = detail.payment_status === "PROCESSING" || detail.payment_status === "PENDING";

  const handleSimulateCredit = async () => {
    try {
      await processMutation.mutateAsync({
        disbursementId,
        target_status: "DISBURSED",
      });
      setShowSimulateModal(false);
    } catch (err: any) {
      alert("Failed to simulate payment credit: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/disbursements"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Disbursements Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">
              {detail.disbursement_reference}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isDisbursed
                  ? "bg-green-100 text-green-800"
                  : isProcessing
                  ? "bg-amber-100 text-amber-800 animate-pulse"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {detail.payment_status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {detail.payment_workflow_label} • Batch: {detail.pfms_batch_reference}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isProcessing ? (
            <button
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Simulate PFMS DBT Credit
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-800 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Credited to Beneficiary
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gray-400 block">
            Direct Benefit Transfer Amount
          </span>
          <span className="text-3xl font-extrabold text-gray-900 font-mono mt-1 block">
            {formatINR(detail.amount_inr)}
          </span>
          <span className="text-xs text-gray-500 mt-1 block">
            Award Reference:{" "}
            <Link
              href={`/awards/${detail.award_id}`}
              className="text-purple-700 font-semibold hover:underline font-mono"
            >
              {detail.award_number}
            </Link>{" "}
            ({formatINR(detail.award_amount_inr)} total award)
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs space-y-1 min-w-[240px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Gateway:</span>
            <span className="font-semibold text-gray-800">{detail.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">PFMS Batch:</span>
            <span className="font-mono text-gray-800">{detail.pfms_batch_reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Bank UTR:</span>
            <span className="font-mono font-bold text-emerald-800">
              {detail.bank_utr_number || "Pending Gateway Callback"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Beneficiary Details & Audit Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beneficiary Card (Masked PII) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
              <Users className="h-4 w-4" />
              <h3>Beneficiary Account Details</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">PII Masked</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name:</span>
              <span className="font-bold text-gray-900">{detail.owner_name}</span>
            </div>
            {detail.relative_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Relative / Guardian:</span>
                <span className="text-gray-800">{detail.relative_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Bank Name:</span>
              <span className="font-medium text-gray-800">{detail.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Masked Account:</span>
              <span className="font-mono font-bold text-gray-900">{detail.masked_bank_account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Masked IFSC:</span>
              <span className="font-mono text-gray-800">{detail.masked_ifsc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Social Category:</span>
              <span className="text-gray-800">{detail.social_category}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
              <span className="text-gray-500">KYC Status:</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  detail.is_kyc_verified ? "text-green-700" : "text-amber-600"
                }`}
              >
                {detail.is_kyc_verified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Aadhaar / Bank KYC Verified
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    Verification Pending
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Parcel & Jurisdiction Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary-800 font-bold text-sm border-b border-gray-100 pb-2">
            <Building2 className="h-4 w-4" />
            <h3>Project & Land Parcel Reference</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Project:</span>
              <span className="font-medium text-gray-800 max-w-[240px] text-right truncate">
                {detail.project_title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Project Code:</span>
              <span className="font-mono text-gray-800">{detail.project_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Khasra Number:</span>
              <span className="font-mono font-bold text-gray-900">{detail.khasra_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">District & State:</span>
              <span className="text-gray-800">
                {detail.district_name}, {detail.state_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Processed By:</span>
              <span className="text-gray-800">{detail.processed_by_user_name || "PFMS Gateway Service"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Disbursed Timestamp:</span>
              <span className="font-mono text-gray-800">{formatDate(detail.disbursed_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <RefreshCw className="h-5 w-5" />
              <h3>Simulate PFMS Payment Credit</h3>
            </div>
            <p className="text-xs text-gray-600">
              This will trigger a simulated bank gateway callback for transaction{" "}
              <strong>{detail.disbursement_reference}</strong>. A mock bank UTR number will be generated and the status will transition to <strong>DISBURSED</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateCredit}
                disabled={processMutation.isPending}
                className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-medium disabled:opacity-50"
              >
                {processMutation.isPending ? "Simulating..." : "Simulate Gateway Credit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
