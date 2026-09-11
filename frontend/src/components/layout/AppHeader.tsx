"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications, SystemNotification, NotificationCategory } from "@/lib/context/NotificationContext";
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
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCheck,
  Trash2,
  Sparkles,
  ArrowRight,
  Layers,
  Send,
  FileText,
  DollarSign,
  Compass,
} from "lucide-react";
import { RoleCode } from "@/lib/types/auth";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    triggerDemoForwardAction,
  } = useNotifications();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ACTIONS" | "FINANCE">("ALL");
  const [justSimulated, setJustSimulated] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "STATUTORY_ACTION":
        return <FileText className="h-3.5 w-3.5 text-purple-600" />;
      case "PROJECT_PROPOSAL":
        return <Building className="h-3.5 w-3.5 text-[#138808]" />;
      case "FIELD_SURVEY":
        return <Compass className="h-3.5 w-3.5 text-blue-600" />;
      case "COMPENSATION_PFMS":
        return <DollarSign className="h-3.5 w-3.5 text-emerald-600" />;
      case "RR_ENTITLEMENT":
        return <Layers className="h-3.5 w-3.5 text-amber-600" />;
      case "RISK_ALERT":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-emerald-100 text-[#138808] border-emerald-200";
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "UNREAD") return !item.isRead;
    if (activeTab === "ACTIONS") {
      return item.category === "STATUTORY_ACTION" || item.category === "PROJECT_PROPOSAL";
    }
    if (activeTab === "FINANCE") {
      return item.category === "COMPENSATION_PFMS" || item.category === "FIELD_SURVEY";
    }
    return true;
  });

  const handleActionClick = (item: SystemNotification) => {
    markAsRead(item.id);
    setShowNotificationMenu(false);
    if (item.targetRoute) {
      router.push(item.targetRoute);
    }
  };

  const handleSimulate = () => {
    triggerDemoForwardAction();
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2000);
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
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#138808]"
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
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#138808]/40 focus:border-[#138808] transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Language + Alerts + Authenticated Identity + Logout */}
        <div className="flex items-center gap-3">
          {/* Official Language Selector */}
          <LanguageSwitcher />

          {/* Statutory Notifications Bell & Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative focus:outline-none focus:ring-2 focus:ring-[#138808] transition-colors"
              title="Statutory Alerts & Workflow Actions"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-[#FF9933] text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md ring-2 ring-[#0B2545]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 h-[18px] w-[18px] rounded-full bg-[#FF9933] animate-ping opacity-60 pointer-events-none" />
                </>
              )}
            </button>

            {/* Rich Notification Drawer */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-96 sm:w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 text-slate-900 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-50 text-[#138808] flex items-center justify-center">
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Statutory Notifications</h4>
                      <p className="text-[10px] text-slate-500">Cross-Authority Workflow & Dispatch Events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center gap-1 transition"
                        title="Mark all notifications as read"
                      >
                        <CheckCheck className="h-3 w-3 text-[#138808]" />
                        <span>Read All</span>
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Clear all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 pt-2.5 pb-2 flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => setActiveTab("ALL")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                      activeTab === "ALL"
                        ? "bg-[#138808] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("UNREAD")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition flex items-center gap-1 ${
                      activeTab === "UNREAD"
                        ? "bg-[#138808] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${activeTab === "UNREAD" ? "bg-white text-[#138808]" : "bg-amber-100 text-amber-800"}`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("ACTIONS")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                      activeTab === "ACTIONS"
                        ? "bg-[#138808] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Actions & Proposals
                  </button>
                  <button
                    onClick={() => setActiveTab("FINANCE")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                      activeTab === "FINANCE"
                        ? "bg-[#138808] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Finance & Survey
                  </button>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                      <p className="font-semibold text-slate-600 text-xs">No notifications in this view</p>
                      <p className="text-[11px] text-slate-400">All workflow events have been addressed.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 transition-colors relative group ${
                          !item.isRead ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                            {getCategoryIcon(item.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider ${getSeverityBadge(item.severity)}`}>
                                  {item.severity}
                                </span>
                                {item.projectCode && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                                    {item.projectCode}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h5 className={`text-xs font-bold leading-snug ${!item.isRead ? "text-slate-900" : "text-slate-700"}`}>
                              {item.title}
                            </h5>

                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                              {item.message}
                            </p>

                            {item.sourceAuthority && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                <Send className="h-2.5 w-2.5 text-[#138808]" />
                                <span>Forwarded by: <strong className="text-slate-700 font-semibold">{item.sourceAuthority}</strong></span>
                              </div>
                            )}

                            {item.actionRequired && (
                              <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-medium leading-tight">
                                <strong className="font-bold">Next Statutory Step:</strong> {item.actionRequired}
                              </div>
                            )}

                            {/* Action CTA and Dismiss */}
                            <div className="mt-2.5 flex items-center justify-between pt-1">
                              <button
                                onClick={() => handleActionClick(item)}
                                className="px-2.5 py-1 rounded-lg bg-[#138808] hover:bg-[#0f6c06] text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs"
                              >
                                <span>Take Action</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>

                              <button
                                onClick={() => markAsRead(item.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 font-medium"
                              >
                                {item.isRead ? "Read" : "Mark as read"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Toolbar: Real-Time Cross Authority Simulation */}
                <div className="px-4 pt-3 pb-1 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Live Statutory Pub/Sub Hub</span>
                  <button
                    type="button"
                    onClick={handleSimulate}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] flex items-center gap-1.5 transition shadow-2xs"
                    title="Simulate action forwarded by another authority"
                  >
                    <Sparkles className={`h-3 w-3 text-amber-400 ${justSimulated ? "animate-spin" : ""}`} />
                    <span>{justSimulated ? "Action Dispatched!" : "Simulate Authority Forward"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Identity & Jurisdiction Chip */}
          {user && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700">
              <div className="h-8 w-8 rounded-full bg-[#138808] border border-emerald-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
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

          {/* Switch Authority / Portal */}
          <Link
            href="/login"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-950/80 hover:border-emerald-700/60 border border-slate-700 text-slate-300 hover:text-emerald-200 text-xs font-semibold transition-all"
            title="Switch Central/State/District Portal"
          >
            <Building className="h-3.5 w-3.5 text-[#138808]" />
            <span>Switch Portal</span>
          </Link>

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
