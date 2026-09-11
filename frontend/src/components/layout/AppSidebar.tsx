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
  Compass,
  Map,
  FilePlus,
  CheckSquare,
  FileCheck,
} from "lucide-react";

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  phaseBadge?: string;
  isReady: boolean;
  allowedRoles?: string[];
}

// Canonical Central Officer navigation groups
const CENTRAL_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "cmd-dashboard",
        label: "Command Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "cmd-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "NATIONAL OVERSIGHT",
    items: [
      {
        id: "cmd-projects",
        label: "Projects",
        href: "/projects",
        icon: Building2,
        isReady: true,
      },
      {
        id: "cmd-states",
        label: "States",
        href: "/analytics",
        icon: Layers,
        isReady: true,
      },
      {
        id: "cmd-districts",
        label: "District Performance",
        href: "/analytics",
        icon: MapPin,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "LAND & GIS",
    items: [
      {
        id: "cmd-gis",
        label: "National GIS",
        href: "/gis",
        icon: Compass,
        isReady: true,
      },
      {
        id: "cmd-parcels",
        label: "Land Parcels",
        href: "/land-parcels",
        icon: Map,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "ACQUISITION",
    items: [
      {
        id: "cmd-workflow",
        label: "Workflow",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "cmd-compensation",
        label: "Compensation",
        href: "/compensation",
        icon: Calculator,
        isReady: true,
      },
      {
        id: "cmd-awards",
        label: "Awards",
        href: "/awards",
        icon: Award,
        isReady: true,
      },
      {
        id: "cmd-disbursement",
        label: "Disbursement",
        href: "/disbursements",
        icon: CreditCard,
        isReady: true,
      },
      {
        id: "cmd-possession",
        label: "Possession",
        href: "/possession",
        icon: ShieldCheck,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "R&R",
    items: [
      {
        id: "cmd-pafs",
        label: "Affected Families",
        href: "/affected-families",
        icon: Users,
        isReady: true,
      },
      {
        id: "cmd-randr-schemes",
        label: "R&R Schemes",
        href: "/r-and-r",
        icon: Home,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "INTELLIGENCE",
    items: [
      {
        id: "cmd-analytics",
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        isReady: true,
      },
      {
        id: "cmd-risk",
        label: "Risk Intelligence",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "REPORTS",
    items: [
      {
        id: "cmd-mis",
        label: "Acquisition MIS",
        href: "/reports",
        icon: FileSpreadsheet,
        isReady: true,
      },
      {
        id: "cmd-exec-reports",
        label: "Executive Reports",
        href: "/reports",
        icon: FileText,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "SYSTEM",
    items: [
      {
        id: "cmd-documents",
        label: "Documents",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
      {
        id: "cmd-integrations",
        label: "Integrations",
        href: "/integrations",
        icon: Database,
        isReady: true,
      },
    ],
  },
];

// Canonical State Officer navigation groups (Phase 11C)
const STATE_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "state-dashboard",
        label: "State Control Center",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "state-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "STATE OVERSIGHT",
    items: [
      {
        id: "state-projects",
        label: "Projects",
        href: "/projects",
        icon: Building2,
        isReady: true,
      },
      {
        id: "state-districts",
        label: "Districts",
        href: "/analytics",
        icon: Layers,
        isReady: true,
      },
      {
        id: "state-dist-perf",
        label: "District Performance",
        href: "/analytics",
        icon: MapPin,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "LAND & GIS",
    items: [
      {
        id: "state-gis",
        label: "State GIS",
        href: "/gis",
        icon: Compass,
        isReady: true,
      },
      {
        id: "state-parcels",
        label: "Land Parcels",
        href: "/land-parcels",
        icon: Map,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "ACQUISITION",
    items: [
      {
        id: "state-workflow",
        label: "Workflow",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "state-compensation",
        label: "Compensation",
        href: "/compensation",
        icon: Calculator,
        isReady: true,
      },
      {
        id: "state-awards",
        label: "Awards",
        href: "/awards",
        icon: Award,
        isReady: true,
      },
      {
        id: "state-disbursement",
        label: "Disbursement",
        href: "/disbursements",
        icon: CreditCard,
        isReady: true,
      },
      {
        id: "state-possession",
        label: "Possession",
        href: "/possession",
        icon: ShieldCheck,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "R&R",
    items: [
      {
        id: "state-pafs",
        label: "Affected Families",
        href: "/affected-families",
        icon: Users,
        isReady: true,
      },
      {
        id: "state-randr-schemes",
        label: "R&R Schemes",
        href: "/r-and-r",
        icon: Home,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "INTELLIGENCE",
    items: [
      {
        id: "state-analytics",
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        isReady: true,
      },
      {
        id: "state-risk",
        label: "Risk Intelligence",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "REPORTS",
    items: [
      {
        id: "state-mis",
        label: "State Acquisition Report",
        href: "/reports",
        icon: FileSpreadsheet,
        isReady: true,
      },
      {
        id: "state-exec-reports",
        label: "Executive Reports",
        href: "/reports",
        icon: FileText,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "SYSTEM",
    items: [
      {
        id: "state-documents",
        label: "Documents",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
    ],
  },
];

// Canonical District / CALA Officer navigation groups (Phase 11D)
const DISTRICT_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "dist-dashboard",
        label: "District Command",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "dist-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "MY WORK",
    items: [
      {
        id: "dist-tasks",
        label: "My Tasks",
        href: "/workflow",
        icon: CheckCircle,
        isReady: true,
      },
      {
        id: "dist-pending-actions",
        label: "Pending Actions",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "dist-escalations",
        label: "Escalations",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "PROJECTS",
    items: [
      {
        id: "dist-projects",
        label: "District Projects",
        href: "/projects",
        icon: Building2,
        isReady: true,
      },
      {
        id: "dist-proposals",
        label: "Project Proposals",
        href: "/projects",
        icon: FileText,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "LAND & GIS",
    items: [
      {
        id: "dist-parcels",
        label: "Land Parcels",
        href: "/land-parcels",
        icon: Map,
        isReady: true,
      },
      {
        id: "dist-gis",
        label: "District GIS",
        href: "/gis",
        icon: Compass,
        isReady: true,
      },
      {
        id: "dist-field",
        label: "Field Verification",
        href: "/field",
        icon: CheckCircle,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "ACQUISITION",
    items: [
      {
        id: "dist-workflow",
        label: "Workflow",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "dist-objections",
        label: "Objections & Claims",
        href: "/workflow",
        icon: ShieldCheck,
        isReady: true,
      },
      {
        id: "dist-compensation",
        label: "Compensation",
        href: "/compensation",
        icon: Calculator,
        isReady: true,
      },
      {
        id: "dist-awards",
        label: "Awards",
        href: "/awards",
        icon: Award,
        isReady: true,
      },
      {
        id: "dist-disbursement",
        label: "Disbursement",
        href: "/disbursements",
        icon: CreditCard,
        isReady: true,
      },
      {
        id: "dist-possession",
        label: "Possession",
        href: "/possession",
        icon: ShieldCheck,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "R&R",
    items: [
      {
        id: "dist-pafs",
        label: "Affected Families",
        href: "/affected-families",
        icon: Users,
        isReady: true,
      },
      {
        id: "dist-randr-schemes",
        label: "R&R Schemes",
        href: "/r-and-r",
        icon: Home,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "INTELLIGENCE",
    items: [
      {
        id: "dist-analytics",
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        isReady: true,
      },
      {
        id: "dist-risk",
        label: "Risk Intelligence",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "DOCUMENTS",
    items: [
      {
        id: "dist-documents",
        label: "Documents",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
    ],
  },
];

// Phase 11E: Project Implementing Agency Navigation (Section 18)
const PROJECT_AGENCY_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "agency-dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "agency-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "PROJECTS",
    items: [
      {
        id: "agency-my-projects",
        label: "My Projects",
        href: "/projects",
        icon: Building2,
        isReady: true,
      },
      {
        id: "agency-new-project",
        label: "New Project Proposal",
        href: "/projects/new",
        icon: FilePlus,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "PROJECT DEVELOPMENT",
    items: [
      {
        id: "agency-land-req",
        label: "Land Requirement",
        href: "/land-parcels",
        icon: Layers,
        isReady: true,
      },
      {
        id: "agency-alignment",
        label: "Project Alignment",
        href: "/gis",
        icon: MapPin,
        isReady: true,
      },
      {
        id: "agency-documents",
        label: "Documents",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "ACQUISITION",
    items: [
      {
        id: "agency-workflow",
        label: "Workflow",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "agency-parcels",
        label: "Land Parcels",
        href: "/land-parcels",
        icon: Map,
        isReady: true,
      },
      {
        id: "agency-compensation",
        label: "Compensation",
        href: "/compensation",
        icon: Calculator,
        isReady: true,
      },
      {
        id: "agency-possession",
        label: "Possession",
        href: "/possession",
        icon: ShieldCheck,
        isReady: true,
      },
      {
        id: "agency-randr",
        label: "R&R",
        href: "/r-and-r",
        icon: Home,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "MY WORK",
    items: [
      {
        id: "agency-actions",
        label: "My Actions",
        href: "/dashboard",
        icon: CheckCircle,
        isReady: true,
      },
      {
        id: "agency-rework",
        label: "Rework Requests",
        href: "/workflow",
        icon: GitMerge,
        isReady: true,
      },
      {
        id: "agency-doc-requests",
        label: "Document Requests",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
      {
        id: "agency-survey-requests",
        label: "Survey Requests",
        href: "/workflow",
        icon: Compass,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "INTELLIGENCE",
    items: [
      {
        id: "agency-risk",
        label: "Project Risk",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "REPORTS",
    items: [
      {
        id: "agency-reports",
        label: "Project Reports",
        href: "/reports",
        icon: FileSpreadsheet,
        isReady: true,
      },
    ],
  },
];

// Phase 11F: Field Officer Navigation (Section 4)
const FIELD_OFFICER_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "MY FIELD WORK",
    items: [
      {
        id: "field-dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "field-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
      {
        id: "field-tasks",
        label: "My Tasks",
        href: "/field/tasks",
        icon: CheckCircle,
        isReady: true,
      },
      {
        id: "field-parcels",
        label: "Assigned Parcels",
        href: "/field/parcels",
        icon: Map,
        isReady: true,
      },
      {
        id: "field-verification",
        label: "Field Verification",
        href: "/field/tasks",
        icon: Compass,
        isReady: true,
      },
      {
        id: "field-submitted",
        label: "Submitted Work",
        href: "/field/tasks?status=SUBMITTED",
        icon: FileText,
        isReady: true,
      },
    ],
  },
];

// Canonical Social / R&R Officer navigation groups (Phase 11G)
const SOCIAL_OFFICER_NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "social-dashboard",
        label: "R&R Case Management",
        href: "/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
      {
        id: "social-action-centre",
        label: "Action Centre",
        href: "/action-centre",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "R&R CASES",
    items: [
      {
        id: "social-pafs",
        label: "Affected Families",
        href: "/affected-families",
        icon: Users,
        isReady: true,
      },
      {
        id: "social-actions",
        label: "My R&R Actions",
        href: "/dashboard",
        icon: CheckSquare,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "CASE MANAGEMENT",
    items: [
      {
        id: "social-surveys",
        label: "Surveys",
        href: "/affected-families",
        icon: Compass,
        isReady: true,
      },
      {
        id: "social-eligibility",
        label: "Eligibility",
        href: "/r-and-r/eligibility",
        icon: FileCheck,
        isReady: true,
      },
      {
        id: "social-entitlements",
        label: "Entitlements",
        href: "/r-and-r/entitlements",
        icon: Calculator,
        isReady: true,
      },
      {
        id: "social-allotments",
        label: "Allotments",
        href: "/r-and-r/allotments",
        icon: Award,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "R&R PROGRAMS",
    items: [
      {
        id: "social-schemes",
        label: "R&R Schemes",
        href: "/r-and-r",
        icon: Home,
        isReady: true,
      },
      {
        id: "social-projects",
        label: "Project R&R",
        href: "/projects",
        icon: Building2,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "INTELLIGENCE",
    items: [
      {
        id: "social-risk",
        label: "R&R Risk",
        href: "/analytics/risk",
        icon: ShieldAlert,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "DOCUMENTS",
    items: [
      {
        id: "social-documents",
        label: "R&R Documents",
        href: "/documents",
        icon: FileText,
        isReady: true,
      },
    ],
  },
  {
    groupTitle: "REPORTS",
    items: [
      {
        id: "social-reports",
        label: "R&R Reports",
        href: "/reports",
        icon: FileSpreadsheet,
        isReady: true,
      },
    ],
  },
];

// Fallback general navigation for operational roles
const GENERAL_NAV_ITEMS: NavItem[] = [
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
  },
  {
    id: "disbursements",
    label: "Disbursements (PFMS)",
    href: "/disbursements",
    icon: CreditCard,
    isReady: true,
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
  },
  {
    id: "affected-families",
    label: "Affected Families (PAFs)",
    href: "/affected-families",
    icon: Users,
    isReady: true,
  },
  {
    id: "field",
    label: "Field Survey App",
    href: "/field",
    icon: CheckCircle,
    isReady: true,
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

  const isCentralOrAdmin =
    userRole === RoleCode.CENTRAL_OFFICER ||
    userRole === RoleCode.ADMIN ||
    userRole === RoleCode.SUPER_ADMIN;

  const isStateOfficer = userRole === RoleCode.STATE_OFFICER;
  const isDistrictOfficer = userRole === RoleCode.DISTRICT_OFFICER;
  const isProjectAgency = userRole === RoleCode.PROJECT_AGENCY;
  const isFieldOfficer = userRole === RoleCode.FIELD_OFFICER;
  const isSocialOfficer = userRole === RoleCode.SOCIAL_OFFICER;

  const activeNavGroups = isCentralOrAdmin
    ? CENTRAL_NAV_GROUPS
    : isStateOfficer
    ? STATE_NAV_GROUPS
    : isDistrictOfficer
    ? DISTRICT_NAV_GROUPS
    : isProjectAgency
    ? PROJECT_AGENCY_NAV_GROUPS
    : isFieldOfficer
    ? FIELD_OFFICER_NAV_GROUPS
    : isSocialOfficer
    ? SOCIAL_OFFICER_NAV_GROUPS
    : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Scope Pill */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                {isCentralOrAdmin
                  ? "National Command"
                  : isStateOfficer
                  ? "State Control"
                  : isDistrictOfficer
                  ? "District / CALA Command"
                  : isProjectAgency
                  ? "Agency Control Center"
                  : isFieldOfficer
                  ? "Field Operations"
                  : isSocialOfficer
                  ? "R&R / Social Operations"
                  : "Active Authority"}
              </span>
              <p className="text-xs font-semibold text-white truncate max-w-[190px]">
                {user?.organization ? `${user.organization} (Agency)` : user?.role_name || "Statutory Authority"}
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
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {activeNavGroups ? (
          // Grouped Role Navigation (Central / State)
          activeNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {group.groupTitle && !isCollapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#138808] text-white shadow-sm font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                    title={item.label}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!isCollapsed && isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white ml-auto" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))
        ) : (
          // General Flat Navigation for other roles
          GENERAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#138808] text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={item.label}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!isCollapsed && isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white ml-auto" />
                )}
              </Link>
            );
          })
        )}
      </nav>

      {/* Operational Telemetry Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>PostgreSQL 16 + PostGIS</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {isDistrictOfficer
              ? "District / CALA Jurisdiction (Sec 3G / RFCTLARR)"
              : isStateOfficer
              ? "State Revenue Control (Sec 19)"
              : "RFCTLARR 2013 National Command"}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Laptop Permanent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-in-out sticky top-[65px] h-[calc(100vh-65px)] self-start z-30 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="h-full w-full">{sidebarContent}</div>
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-slate-900 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
