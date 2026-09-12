"use client";

import React, { useState } from "react";
import { DashboardSummaryData } from "@/lib/types/dashboard";
import { useAuth } from "@/lib/hooks/useAuth";
import { DistrictKpiGrid } from "@/components/dashboard/DistrictKpiGrid";
import { DistrictPendingActions } from "@/components/dashboard/DistrictPendingActions";
import { DistrictProjectsTable } from "@/components/dashboard/DistrictProjectsTable";
import { DistrictFieldVerificationCard } from "@/components/dashboard/DistrictFieldVerificationCard";
import { DistrictObjectionsCard } from "@/components/dashboard/DistrictObjectionsCard";
import { DistrictCompensationCard } from "@/components/dashboard/DistrictCompensationCard";
import { DistrictAwardsCard } from "@/components/dashboard/DistrictAwardsCard";
import { DistrictDisbursementCard } from "@/components/dashboard/DistrictDisbursementCard";
import { DistrictPossessionCard } from "@/components/dashboard/DistrictPossessionCard";
import { DistrictRAndRCard } from "@/components/dashboard/DistrictRAndRCard";
import { DistrictEscalationsCard } from "@/components/dashboard/DistrictEscalationsCard";
import { DistrictProposalReviewModal } from "@/components/dashboard/DistrictProposalReviewModal";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  Compass,
  CreditCard,
  Award,
  ShieldCheck,
  Users,
  Home,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Layers,
  Calendar,
  Clock,
  Send,
  FileCheck2,
  Gavel,
  Calculator,
  ArrowRight,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-200">
        Loading District Cadastral GIS Engine...
      </div>
    ),
  }
);

interface DistrictAcquisitionControlProps {
  data: DashboardSummaryData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type DistrictTab =
  | "overview"
  | "gis"
  | "actions"
  | "projects"
  | "field"
  | "objections"
  | "compensation"
  | "awards"
  | "disbursement"
  | "possession"
  | "randr"
  | "escalations"
  | "all";

export function DistrictAcquisitionControl({
  data,
  onRefresh,
  isRefreshing = false,
}: DistrictAcquisitionControlProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DistrictTab>("overview");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string }>({
    id: "PRJ-JAIPUR-001",
    title: "Delhi-Jaipur Expressway Expansion",
  });
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const districtName = data.district_name || user?.district_id || "Jaipur";
  const stateName = data.state_name || user?.state_id || "Rajasthan";

  const handleOpenProposal = (projectId: string, projectTitle: string) => {
    setSelectedProposal({ id: projectId, title: projectTitle });
    setIsProposalModalOpen(true);
  };

  const handleProposalSuccess = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const tabs = [
    {
      id: "overview",
      label: "Command Overview",
      icon: LayoutDashboard,
      badge: "14 KPIs",
    },
    {
      id: "gis",
      label: "District GIS Map",
      icon: Compass,
      badge: "PostGIS Cadastre",
    },
    {
      id: "actions",
      label: "My Actions",
      icon: CheckCircle2,
      badge: `${data.district_my_tasks?.length || 0} Pending`,
    },
    {
      id: "projects",
      label: "District Projects",
      icon: Building2,
      badge: `${data.district_projects?.length || data.kpis.total_projects} Projects`,
    },
    {
      id: "field",
      label: "Field Verification",
      icon: FileCheck2,
      badge: `${data.district_field_verification?.submitted_for_review || 0} Reviews`,
    },
    {
      id: "objections",
      label: "Objections & Claims",
      icon: Gavel,
      badge: `${data.district_objections?.pending_review || 0} Claims`,
    },
    {
      id: "compensation",
      label: "Compensation",
      icon: Calculator,
      badge: "Sec 26/27",
    },
    {
      id: "awards",
      label: "Awards",
      icon: Award,
      badge: `${data.district_awards?.awards_pending_action || 0} Pending`,
    },
    {
      id: "disbursement",
      label: "Disbursement",
      icon: CreditCard,
      badge: "PFMS DBT",
    },
    {
      id: "possession",
      label: "Possession",
      icon: ShieldCheck,
      badge: "Sec 38",
    },
    {
      id: "randr",
      label: "R&R Schemes",
      icon: Home,
      badge: `${data.district_randr?.total_affected_families || data.kpis.affected_families} PAFs`,
    },
    {
      id: "escalations",
      label: "State Escalations",
      icon: ShieldAlert,
      badge: `${data.district_escalations_to_state?.length || 0} Dossiers`,
    },
    {
      id: "all",
      label: "Full View",
      icon: Layers,
      badge: "All",
    },
  ] as const;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. DISTRICT COMMAND HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                DISTRICT ACQUISITION CONTROL CENTER
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 inline" />
                District: <strong>{districtName}</strong> • State: <strong>{stateName}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              District / CALA Acquisition Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary operational authority executing project scrutiny, field verification, Section 15 objections, awards, and possession
            </p>
          </div>

