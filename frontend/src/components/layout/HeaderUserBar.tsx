"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, Shield, MapPin } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeaderUserBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (pathname === "/login") return null;
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-[#138808] hover:bg-emerald-800 text-white text-xs font-semibold"
          onClick={() => router.push("/login")}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Active User Info */}
      <div className="hidden md:flex flex-col text-right">
        <span className="text-xs font-semibold text-slate-900 leading-none">{user.full_name}</span>
        <span className="text-[11px] text-slate-500">{user.designation}</span>
      </div>

      {/* Role Badge (Static Authenticated Identity) */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <Shield className="w-3.5 h-3.5 text-[#138808]" />
        <span>{user.role_name || user.role_id.replace("ROLE_", "")}</span>
      </div>

      {/* Logout Action Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs flex items-center gap-1"
        onClick={() => logout()}
        title="Sign out of current NLAMS session"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}
