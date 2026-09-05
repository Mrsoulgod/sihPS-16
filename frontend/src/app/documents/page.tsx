"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  History,
  ShieldCheck,
  Upload,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Hash,
  Download,
  Eye,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/context/LanguageContext";

interface DocumentItem {
  id: string;
  project_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  version: number;
  is_current_version: boolean;
  version_notes?: string;
  parent_document_id?: string;
  created_at: string;
}

interface DocumentDetail extends DocumentItem {
  version_history: DocumentItem[];
}

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<DocumentItem[]>("/api/v1/documents/");
      setDocuments(res.data || []);
      if (res.data?.length && !selectedDoc) {
        loadDocDetail(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocDetail = async (id: string) => {
    try {
      const res = await apiClient<DocumentDetail>(`/api/v1/documents/${id}`);
      setSelectedDoc(res.data || null);
      setVerificationResult(null);
    } catch (err) {
      console.error("Failed to load document detail:", err);
    }
  };

  const verifyHash = async (id: string) => {
    try {
      setIsVerifying(id);
      const res = await apiClient<any>(`/api/v1/documents/${id}/verify-hash`, {
        method: "POST",
      });
      setVerificationResult(res.data);
    } catch (err) {
      console.error("Hash verification failed:", err);
    } finally {
      setIsVerifying(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Statutory Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Statutory Document Vault & Version Control
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Cryptographically Hashed Gazette Notifications, Survey Maps & Section 23 Award Declarations
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {t.refresh}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Document Repository ({documents.length})
          </h2>
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => loadDocDetail(doc.id)}
                  className={`cursor-pointer p-4 transition-colors ${
                    isSelected ? "bg-emerald-50/40 border-l-4 border-l-emerald-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {doc.document_type}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      v{doc.version} {doc.is_current_version ? "(Current)" : ""}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">
                    {doc.file_name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                    SHA: {doc.sha256_hash.substring(0, 16)}...
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 360° Version Detail & Cryptographic Verifier */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDoc ? (
            <>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {selectedDoc.document_type}
                    </span>
                    <h2 className="mt-2 text-base font-bold text-foreground">
                      {selectedDoc.file_name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => verifyHash(selectedDoc.id)}
                    disabled={isVerifying === selectedDoc.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isVerifying === selectedDoc.id ? "Verifying Hash..." : "Verify SHA-256 Hash"}
                  </button>
                </div>

                {/* Verification result banner */}
                {verificationResult && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                    <div>
                      <span className="font-bold">Cryptographic Integrity Verified: </span>
                      {verificationResult.integrity_status === "VERIFIED"
                        ? "The SHA-256 cryptographic signature matches statutory gazette records perfectly. Document has not been altered."
                        : "Hash mismatch detected."}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded border border-border bg-slate-50/50 p-2.5">
                    <span className="text-muted-foreground">Version</span>
                    <p className="font-bold text-slate-900">Version {selectedDoc.version}.0</p>
                  </div>
                  <div className="rounded border border-border bg-slate-50/50 p-2.5">
                    <span className="text-muted-foreground">File Size</span>
                    <p className="font-bold text-slate-900">{(selectedDoc.file_size_bytes / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="rounded border border-border bg-slate-50/50 p-2.5">
                    <span className="text-muted-foreground">MIME Type</span>
                    <p className="font-bold text-slate-900">{selectedDoc.mime_type}</p>
                  </div>
                  <div className="rounded border border-border bg-slate-50/50 p-2.5">
                    <span className="text-muted-foreground">Timestamp</span>
                    <p className="font-bold text-slate-900">{new Date(selectedDoc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400">
                  <div className="text-slate-500 text-[10px] mb-1">SHA-256 Digest</div>
                  <div className="break-all">{selectedDoc.sha256_hash}</div>
                </div>
              </div>

              {/* Version History Chain Timeline */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-primary" />
                  Audit Version History Chain ({selectedDoc.version_history?.length || 1} Revisions)
                </h3>
                <div className="space-y-3">
                  {selectedDoc.version_history?.map((ver, idx) => (
                    <div key={ver.id} className="flex items-start gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${ver.is_current_version ? "bg-emerald-600 ring-4 ring-emerald-100" : "bg-slate-400"}`} />
                        {idx < selectedDoc.version_history.length - 1 && (
                          <div className="w-0.5 h-10 bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 rounded border border-border p-3 bg-slate-50/60">
                        <div className="flex justify-between font-bold">
                          <span>Version {ver.version}.0 {ver.is_current_version ? "(Current Statutory Draft)" : "(Archived)"}</span>
                          <span className="text-muted-foreground font-normal">{new Date(ver.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-600 text-[11px]">
                          {ver.version_notes || "Initial statutory upload into NLAMS repository."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Select a statutory document from the list to view version history and verify hash.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
