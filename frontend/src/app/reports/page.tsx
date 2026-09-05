"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
} from "lucide-react";
import { useReportTypes, useReportPreview, useStateAnalytics } from "@/lib/hooks/useAnalytics";
import { ReportFilterRequest } from "@/lib/types/analytics";

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>("NATIONAL_ACQUISITION_PROGRESS");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

  const { data: reportTypes, isLoading: loadingTypes } = useReportTypes();
  const { data: states } = useStateAnalytics();

  const previewPayload: ReportFilterRequest = {
    report_type: selectedReportType,
    state_id: selectedState || undefined,
    status: selectedStatus || undefined,
    page: page,
    page_size: 25,
  };

  const { data: preview, isLoading: loadingPreview, refetch: refetchPreview } = useReportPreview(previewPayload);

  const activeReportInfo = reportTypes?.find((r) => r.code === selectedReportType);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("nlams_auth_token") : null;
      const res = await fetch("http://localhost:8000/api/v1/reports/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(previewPayload),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NLAMS_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to export PDF report. Please ensure the backend server is running.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("nlams_auth_token") : null;
      const res = await fetch("http://localhost:8000/api/v1/reports/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(previewPayload),
      });

      if (!res.ok) throw new Error("Excel generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NLAMS_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel download error:", err);
      alert("Failed to export Excel report. Please ensure the backend server is running.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  STATUTORY MIS REPORT CENTER
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {preview?.scope_jurisdiction || "All India"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-teal-600" />
                Statutory MIS Reports & Document Exports
              </h1>
            </div>

            {/* Export Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                {downloadingPdf ? "Generating PDF..." : "Export Official PDF"}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={downloadingExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {downloadingExcel ? "Generating Excel..." : "Export Excel (.xlsx)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* 2. Report Selector Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Statutory MIS Report Template (7 Standard Reports)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {reportTypes?.map((rep) => (
              <button
                key={rep.code}
                onClick={() => {
                  setSelectedReportType(rep.code);
                  setPage(1);
                }}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  selectedReportType === rep.code
                    ? "bg-teal-50/80 border-teal-600 shadow-sm ring-1 ring-teal-600"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                    {rep.category.replace("_", " ")}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-2">{rep.title}</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{rep.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Filter Parameters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="">All States</option>
                {states?.map((st) => (
                  <option key={st.state_id} value={st.state_id}>
                    {st.state_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
              <span className="text-xs text-slate-500">Stage:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="">All Stages</option>
                <option value="SECTION_11">Section 11</option>
                <option value="SECTION_19">Section 19</option>
                <option value="COMPENSATION">Compensation</option>
                <option value="SECTION_23">Section 23 Award</option>
                <option value="COMPLETION">Completed</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => refetchPreview()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Preview Data
          </button>
        </div>

        {/* 4. Live Interactive Report Preview Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Header Metadata Block */}
          <div className="pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  Official Statutory Report Preview
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{preview?.report_title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jurisdiction Scope: <strong>{preview?.scope_jurisdiction}</strong> &nbsp;|&nbsp; Generated: {preview?.generated_at}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  Total Records: {preview?.total_records || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Summary KPIs Row */}
          {preview?.summary_kpis && preview.summary_kpis.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {preview.summary_kpis.map((kpi, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <p className="text-2xl font-bold text-teal-700 mt-1">{kpi.value}</p>
                  {kpi.subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{kpi.subtitle}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Tabular Records */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-teal-700 text-white font-semibold text-xs">
                  {preview?.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3.5 py-2.5 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview?.rows && preview.rows.length > 0 ? (
                  preview.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition text-xs">
                      {preview.columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3.5 py-2.5 ${
                            col.align === "right"
                              ? "text-right font-medium"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={preview?.columns.length || 5}
                      className="px-4 py-8 text-center text-xs text-slate-500"
                    >
                      No records match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {preview && preview.total_pages > 1 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {preview.page} of {preview.total_pages} ({preview.total_records} total records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={preview.page <= 1}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-slate-900">{preview.page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(preview.total_pages, p + 1))}
                  disabled={preview.page >= preview.total_pages}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
