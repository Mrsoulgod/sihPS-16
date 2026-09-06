"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Building,
  Shield,
  MapPin,
  Landmark,
  UserCheck,
} from "lucide-react";
import { RoleCode } from "@/lib/types/auth";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const getJurisdictionDisplay = () => {
    if (!user) return "";
    if (user.jurisdiction?.scope_display) return user.jurisdiction.scope_display;
    if (user.district_name) return `${user.district_name}, ${user.state_name || ""}`;
    if (user.state_name) return user.state_name;
    if (user.role_id === RoleCode.CENTRAL_OFFICER || user.role_id === RoleCode.ADMIN || user.role_id === RoleCode.SUPER_ADMIN) {
      return "All India (National)";
    }
    return user.organization || "National Project Scope";
  };

  const getRoleBadgeStyle = (roleId?: string) => {
    switch (roleId) {
      case RoleCode.CENTRAL_OFFICER:
      case RoleCode.ADMIN:
      case RoleCode.SUPER_ADMIN:
        return "bg-amber-950 text-amber-300 border-amber-700/50";
      case RoleCode.STATE_OFFICER:
        return "bg-blue-950 text-blue-300 border-blue-700/50";
      case RoleCode.DISTRICT_OFFICER:
        return "bg-emerald-950 text-emerald-300 border-emerald-700/50";
      case RoleCode.PROJECT_AGENCY:
        return "bg-purple-950 text-purple-300 border-purple-700/50";
      case RoleCode.FIELD_OFFICER:
        return "bg-cyan-950 text-cyan-300 border-cyan-700/50";
      case RoleCode.SOCIAL_OFFICER:
        return "bg-rose-950 text-rose-300 border-rose-700/50";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B2545] text-white border-b border-slate-800 shadow-sm">
      {/* Institutional Top Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Branding */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded bg-[#138808] flex items-center justify-center text-white font-serif font-black text-lg shadow-inner ring-1 ring-white/20">
              NL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-wide text-white">
                  NLAMS
                </span>
                <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Govt. of India
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block truncate max-w-xs md:max-w-md">
                National Land Acquisition & Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search parcels, gazette notifications, awards, claims..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Language + Alerts + Authenticated Identity + Logout */}
        <div className="flex items-center gap-3">
          {/* Official Language Selector */}
          <LanguageSwitcher />

          {/* Statutory Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 relative focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              title="Statutory Alerts & Workflow Actions"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF9933] ring-2 ring-[#0B2545]" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 text-slate-900 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Operational Alerts</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">2 Action Required</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Direct Benefit Transfer Ready</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Batch ₹42.50 Cr authorized for Kotputli revenue villages.</p>
                    <span className="text-[10px] text-emerald-700 font-medium">Ready for disbursement</span>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Boundary Reconciliation Alert</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Gurugram Metro Extension: Municipal sync required.</p>
                    <span className="text-[10px] text-rose-700 font-medium">Delayed Stage</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Identity & Jurisdiction Chip */}
          {user && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700">
              <div className="h-8 w-8 rounded-full bg-emerald-800 border border-emerald-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {user.full_name}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeStyle(user.role_id)}`}>
                    {user.role_name || user.role_id.replace("ROLE_", "")}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-2.5 w-2.5 text-emerald-400 shrink-0 inline" />
                  <span className="truncate max-w-[160px] text-slate-300 font-medium">{getJurisdictionDisplay()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Explicit Sign Out Action */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-700/60 border border-slate-700 text-slate-300 hover:text-rose-200 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            title="Sign out of NLAMS session"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
