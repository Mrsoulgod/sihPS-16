"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDisbursements } from "@/lib/hooks/useDisbursements";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatINR, formatCrores, formatDate, parseNumeric } from "@/lib/utils";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";

export default function DisbursementsDirectoryPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: projectList } = useProjects();
  const projects = projectList || [];

  const {
    data: disbursementData,
    isLoading,
    error,
    refetch,
  } = useDisbursements({
    project_id: projectId || undefined,
    payment_status: status || undefined,
    search: search || undefined,
    page_size: 50,
  });

  const disbursements = disbursementData?.items || [];
  const totalCount = disbursementData?.pagination.total_records || disbursements.length;

  const totalDisbursedInr = disbursements
    .filter((d) => d.payment_status === "DISBURSED")
    .reduce((sum, d) => sum + parseNumeric(d.amount_inr), 0);

  const totalInFlightInr = disbursements
    .filter((d) => d.payment_status === "PROCESSING" || d.payment_status === "PENDING")
    .reduce((sum, d) => sum + parseNumeric(d.amount_inr), 0);

  const disbursedCount = disbursements.filter((d) => d.payment_status === "DISBURSED").length;
  const processingCount = disbursements.filter((d) => d.payment_status === "PROCESSING").length;
  const pendingCount = disbursements.filter((d) => d.payment_status === "PENDING").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                PFMS-Compatible / Simulated Payment Workflow
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Direct Benefit Transfer (DBT) execution, electronic payment batches, and bank reconciliation.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-green-500 block">Total Disbursed</span>
            <p className="text-sm font-bold text-green-700">{formatCrores(totalDisbursedInr)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-500 block">In-Flight (Processing)</span>
            <p className="text-sm font-bold text-amber-700">{formatCrores(totalInFlightInr)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Disbursed Records</span>
            <p className="text-sm font-bold text-gray-900">{disbursedCount} / {totalCount}</p>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-start gap-3 text-xs text-emerald-900">
        <Info className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">PFMS Integration Note: </span>
          Simulated PFMS DBT payment processing environment. Beneficiary bank accounts and personal identifiers are strictly masked for privacy. Realistic mock bank UTR numbers demonstrate end-to-end treasury reconciliation.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Beneficiary, UTR, Batch ref, or Khasra..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-1 min-w-[200px]">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full py-1.5 px-2 text-xs text-gray-700 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_code} - {p.title.length > 35 ? p.title.substring(0, 35) + "..." : p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1 min-w-[150px]">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full py-1.5 px-2 text-xs text-gray-700 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="DISBURSED">Disbursed (Credited)</option>
            <option value="PROCESSING">Processing (PFMS)</option>
            <option value="PENDING">Pending Batch</option>
            <option value="FAILED">Failed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mb-2" />
            <p>Loading disbursement ledger records...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load disbursements. Please retry.</p>
          </div>
        ) : disbursements.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-600">No disbursement transactions found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your project or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Disbursement Ref</th>
                  <th className="py-3 px-4">PFMS Batch</th>
                  <th className="py-3 px-4">Award Number</th>
                  <th className="py-3 px-4">Beneficiary Name</th>
                  <th className="py-3 px-4">Masked Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Bank UTR Number</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disbursements.map((d) => {
                  const isSuccess = d.payment_status === "DISBURSED";
                  const isProcessing = d.payment_status === "PROCESSING";

                  return (
                    <tr
                      key={d.id}
                      onClick={() => router.push(`/disbursements/${d.id}`)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-gray-900">
                        {d.disbursement_reference}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {d.pfms_batch_reference}
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-800 font-medium">
                        {d.award_number}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {d.owner_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {d.masked_bank_account}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        {formatINR(d.amount_inr)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuccess
                              ? "bg-green-100 text-green-800"
                              : isProcessing
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {d.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {d.bank_utr_number ? (
                          <span className="text-emerald-800 font-semibold">{d.bank_utr_number}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                          Inspect
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
