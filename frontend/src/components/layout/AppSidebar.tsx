"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { RoleCode } from "@/lib/types/auth";
import {
  LayoutDashboard,
  Building2,
  Layers,
  GitMerge,
  Calculator,
  Award,
  ShieldCheck,
  Home,
  FileText,
  MapPin,
  BarChart3,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle,
  CreditCard,
  Users,
  ShieldAlert,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  phaseBadge?: string;
  isReady: boolean;
  allowedRoles?: string[];
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Command Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isReady: true,
  },
  {
    id: "projects",
    label: "Project Management",
    href: "/projects",
    icon: Building2,
    isReady: true,
  },
  {
    id: "parcels",
    label: "Land Parcels & Cadastre",
    href: "/land-parcels",
    icon: Layers,
    isReady: true,
    allowedRoles: [
      RoleCode.CENTRAL_OFFICER,
      RoleCode.STATE_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.FIELD_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },
  {
    id: "workflow",
    label: "Acquisition Workflow",
    href: "/workflow",
    icon: GitMerge,
    isReady: true,
  },
  {
    id: "gis",
    label: "Interactive GIS Map",
    href: "/gis",
    icon: MapPin,
    isReady: true,
  },
  {
    id: "compensation",
    label: "Compensation Assessment",
    href: "/compensation",
    icon: Calculator,
    isReady: true,
  },
  {
    id: "awards",
    label: "Section 23/30 Awards",
    href: "/awards",
    icon: Award,
    isReady: true,
    allowedRoles: [
      RoleCode.CENTRAL_OFFICER,
      RoleCode.STATE_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },
  {
    id: "disbursements",
    label: "Disbursements (PFMS)",
    href: "/disbursements",
    icon: CreditCard,
    isReady: true,
    allowedRoles: [
      RoleCode.CENTRAL_OFFICER,
      RoleCode.STATE_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },
  {
    id: "possession",
    label: "Section 38 Possession",
    href: "/possession",
    icon: ShieldCheck,
    isReady: true,
  },
  {
    id: "randr",
    label: "R&R Schemes",
    href: "/r-and-r",
    icon: Home,
    isReady: true,
    allowedRoles: [
      RoleCode.CENTRAL_OFFICER,
      RoleCode.STATE_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.SOCIAL_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },
  {
    id: "affected-families",
    label: "Affected Families (PAFs)",
    href: "/affected-families",
    icon: Users,
    isReady: true,
    allowedRoles: [
      RoleCode.CENTRAL_OFFICER,
      RoleCode.STATE_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.SOCIAL_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },
  {
    id: "field",
    label: "Field Survey App",
    href: "/field",
    icon: CheckCircle,
    isReady: true,
    allowedRoles: [
      RoleCode.FIELD_OFFICER,
      RoleCode.DISTRICT_OFFICER,
      RoleCode.ADMIN,
      RoleCode.SUPER_ADMIN,
    ],
  },

  {
    id: "documents",
    label: "Document Vault",
    href: "/documents",
    icon: FileText,
    isReady: true,
  },
  {
    id: "integrations",
    label: "Integration Gateway",
    href: "/integrations",
    icon: Database,
    isReady: true,
  },
  {
    id: "master-data",
    label: "Master Taxonomy",
    href: "/master-data",
    icon: Layers,
    isReady: true,
  },
  {
    id: "analytics",
    label: "National Analytics",
    href: "/analytics",
    icon: BarChart3,
    isReady: true,
  },
  {
    id: "risk",
    label: "Predictive Risk AI",
    href: "/analytics/risk",
    icon: ShieldAlert,
    isReady: true,
  },
  {
    id: "reports",
    label: "Statutory MIS Reports",
    href: "/reports",
    icon: FileSpreadsheet,
    isReady: true,
  },
];

interface AppSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role_id;

  // Filter items based on user's authorized role
  const visibleItems = NAVIGATION_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!userRole) return false;
    return item.allowedRoles.includes(userRole);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Scope Pill */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                Active Portal
              </span>
              <p className="text-xs font-semibold text-white truncate max-w-[190px]">
                {user?.role_name || "Statutory Officer"}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          if (item.isReady) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#138808] text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={item.label}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!isCollapsed && isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white ml-auto" />
                )}
              </Link>
            );
          }

          // Future modules: Displayed clearly with Phase Roadmap badge
          return (
            <div
              key={item.id}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-xs font-normal text-slate-400 hover:bg-slate-800/50 transition-colors cursor-not-allowed`}
              title={`${item.label} — Scheduled for ${item.phaseBadge}`}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-400" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.phaseBadge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {item.phaseBadge}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Operational Telemetry Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>PostgreSQL 16 + PostGIS</span>
          </div>
          <p className="text-[10px] text-slate-500">
            RFCTLARR Statutory Engine • SIH 2026
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Laptop Permanent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="h-[calc(100vh-4.25rem)] sticky top-17">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-slate-900 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
