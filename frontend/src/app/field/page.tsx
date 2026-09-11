"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FieldRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/field/tasks");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Loading Field Work Workspace...</p>
      </div>
    </div>
  );
}
