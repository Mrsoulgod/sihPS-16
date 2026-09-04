"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, RefreshCw, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { code: "ROLE_CENTRAL_OFFICER", label: "Central Ministry", name: "Shri Rajesh Kumar" },
  { code: "ROLE_STATE_OFFICER", label: "State Officer", name: "Smt. Sunita Verma" },
  { code: "ROLE_DISTRICT_OFFICER", label: "District CALA", name: "Dr. Amit Sharma" },
  { code: "ROLE_PROJECT_AGENCY", label: "Project Agency", name: "Er. Vikram Singh" },
  { code: "ROLE_FIELD_OFFICER", label: "Field Surveyor", name: "Shri Ramesh Choudhary" },
  { code: "ROLE_ADMIN", label: "System Admin", name: "Administrator" },
];

export function HeaderUserBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, switchRole, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
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

      {/* Role Badge with Switcher Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          title="Click to switch role context (Demo Feature)"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>{user.role_name || user.role_id.replace("ROLE_", "")}</span>
          <ChevronDown className="w-3 h-3 text-emerald-700" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-slate-200 py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Switch Role Context (Demo)
            </div>
            {ROLES.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={async () => {
                  setDropdownOpen(false);
                  await switchRole(r.code);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  user.role_id === r.code ? "bg-emerald-50 text-emerald-900 font-semibold" : "text-slate-700"
                }`}
              >
                <div>
                  <div>{r.label}</div>
                  <div className="text-[10px] text-slate-400">{r.name}</div>
                </div>
                {user.role_id === r.code && (
                  <Badge variant="outline" className="text-[9px] bg-emerald-100 border-emerald-300 text-emerald-800">
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-slate-600 hover:text-red-700 hover:bg-red-50"
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
