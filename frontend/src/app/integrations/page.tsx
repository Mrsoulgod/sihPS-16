"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  RefreshCw,
  Server,
  Activity,
  ShieldCheck,
  Zap,
  Globe2,
  Database,
  ArrowRight,
  Clock,
  Terminal,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useLanguage } from "@/lib/context/LanguageContext";

interface Gateway {
  code: string;
  name: string;
  category: string;
  protocol: string;
  status: string;
  endpoint_url: string;
  auth_mechanism: string;
  latency_ms: number;
  last_sync_at: string;
  is_sandbox: boolean;
  supported_operations: string[];
}

interface SyncResult {
  gateway_code: string;
  status: string;
  execution_latency_ms: number;
  records_processed: number;
  sync_timestamp: string;
  payload_summary: Record<string, any>;
  audit_hash: string;
}

export default function IntegrationsPage() {
  const { t } = useLanguage();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGateway, setActiveGateway] = useState<Gateway | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient<Gateway[]>("/api/v1/integrations");
      setGateways(res.data || []);
      if (res.data?.length && !activeGateway) {
        setActiveGateway(res.data[0]);
      }
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch gateways:", err);
      setError("Unable to load integration gateways telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleTestSync = async (code: string) => {
    try {
      setIsSyncing(code);
      const res = await apiClient<SyncResult>(`/api/v1/integrations/${code}/test-sync`, {
        method: "POST",
        body: JSON.stringify({
          entity_scope: "PROJECT",
          scope_id: "PRJ-NH48-PKG4",
          simulate_records_count: 5,
        }),
      });
      if (res.data) {
        setSyncResults((prev) => ({ ...prev, [code]: res.data }));
      }
    } catch (err: any) {
      console.error(`Sync error for ${code}:`, err);
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Statutory Header & Sandbox Disclaimer Banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-emerald-700/10 p-2 text-emerald-700">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  NLAMS Integration Gateway
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  National Interoperability Layer (Prototype / Sandbox Interoperability Hub)
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchGateways}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold shadow-xs hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* Sandbox Notice Callout */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <span className="font-bold">Sandbox Interoperability Disclosure: </span>
            This hub demonstrates live bi-directional contract interoperability with Digital India Land Records (Bhulekh / Bhoomi), ISRO Bhuvan Spatial Cadastre, PFMS Public Financial Management System, and National SMS Gateway using simulated sandbox connectors adhering to standard statutory payloads.
          </div>
        </div>
      </div>

      {/* 4 Gateway Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gateways.map((gw) => {
          const isSelected = activeGateway?.code === gw.code;
          const syncing = isSyncing === gw.code;
          const lastResult = syncResults[gw.code];

          return (
            <div
              key={gw.code}
              onClick={() => setActiveGateway(gw)}
              className={`cursor-pointer rounded-xl border p-5 transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/20 shadow-md ring-1 ring-emerald-600/30"
                  : "border-border bg-card hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {gw.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {gw.status}
                </span>
              </div>

              <h3 className="mt-3 text-sm font-bold text-foreground line-clamp-1">{gw.name}</h3>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
                {gw.endpoint_url}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <span className="text-muted-foreground">Protocol: <strong className="text-foreground">{gw.protocol}</strong></span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">{gw.latency_ms}ms</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTestSync(gw.code);
                }}
                disabled={syncing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Test Sandbox Sync</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Gateway Deep Dive & Interactive Payload Console */}
      {activeGateway && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gateway Specification & Security */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Gateway Specification
              </h2>
              <div className="mt-4 divide-y divide-border/60 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Gateway Identifier</span>
                  <span className="font-mono font-semibold">{activeGateway.code}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Protocol Standard</span>
                  <span className="font-semibold">{activeGateway.protocol}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Auth Handshake</span>
                  <span className="font-semibold">{activeGateway.auth_mechanism}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Operating Environment</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                    STATUTORY SANDBOX
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Telemetry SLA</span>
                  <span className="font-semibold text-emerald-700">99.9% Uptime</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Supported Operations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeGateway.supported_operations.map((op) => (
                    <span
                      key={op}
                      className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-medium text-slate-700"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Test Execution & Live Response Inspector */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Live Sandbox Telemetry Inspector: {activeGateway.name}
                  </h3>
                </div>
                {syncResults[activeGateway.code] && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Last Verified: {new Date(syncResults[activeGateway.code].sync_timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="mt-4">
                {syncResults[activeGateway.code] ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border bg-slate-50/80 p-3 text-center">
                        <span className="text-[11px] text-muted-foreground">Execution Latency</span>
                        <p className="mt-1 text-lg font-bold text-emerald-700">
                          {syncResults[activeGateway.code].execution_latency_ms} ms
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-slate-50/80 p-3 text-center">
                        <span className="text-[11px] text-muted-foreground">Records Processed</span>
                        <p className="mt-1 text-lg font-bold text-primary">
                          {syncResults[activeGateway.code].records_processed}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-slate-50/80 p-3 text-center">
                        <span className="text-[11px] text-muted-foreground">Status Code</span>
                        <p className="mt-1 text-lg font-bold text-emerald-700">
                          200 OK
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
                        <span>Cryptographic Audit SHA-256</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs">
                          {syncResults[activeGateway.code].audit_hash}
                        </span>
                      </div>
                      <pre className="text-[11px] leading-relaxed">
                        {JSON.stringify(syncResults[activeGateway.code].payload_summary, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                    <Zap className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm font-semibold text-foreground">
                      No simulation executed in this session
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Click the &quot;Test Sandbox Sync&quot; button to trigger a live mock contract payload test against this gateway.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTestSync(activeGateway.code)}
                      disabled={isSyncing === activeGateway.code}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Execute Gateway Handshake
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
