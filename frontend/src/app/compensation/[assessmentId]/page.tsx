"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCompensationAssessmentDetail,
  useApproveCompensation,
} from "@/lib/hooks/useCompensation";
import { formatINR, formatDate, formatAreaSqm, parseNumeric } from "@/lib/utils";
import {
  ArrowLeft,
  Calculator,
  Building2,
  MapPin,
  Users,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function CompensationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.assessmentId as string;

  const { data: detail, isLoading, error } = useCompensationAssessmentDetail(assessmentId);
  const approveMutation = useApproveCompensation();

  const [remarks, setRemarks] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-500 max-w-5xl mx-auto">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mb-2" />
        <p>Loading compensation assessment details...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-gray-900">Assessment Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          Unable to locate compensation assessment ID {assessmentId}.
        </p>
        <Link
          href="/compensation"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary-700 font-medium hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
        </Link>
      </div>
    );
  }

  const b = detail.breakdown;
  const isApproved = detail.is_approved_by_cala || detail.status === "APPROVED";

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        assessmentId,
        decision: "APPROVED",
        remarks: remarks || "Approved in accordance with statutory valuation schedule.",
      });
      setShowApproveModal(false);
    } catch (err: any) {
      alert("Failed to record approval: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/compensation"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Compensation Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">
              {detail.assessment_reference}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isApproved
                  ? "bg-green-100 text-green-800"
                  : detail.status === "UNDER_REVIEW"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {detail.status}
            </span>
            {detail.award_number && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                <Award className="h-3 w-3" />
                Awarded: {detail.award_number}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {detail.project_code} — {detail.project_title}
          </p>
        </div>

        {/* Approval Action / Status */}
        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="text-left">
                <span className="text-[10px] text-green-700 uppercase font-bold block">
                  CALA Approval Confirmed
                </span>
                <span className="text-xs text-green-900 font-medium">
                  {formatDate(detail.approval_date)} by {detail.assessing_officer_name || "CALA Officer"}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowApproveModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <FileCheck className="h-4 w-4" />
              CALA Review & Approval
            </button>
          )}
        </div>
      </div>

      {/* Primary Card: Transparent Calculation Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-primary-200">
                Statutory Assessment Methodology
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Configurable Compensation Assessment Framework
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-primary-200 block">
                Total Assessed Amount
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {formatINR(detail.total_compensation_inr)}
              </span>
            </div>
          </div>

          {/* Formula Pipeline Presentation */}
          <div className="mt-4 pt-3 border-t border-primary-700/60 text-[11px] text-primary-100 flex flex-wrap items-center gap-1.5 font-mono">
            <span className="bg-primary-800/80 px-2 py-0.5 rounded border border-primary-700">
              Market / Base Land Value
            </span>
            <span className="text-primary-300 font-bold">+</span>
            <span className="bg-primary-800/80 px-2 py-0.5 rounded border border-primary-700">
              Applicable Land Value Factors
            </span>
            <span className="text-primary-300 font-bold">+</span>
            <span className="bg-primary-800/80 px-2 py-0.5 rounded border border-primary-700">
              Asset / Structure Valuation
            </span>
            <span className="text-primary-300 font-bold">+</span>
            <span className="bg-primary-800/80 px-2 py-0.5 rounded border border-primary-700">
              Applicable Statutory Additional Amounts
            </span>
            <span className="text-primary-300 font-bold">+</span>
            <span className="bg-primary-800/80 px-2 py-0.5 rounded border border-primary-700">
              Applicable Solatium
            </span>
            <span className="text-primary-300 font-bold">=</span>
            <span className="bg-white/10 px-2 py-0.5 rounded font-bold text-white">
              Assessed Compensation
            </span>
          </div>
        </div>

        {/* 5 Distinct Component Rows */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Itemized Statutory Derivation Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Component 1: Base Land Value */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">
                  1. Market / Base Land Value
                </span>
                <span className="text-xs font-mono font-bold text-gray-900">
                  {formatINR(detail.base_land_value_inr)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Acquired Area: {formatAreaSqm(detail.acquired_area_sqm)} × Circle Rate: {formatINR(detail.circle_rate_per_sqm)}/m²
              </p>
              <span className="inline-block text-[10px] text-gray-400">
                Statutory Basis: Schedule 1, Section 26 base market determination
              </span>
            </div>

            {/* Component 2: Applicable Land Value Factors */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">
                  2. Applicable Land Value Factors
                </span>
                <span className="text-xs font-mono font-bold text-primary-700">
                  {formatINR(parseNumeric(detail.market_value_land_inr) - parseNumeric(detail.base_land_value_inr))}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Configured Multiplier Factor: {detail.multiplier_factor}× (Yields Land Market Value: {formatINR(detail.market_value_land_inr)})
              </p>
              <span className="inline-block text-[10px] text-gray-400">
                Statutory Basis: First Schedule multiplier factor based on distance/location
              </span>
            </div>

            {/* Component 3: Asset / Structure Valuation */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">
                  3. Asset / Structure Valuation
                </span>
                <span className="text-xs font-mono font-bold text-gray-900">
                  {formatINR(detail.assets_value_inr)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Itemized Net Valuation: {detail.asset_valuations?.length || 0} recognized asset item(s) attached to the land
              </p>
              <span className="inline-block text-[10px] text-gray-400">
                Statutory Basis: Sections 29 & 30 (Structures, timber/fruit trees, irrigation wells)
              </span>
            </div>

            {/* Component 4: Applicable Statutory Additional Amount */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">
                  4. Applicable Statutory Additional Amount
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  {formatINR(detail.additional_market_value_inr)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                12% p.a. condition-based amount ({b?.statutory_period_days || 0} statutory days from Section 11 notice to Award date)
              </p>
              <span className="inline-block text-[10px] text-gray-400">
                Statutory Basis: Section 30(3) timeline-based statutory addition (not commercial interest)
              </span>
            </div>

            {/* Component 5: Applicable Solatium */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800">
                  5. Applicable Solatium
                </span>
                <span className="text-xs font-mono font-bold text-green-700">
                  {formatINR(detail.solatium_inr)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                100% statutory solatium calculated on (Market Value of Land + Asset Valuation: {formatINR(parseNumeric(detail.market_value_land_inr) + parseNumeric(detail.assets_value_inr))})
              </p>
              <span className="inline-block text-[10px] text-gray-400">
                Statutory Basis: Section 30(1) compulsory acquisition solatium
              </span>
            </div>
          </div>

          {/* Audit Formula Summary */}
          {b?.calculation_summary && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-mono">
              <span className="font-semibold text-gray-800 block mb-1">Administrative Derivation Trail:</span>
              {b.calculation_summary}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Parcel Info & Landowners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Parcel Cadastral Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary-800 font-bold text-sm border-b border-gray-100 pb-2">
            <Layers className="h-4 w-4" />
            <h3>Cadastral Land Parcel Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Khasra Number</span>
              <span className="font-semibold text-gray-900">{detail.khasra_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Khata Number</span>
              <span className="font-semibold text-gray-900">{detail.khata_number || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Village & Tehsil</span>
              <span className="font-semibold text-gray-900">
                {detail.village_name}{detail.tehsil_name ? `, ${detail.tehsil_name}` : ""}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">District & State</span>
              <span className="font-semibold text-gray-900">
                {detail.district_name}, {detail.state_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Land Classification</span>
              <span className="font-semibold text-gray-900">{detail.land_type}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Acquired Extent</span>
              <span className="font-semibold text-gray-900 font-mono">
                {formatAreaSqm(detail.acquired_area_sqm)}
              </span>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href={`/land-parcels`}
              className="text-xs text-primary-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              View in Cadastral Directory →
            </Link>
          </div>
        </div>

        {/* Card: Beneficiaries & Ownership (Strictly Masked PII) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
              <Users className="h-4 w-4" />
              <h3>Recognized Landowners / Beneficiaries</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">PII Masked</span>
          </div>

          <div className="space-y-3">
            {detail.owners && detail.owners.length > 0 ? (
              detail.owners.map((o) => (
                <div
                  key={o.id}
                  className="p-3 bg-gray-50/70 border border-gray-200 rounded-lg text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{o.full_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-800 font-mono">
                      {o.ownership_share_percent}% Share
                    </span>
                  </div>
                  {o.relative_name && (
                    <p className="text-[11px] text-gray-500">S/o, D/o, W/o: {o.relative_name}</p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] font-mono text-gray-600">
                    <span>A/C: {o.masked_bank_account}</span>
                    <span>IFSC: {o.masked_bank_ifsc}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                        o.is_kyc_verified ? "text-green-700" : "text-amber-600"
                      }`}
                    >
                      {o.is_kyc_verified ? "✓ KYC Verified" : "⚠ KYC Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                No individual owners mapped.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Asset Valuation Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
            <Building2 className="h-4 w-4" />
            <h3>Itemized Asset & Structure Valuations</h3>
          </div>
          <span className="text-xs font-mono font-bold text-gray-900">
            Net Assets: {formatINR(detail.assets_value_inr)}
          </span>
        </div>

        {detail.asset_valuations && detail.asset_valuations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Asset Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Gross Value</th>
                  <th className="py-2.5 px-3 text-right">Depreciation</th>
                  <th className="py-2.5 px-3 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {detail.asset_valuations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {a.asset_category}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 font-sans">{a.description}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {a.quantity} {a.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {formatINR(a.unit_rate_inr)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">
                      {formatINR(a.total_asset_value_inr)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-600">
                      -{formatINR(a.depreciation_inr)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {formatINR(a.net_asset_value_inr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-3 text-center">
            No attached assets/structures recognized on this parcel.
          </p>
        )}
      </div>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-base">
              <FileCheck className="h-5 w-5" />
              <h3>CALA Assessment Approval</h3>
            </div>

            <p className="text-xs text-gray-600">
              You are endorsing the statutory compensation valuation of{" "}
              <strong className="text-gray-900 font-mono">
                {formatINR(detail.total_compensation_inr)}
              </strong>{" "}
              for Khasra <strong>{detail.khasra_number}</strong>. This assessment will become eligible for inclusion in an official Section 23/30 Award.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">
                Official Remarks / Sanction Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval sanction reference or notes..."
                rows={3}
                className="w-full p-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="px-4 py-1.5 text-xs bg-green-700 hover:bg-green-800 text-white rounded-md font-medium disabled:opacity-50"
              >
                {approveMutation.isPending ? "Recording Approval..." : "Confirm CALA Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
