"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <div className="h-10 w-10 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-serif font-bold text-lg shadow-md ring-2 ring-emerald-600 animate-pulse">
          NL
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
          <span>Navigating to National Land Acquisition Command Portal...</span>
        </div>
      </div>
    </div>
  );
}