          {/* Right Status Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 justify-end">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {currentDate}
              </div>
              <div className="text-[10px] text-emerald-800 font-mono font-medium flex items-center gap-1 justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-[#138808] animate-pulse" />
                <span>Officer: {user?.username || "CALA Jaipur"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Refresh district telemetry"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-700" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
            </button>

            <Link
              href="/gis"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#138808] hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>District GIS</span>
            </Link>
          </div>
        </div>

        {/* Action Banner Alert */}
        {bannerNotice && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-200/80 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DistrictTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive
                        ? "bg-slate-800 text-emerald-300"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TABBED CONTENT DISPATCH */}

      {/* Tab: OVERVIEW */}
      {(activeTab === "overview" || activeTab === "all") && (
        <div className="space-y-5">
          {/* Priority 1: My Pending Actions Work Queue */}
          <DistrictPendingActions
            tasks={data.district_my_tasks}
            onOpenProposalModal={handleOpenProposal}
          />

          {/* Priority 2: 14 District Statutory KPIs */}
          <DistrictKpiGrid kpis={data.kpis} />

          {/* Priority 3: Active District Projects */}
          <DistrictProjectsTable projects={data.district_projects} />

          {/* Priority 4 & 5: Field Verification & Objections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DistrictFieldVerificationCard fieldData={data.district_field_verification} />
            <DistrictObjectionsCard objectionsData={data.district_objections} />
          </div>

          {/* Priority 6 & 7: Compensation & Awards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DistrictCompensationCard compData={data.district_compensation} />
            <DistrictAwardsCard awardsData={data.district_awards} />
          </div>

          {/* Priority 8 & 9: Disbursement & Possession */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DistrictDisbursementCard disbData={data.district_disbursement} />
            <DistrictPossessionCard possessionData={data.district_possession} />
          </div>

          {/* Priority 10 & 11: R&R & Escalations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DistrictRAndRCard randrData={data.district_randr} />
            <DistrictEscalationsCard
              escalations={data.district_escalations_to_state}
              onOpenEscalationModal={() =>
                handleOpenProposal("PRJ-JAIPUR-001", "Escalate Inter-Agency Bottleneck")
              }
            />
          </div>
        </div>
      )}

      {/* Tab: GIS */}
      {(activeTab === "gis" || activeTab === "all") && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-[#138808]" />
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {districtName} District Cadastral Boundary Overlays
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time spatial visualization of survey khasras, Section 11 gazette boundaries, and solatium status across {districtName}.
                </p>
              </div>

              <Link
                href="/gis"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#138808] text-white text-xs font-bold hover:bg-emerald-700 transition shadow-2xs self-start sm:self-auto"
              >
                <span>National GIS Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <LeafletParcelMap height="100%" title={`${districtName} Cadastre`} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: ACTIONS */}
      {activeTab === "actions" && (
        <div className="space-y-5">
          <DistrictPendingActions
            tasks={data.district_my_tasks}
            onOpenProposalModal={handleOpenProposal}
          />
        </div>
      )}

      {/* Tab: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-5">
          <DistrictProjectsTable projects={data.district_projects} />
        </div>
      )}

      {/* Tab: FIELD */}
      {activeTab === "field" && (
        <div className="space-y-5">
          <DistrictFieldVerificationCard fieldData={data.district_field_verification} />
        </div>
      )}

      {/* Tab: OBJECTIONS */}
      {activeTab === "objections" && (
        <div className="space-y-5">
          <DistrictObjectionsCard objectionsData={data.district_objections} />
        </div>
      )}

      {/* Tab: COMPENSATION */}
      {activeTab === "compensation" && (
        <div className="space-y-5">
          <DistrictCompensationCard compData={data.district_compensation} />
        </div>
      )}

      {/* Tab: AWARDS */}
      {activeTab === "awards" && (
        <div className="space-y-5">
          <DistrictAwardsCard awardsData={data.district_awards} />
        </div>
      )}

      {/* Tab: DISBURSEMENT */}
      {activeTab === "disbursement" && (
        <div className="space-y-5">
          <DistrictDisbursementCard disbData={data.district_disbursement} />
        </div>
      )}

      {/* Tab: POSSESSION */}
      {activeTab === "possession" && (
        <div className="space-y-5">
          <DistrictPossessionCard possessionData={data.district_possession} />
        </div>
      )}

      {/* Tab: R&R */}
      {activeTab === "randr" && (
        <div className="space-y-5">
          <DistrictRAndRCard randrData={data.district_randr} />
        </div>
      )}

      {/* Tab: ESCALATIONS */}
      {activeTab === "escalations" && (
        <div className="space-y-5">
          <DistrictEscalationsCard
            escalations={data.district_escalations_to_state}
            onOpenEscalationModal={() =>
              handleOpenProposal("PRJ-JAIPUR-001", "Escalate Inter-Agency Bottleneck")
            }
          />
        </div>
      )}

      {/* Proposal Review / Scrutiny Modal */}
      <DistrictProposalReviewModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        projectId={selectedProposal.id}
        projectTitle={selectedProposal.title}
        onSuccess={handleProposalSuccess}
      />
    </div>
  );
}
