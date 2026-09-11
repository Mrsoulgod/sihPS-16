"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ActionWorkspace } from "@/components/action-center/ActionWorkspace";
import { getActionWorkspace } from "@/lib/api/action_center";
import { ActionWorkspaceResponse } from "@/lib/types/action_center";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ActionWorkspaceDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const [data, setData] = useState<ActionWorkspaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWorkspace = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await getActionWorkspace(taskId);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load Action Workspace:", err);
      setErrorMsg(
        err?.response?.data?.detail || err?.message || "Failed to load Action Workspace."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchWorkspace();
    }
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          Unable to Load Action Workspace
        </h2>
        <p className="text-xs text-slate-600">
          {errorMsg || "Action item not found or you lack statutory authorization."}
        </p>
        <button
          type="button"
          onClick={fetchWorkspace}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#138808] text-white font-bold text-xs shadow hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return <ActionWorkspace data={data} onRefresh={fetchWorkspace} />;
}
