"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building,
  Shield,
  MapPin,
  Landmark,
} from "lucide-react";
import { RoleCode } from "@/lib/types/auth";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const DEMO_ROLES = [
  { id: RoleCode.CENTRAL_OFFICER, label: "Central Officer", desc: "National Ministry Pipeline" },
  { id: RoleCode.STATE_OFFICER, label: "State Officer", desc: "Rajasthan Revenue Dept" },
  { id: RoleCode.DISTRICT_OFFICER, label: "District Collector / CALA", desc: "Jaipur Land Authority" },
  { id: RoleCode.PROJECT_AGENCY, label: "Implementing Agency", desc: "NHAI Project Director" },
  { id: RoleCode.FIELD_OFFICER, label: "Field Surveyor", desc: "Kotputli Revenue Inspector" },
  { id: RoleCode.ADMIN, label: "System Administrator", desc: "Global Security & Audit" },
];

export function AppHeader({ onToggleSidebar, isSidebarOpen }: AppHeaderProps) {
  const { user, logout, switchRole } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const handleRoleSelect = async (targetRole: string) => {
    try {
      setIsSwitching(true);
      setShowRoleMenu(false);
      await switchRole(targetRole);
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getJurisdictionDisplay = () => {
    if (!user) return "";
    if (user.district_name) return `${user.district_name}, ${user.state_name || ""}`;
    if (user.state_name) return user.state_name;
    if (user.role_id === RoleCode.CENTRAL_OFFICER || user.role_id === RoleCode.ADMIN) return "All India (National)";
    return user.organization || "National Project Scope";
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
              placeholder="Search Project, Khasra, Gazette No., Village... (Ctrl+K)"
              className="w-full pl-9 pr-12 py-1.5 bg-slate-900/60 border border-slate-700 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Notifications, Role Switcher, User Chip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Statutory Alerts Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-[#0B2545]" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-900">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Statutory Alerts
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                    3 Pending
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">Section 15 Hearing Scheduled</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">NH-48 Package IV: 2 objections pending before CALA Jaipur.</p>
                    <span className="text-[10px] text-amber-700 font-medium">Due in 4 days</span>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-900">PFMS DBT Compensation Batch</p>
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

          {/* Evaluator 1-Click Role Switcher */}
          <div className="relative">
            <button
              type="button"
              disabled={isSwitching}
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors focus:outline-none"
              title="Evaluator Role Switcher: Click to test other user personas"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-medium">
                {isSwitching ? "Switching..." : "Role Switcher"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-900">
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                  <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wider">
                    Evaluator Role Switcher
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Select a role to re-scope the dashboard instantly
                  </p>
                </div>
                <div className="py-1">
                  {DEMO_ROLES.map((role) => {
                    const isCurrent = user?.role_id === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between transition-colors ${
                          isCurrent
                            ? "bg-emerald-50 text-emerald-950 font-semibold"
                            : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {role.desc}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Jurisdiction Chip */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="h-8 w-8 rounded-full bg-emerald-800 border border-emerald-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-emerald-400 inline" />
                  <span className="truncate max-w-[130px]">{getJurisdictionDisplay()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logout Action */}
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            title="Sign out of NLAMS"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
