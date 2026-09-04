"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { HealthCheckData } from "@/lib/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Database, Server, Globe } from "lucide-react";

export default function HomePage() {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkConnectivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<HealthCheckData>("/api/health");
      setHealth(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(`API Error [${err.code}]: ${err.message}`);
      } else if (err instanceof Error) {
        setError(`Connection Error: ${err.message}`);
      } else {
        setError("Unable to connect to backend server.");
      }
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          System Foundation & Integration Check
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Phase 1 Technical Verification • Frontend to Backend Health Check
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Connectivity Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Backend Status</CardTitle>
              <Server className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="outline" className="text-slate-600">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Pinging...
                </Badge>
              ) : health ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  API Online (200 OK)
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Disconnected
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Target: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/api/health</code>
            </p>
          </CardContent>
        </Card>

        {/* Database Connectivity Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Database Engine</CardTitle>
              <Database className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="outline">Checking...</Badge>
              ) : health?.database_status.startsWith("connected") ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected (Async)
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {health ? "Database Unreachable" : "Awaiting API"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Driver: SQLAlchemy 2.0 Async
            </p>
          </CardContent>
        </Card>

        {/* Environment Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Environment</CardTitle>
              <Globe className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize">
              {health?.environment || "Development"}
            </Badge>
            <p className="text-xs text-slate-500 mt-2">
              Next.js 14 App Router + FastAPI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Response Inspector */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-700" />
                Live Health Check Telemetry
              </CardTitle>
              <CardDescription>
                Raw telemetry payload returned by the FastAPI health check endpoint.
              </CardDescription>
            </div>
            <button
              onClick={checkConnectivity}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Re-test Connection
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Connection Failure
              </div>
              <p className="mt-1 text-xs">{error}</p>
              <p className="mt-2 text-xs text-slate-600">
                Ensure the FastAPI backend is running via{" "}
                <code className="bg-red-100 px-1 py-0.5 rounded">uvicorn app.main:app --port 8000</code>.
              </p>
            </div>
          ) : health ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-100">
                  <span className="text-slate-500 block">Uptime</span>
                  <span className="font-semibold text-slate-900">{health.uptime_seconds}s</span>
                </div>
                <div className="p-2 rounded bg-slate-100">
                  <span className="text-slate-500 block">Version</span>
                  <span className="font-semibold text-slate-900">{health.version}</span>
                </div>
                <div className="p-2 rounded bg-slate-100">
                  <span className="text-slate-500 block">Database Status</span>
                  <span className="font-semibold text-emerald-700">{health.database_status}</span>
                </div>
                <div className="p-2 rounded bg-slate-100">
                  <span className="text-slate-500 block">Last Check</span>
                  <span className="font-semibold text-slate-900">{lastChecked || "Just now"}</span>
                </div>
              </div>
              <pre className="p-4 rounded-md bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              Connecting to backend service...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
