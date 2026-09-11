"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFieldTaskDetail } from "@/lib/api/field";
import { FieldVerificationDetail } from "@/lib/types/field";
import { FieldVerificationWizard } from "@/components/field/FieldVerificationWizard";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";

export default function FieldTaskWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;

  const [taskDetail, setTaskDetail] = useState<FieldVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchFieldTaskDetail(taskId);
      setTaskDetail(data);
    } catch (err: any) {
      console.error("Failed to load task workspace:", err);
      setError(err.message || "Failed to load field task details from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !taskDetail) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-xl border border-rose-200 text-center shadow-xs">
        <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 mt-3">Unable to Load Field Task</h2>
        <p className="text-xs text-slate-500 mt-1">{error || "Task not found or access denied."}</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Link
            href="/field/tasks"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Tasks</span>
          </Link>
          <button
            type="button"
            onClick={loadTask}
            className="px-4 py-2 bg-[#138808] hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return <FieldVerificationWizard initialData={taskDetail} onRefresh={loadTask} />;
}
