"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProjectDetail } from "@/lib/hooks/useProjects";
import { useProjectWorkflow } from "@/lib/hooks/useWorkflow";
import { useParcels, useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { useCompensationAssessments } from "@/lib/hooks/useCompensation";
import { useAwards } from "@/lib/hooks/useAwards";
import { useDisbursements } from "@/lib/hooks/useDisbursements";
import { usePossessions } from "@/lib/hooks/usePossession";
import { useRandRSchemes, useAffectedFamilies } from "@/lib/hooks/useRandR";
import { useProjectRisk } from "@/lib/hooks/useAnalytics";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { StageTransitionModal } from "@/components/workflow/StageTransitionModal";
import { ParcelTable } from "@/components/parcels/ParcelTable";
import { formatINR, formatCrores, formatDate } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  GitMerge,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  UserCheck,
  ChevronRight,
  Calculator,
  Award,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Home,
  Users,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

// Dynamically import Leaflet map to disable SSR
const LeafletParcelMap = dynamic(
  () => import("@/components/gis/LeafletParcelMap").then((mod) => mod.LeafletParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 animate-pulse border border-gray-200">
        Loading GIS Cadastral Map Engine...
      </div>
    ),
  }
);

type ActiveTab =
  | "overview"
  | "workflow"
  | "parcels"
  | "compensation"
  | "awards"
  | "disbursements"
  | "possession"
  | "randr"
  | "risk"
  | "timeline"
  | "documents";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);

  const { data: project, isLoading: isProjectLoading, error: projectError } = useProjectDetail(projectId);
  const { data: workflow, isLoading: isWorkflowLoading } = useProjectWorkflow(projectId);
  const { data: parcelList, isLoading: isParcelsLoading } = useParcels({ project_id: projectId });
  const { data: gisData } = useProjectParcelsGis(projectId);

  // Phase 5 integrated hooks for this project
  const { data: compensationData } = useCompensationAssessments({ project_id: projectId });
  const { data: awardsData } = useAwards({ project_id: projectId });
  const { data: disbursementsData } = useDisbursements({ project_id: projectId });
  const { data: possessionData } = usePossessions({ project_id: projectId });

  // Phase 6 integrated hooks for this project
  const { data: randrSchemesData } = useRandRSchemes({ project_id: projectId });
  const { data: affectedFamiliesData } = useAffectedFamilies({ project_id: projectId });
  const randrSchemes = randrSchemesData?.items || [];
  const affectedFamilies = affectedFamiliesData?.items || [];
  const assistedFamiliesCount = affectedFamilies.filter(
    (f) => f.rehabilitation_status === "SETTLED" || f.rehabilitation_status === "PLOT_ALLOTTED"
  ).length;

  // Phase 7 integrated risk intelligence hook
  const { data: riskDetail } = useProjectRisk(projectId);

  if (isProjectLoading || isWorkflowLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-28 w-full bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-96 w-full bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="max-w-xl mx-auto my-12 rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
        <h2 className="text-base font-bold">Project Not Found</h2>
        <p className="text-xs mt-1">The requested infrastructure project could not be loaded.</p>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center text-xs font-semibold text-primary-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Projects Directory
        </Link>
      </div>
    );
  }

  const acquired = project.total_land_acquired_acres || 0;
  const required = project.total_land_proposed_acres || 1;
  const progressPct = project.acquisition_progress_percent ?? Math.min(100, Math.round((acquired / required) * 100));
  const workflowStages = Array.isArray(workflow?.stages) ? workflow.stages : [];
  const currentStageObj = workflowStages.find((s) => s.stage_code === workflow?.current_stage);

  // Financial calculations
  const totalAwardedCr = project.total_awarded_cr ?? 0;
  const totalDisbursedCr = project.total_disbursed_compensation_cr ?? 0;
  const outstandingCr = project.outstanding_compensation_cr ?? Math.max(0, totalAwardedCr - totalDisbursedCr);

  // Lifecycle counts
  const totalParcelsCount = project.total_parcels_count ?? parcelList?.total_records ?? 0;
  const verifiedCount = project.verified_parcels_count ?? 0;
  const assessedCount = project.assessed_parcels_count ?? 0;
  const awardsCount = project.awards_count ?? 0;
  const disbursedCount = project.disbursed_parcels_count ?? 0;
  const possessionCount = project.possession_parcels_count ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/projects" className="hover:text-gray-900 transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-semibold text-gray-800">{project.project_code}</span>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                {project.project_code}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
              {project.current_stage_name && (
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-100 flex items-center gap-1">
                  <GitMerge className="h-3.5 w-3.5" />
                  Stage: {project.current_stage_name}
                </span>
              )}
            </div>

            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              {project.description || "National Infrastructure Project under acquisition scrutiny."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                State: <strong className="text-gray-700 ml-0.5">{project.state_name || "National"}</strong>
              </span>
              {project.implementing_agency && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  Agency: <strong className="text-gray-700 ml-0.5">{project.implementing_agency}</strong>
                </span>
              )}
              {project.estimated_budget_inr_cr && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  Sanctioned Budget:{" "}
                  <strong className="text-gray-700 ml-0.5">
                    ₹{project.estimated_budget_inr_cr.toFixed(2)} Cr
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Progress Metric Box */}
          <div className="lg:w-72 bg-gray-50 rounded-lg p-4 border border-gray-200 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Acquisition Progress</span>
              <span className="text-sm font-bold text-primary-700">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/80 text-[11px]">
              <div>
                <span className="text-gray-400 block">Acquired</span>
                <span className="font-bold text-gray-800">{acquired.toLocaleString()} ac</span>
              </div>
              <div>
                <span className="text-gray-400 block">Required</span>
                <span className="font-bold text-gray-800">{required.toLocaleString()} ac</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200 flex space-x-4 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "workflow", label: "Statutory Workflow", icon: GitMerge },
            { id: "parcels", label: `Land Parcels (${totalParcelsCount})`, icon: Layers },
            { id: "compensation", label: `Compensation (${compensationData?.items?.length || assessedCount})`, icon: Calculator },
            { id: "awards", label: `Awards (${awardsData?.items?.length || awardsCount})`, icon: Award },
            { id: "disbursements", label: `Disbursements (${disbursementsData?.items?.length || disbursedCount})`, icon: CreditCard },
            { id: "possession", label: `Possession (${possessionData?.items?.length || possessionCount})`, icon: ShieldCheck },
            { id: "randr", label: `R&R (${randrSchemes.length} Schemes / ${affectedFamilies.length} PAFs)`, icon: Home },
            { id: "risk", label: `Risk Intelligence (${riskDetail?.overall_risk_score ?? project.risk_score}/100)`, icon: ShieldAlert },
            { id: "timeline", label: "Timeline & History", icon: Clock },
            { id: "documents", label: "Documents", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Acquisition Lifecycle Funnel Stepper */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary-700" />
                  End-to-End Acquisition Lifecycle Pipeline
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time progression of land parcels across statutory acquisition stages.
                </p>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                {totalParcelsCount} Benchmark Parcels
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">1. Proposed</span>
                <span className="text-xl font-extrabold text-gray-900 font-mono mt-0.5 block">
                  {totalParcelsCount}
                </span>
                <span className="text-[10px] text-gray-500">Cadastre Notified</span>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">2. Verified</span>
                <span className="text-xl font-extrabold text-blue-800 font-mono mt-0.5 block">
                  {verifiedCount}
                </span>
                <span className="text-[10px] text-blue-600">Field Surveyed</span>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">3. Assessed</span>
                <span className="text-xl font-extrabold text-amber-800 font-mono mt-0.5 block">
                  {assessedCount}
                </span>
                <span className="text-[10px] text-amber-600">Valuation Done</span>
              </div>

              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-purple-600 block">4. Awarded</span>
                <span className="text-xl font-extrabold text-purple-800 font-mono mt-0.5 block">
                  {awardsCount}
                </span>
                <span className="text-[10px] text-purple-600">Sec 23/30 Awards</span>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">5. Disbursed</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono mt-0.5 block">
                  {disbursedCount}
                </span>
                <span className="text-[10px] text-emerald-600">PFMS DBT Paid</span>
              </div>

              <div className="p-3 bg-green-50/50 border border-green-200 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-green-700 block">6. Possession</span>
                <span className="text-xl font-extrabold text-green-800 font-mono mt-0.5 block">
                  {possessionCount}
                </span>
                <span className="text-[10px] text-green-700">Sec 38 Taken</span>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-teal-700 block">7. Resettled</span>
                <span className="text-xl font-extrabold text-teal-900 font-mono mt-0.5 block">
                  {assistedFamiliesCount}
                </span>
                <span className="text-[10px] text-teal-700">PAFs Assisted</span>
              </div>
            </div>
          </div>

          {/* Financial Pipeline Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Financial Compensation Pipeline (Reconciliation Ledger)
                </h3>
                <p className="text-xs text-gray-500">
                  Audited financial trail: Disbursed ≤ Awarded; Outstanding = Awarded - Disbursed.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                PFMS Reconciled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Assessed</span>
                <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">
                  ₹{project.total_assessed_compensation_cr?.toFixed(2) ?? "0.00"} Cr
                </span>
                <span className="text-[10px] text-gray-400">Valuation Schedule</span>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-lg border border-purple-200">
                <span className="text-[10px] uppercase font-bold text-purple-600 block">Total Awarded</span>
                <span className="text-lg font-bold text-purple-900 font-mono mt-0.5 block">
                  ₹{totalAwardedCr.toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-purple-600">Declared in Awards</span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Disbursed via DBT</span>
                <span className="text-lg font-bold text-emerald-800 font-mono mt-0.5 block">
                  ₹{totalDisbursedCr.toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-emerald-600">
                  {totalAwardedCr > 0 ? ((totalDisbursedCr / totalAwardedCr) * 100).toFixed(1) : 0}% Paid
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Outstanding Compensation</span>
                <span className="text-lg font-bold text-amber-900 font-mono mt-0.5 block">
                  ₹{outstandingCr.toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-amber-600">Pending DBT Execution</span>
              </div>
            </div>
          </div>

          {/* GIS Map Preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary-700" />
                  Cadastral Land Parcel Map
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time PostGIS parcel geometries color-coded by acquisition status.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("parcels")}
                className="text-xs font-semibold text-primary-700 hover:underline flex items-center"
              >
                View Parcels Table
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>

            <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
              <LeafletParcelMap
                geoJson={gisData}
                height="100%"
                onParcelClick={(parcelId: string) => {
                  router.push(`/land-parcels/${parcelId}`);
                }}
              />
            </div>
          </div>

          {/* Workflow Stepper Preview */}
          {workflow && (
            <div className="space-y-3">
              <WorkflowTimeline
                timeline={workflow}
                onOpenTransitionModal={() => setIsTransitionModalOpen(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKFLOW */}
      {activeTab === "workflow" && workflow && (
        <div className="space-y-6">
          <WorkflowTimeline
            timeline={workflow}
            onOpenTransitionModal={() => setIsTransitionModalOpen(true)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowStages.map((stage) => {
              const isCurrent = stage.stage_code === workflow?.current_stage;
              return (
                <div
                  key={stage.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isCurrent
                      ? "border-primary-400 bg-primary-50/20 shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Stage {stage.sequence_order}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{stage.stage_name}</h4>
                      <span className="text-[11px] font-mono text-gray-500">{stage.stage_code}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stage.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : stage.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-800"
                          : stage.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Assigned Authority</span>
                      <span className="font-semibold text-gray-800">{stage.assigned_role || "Designated Officer"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Statutory Due Date</span>
                      <span className="font-semibold text-gray-800">
                        {stage.due_date ? new Date(stage.due_date).toLocaleDateString("en-IN") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LAND PARCELS */}
      {activeTab === "parcels" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Project Land Parcels</h3>
              <p className="text-xs text-gray-500">
                Cadastral khasra records, land categories, ownership counts, and field verification status.
              </p>
            </div>

            <ParcelTable
              parcels={parcelList?.items || []}
              isLoading={isParcelsLoading}
              onSelectParcel={(parcelId) => {
                router.push(`/land-parcels/${parcelId}`);
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: COMPENSATION ASSESSMENTS */}
      {activeTab === "compensation" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-primary-700" />
                Configurable Compensation Assessments
              </h3>
              <p className="text-xs text-gray-500">
                Itemized statutory valuation determinations for parcels in this project.
              </p>
            </div>
            <Link
              href="/compensation"
              className="text-xs text-primary-700 hover:underline font-semibold flex items-center gap-1"
            >
              Open Compensation Module
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Assessment Ref</th>
                  <th className="py-2.5 px-3">Khasra Number</th>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3 text-right">Acquired Area</th>
                  <th className="py-2.5 px-3 text-right">Assessed Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {compensationData?.items && compensationData.items.length > 0 ? (
                  compensationData.items.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-primary-800">
                        {a.assessment_reference}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">Khasra {a.khasra_number}</td>
                      <td className="py-2.5 px-3 text-gray-600">{a.village_name}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                        {a.acquired_area_sqm?.toLocaleString("en-IN")} m²
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                        {formatINR(a.total_compensation_inr)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/compensation/${a.id}`}
                          className="text-primary-700 hover:underline font-semibold"
                        >
                          Breakdown →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-gray-400">
                      No compensation assessments recorded for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AWARDS */}
      {activeTab === "awards" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-700" />
                Section 23/30 Statutory Awards
              </h3>
              <p className="text-xs text-gray-500">
                Official awards issued by the Competent Authority for this project.
              </p>
            </div>
            <Link
              href="/awards"
              className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1"
            >
              Open Awards Module
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Award Number</th>
                  <th className="py-2.5 px-3">Award Date</th>
                  <th className="py-2.5 px-3 text-center">Parcels</th>
                  <th className="py-2.5 px-3 text-right">Area (Acres)</th>
                  <th className="py-2.5 px-3 text-right">Total Award Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {awardsData?.items && awardsData.items.length > 0 ? (
                  awardsData.items.map((aw) => (
                    <tr key={aw.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-900">
                        {aw.award_number}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{formatDate(aw.award_date)}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{aw.total_parcels_count}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                        {aw.total_area_acres ? Number(aw.total_area_acres).toFixed(2) : "—"} ac
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                        {formatINR(aw.total_award_amount_inr)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                          {aw.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/awards/${aw.id}`}
                          className="text-purple-700 hover:underline font-semibold"
                        >
                          View Award →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-gray-400">
                      No statutory awards declared for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DISBURSEMENTS */}
      {activeTab === "disbursements" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-emerald-700" />
                PFMS-Compatible / Simulated Payment Disbursements
              </h3>
              <p className="text-xs text-gray-500">
                Direct Benefit Transfer (DBT) records and mock bank UTR tracking.
              </p>
            </div>
            <Link
              href="/disbursements"
              className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
            >
              Open Disbursements Module
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Batch Ref</th>
                  <th className="py-2.5 px-3">Beneficiary</th>
                  <th className="py-2.5 px-3">Masked Account</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Bank UTR</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disbursementsData?.items && disbursementsData.items.length > 0 ? (
                  disbursementsData.items.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-800">
                        {d.disbursement_reference}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{d.owner_name}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{d.masked_bank_account}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                        {formatINR(d.amount_inr)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.payment_status === "DISBURSED"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {d.payment_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-700">
                        {d.bank_utr_number || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/disbursements/${d.id}`}
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-gray-400">
                      No disbursements initiated for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: POSSESSION */}
      {activeTab === "possession" && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                Section 38 Statutory Land Possession Handover
              </h3>
              <p className="text-xs text-gray-500">
                Handover records, encumbrance clearances, and physical land takeover status.
              </p>
            </div>
            <Link
              href="/possession"
              className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
            >
              Open Possession Module
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Possession Ref</th>
                  <th className="py-2.5 px-3">Parcel Khasra</th>
                  <th className="py-2.5 px-3">Handover Date</th>
                  <th className="py-2.5 px-3">Statutory Pathway</th>
                  <th className="py-2.5 px-3 text-center">Encumbrance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {possessionData?.items && possessionData.items.length > 0 ? (
                  possessionData.items.map((pos) => (
                    <tr key={pos.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-900">
                        {pos.possession_reference}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">Khasra {pos.khasra_number}</td>
                      <td className="py-2.5 px-3 text-gray-600">{formatDate(pos.possession_date)}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {pos.possession_type === "SECTION_40_URGENCY_CLAUSE" ? "Sec 40 (Urgency)" : "Sec 38 (Regular)"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {pos.is_encumbrance_free ? (
                          <span className="text-[10px] font-semibold text-green-700">Encumbrance-Free</span>
                        ) : (
                          <span className="text-[10px] text-amber-700">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                          {pos.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/possession/${pos.id}`}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          Certificate →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-gray-400">
                      No possession records established for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: REHABILITATION & RESETTLEMENT */}
      {activeTab === "randr" && (
        <div className="space-y-6">
          {/* Schemes Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-emerald-700" />
                  R&R Schemes Sanctioned for Project ({randrSchemes.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Resettlement colonies, composite assistance centers, and civic infrastructure delivery frameworks.
                </p>
              </div>
              <Link
                href="/r-and-r"
                className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
              >
                All Schemes Directory
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randrSchemes.map((scm) => (
                <div key={scm.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-700 font-bold text-xs">{scm.scheme_reference}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      {scm.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{scm.scheme_title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                    <span>{scm.total_families_count} Total PAFs</span>
                    <span className="font-semibold text-emerald-800">{scm.assisted_families_count} Assisted</span>
                    <span className="font-mono">₹{Number(scm.sanctioned_budget_cr).toFixed(2)} Cr</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${Math.min(scm.progress_percent || 0, 100)}%` }}
                    />
                  </div>
                  <div className="text-right pt-1">
                    <Link
                      href={`/r-and-r/${scm.id}`}
                      className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      Manage Scheme Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAFs Table */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-700" />
                  Project Affected Families (PAFs) ({affectedFamilies.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Cadastral linkage, statutory eligibility determination, and allotment tracking.
                </p>
              </div>
              <Link
                href="/affected-families"
                className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
              >
                All Affected Families Directory
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">PAF Reference</th>
                    <th className="py-2.5 px-3">Head of Family</th>
                    <th className="py-2.5 px-3">Village & Khasra</th>
                    <th className="py-2.5 px-3">Eligibility</th>
                    <th className="py-2.5 px-3">Rehab Status</th>
                    <th className="py-2.5 px-3">Allotted Plot</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affectedFamilies.length > 0 ? (
                    affectedFamilies.map((fam) => (
                      <tr key={fam.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-medium text-emerald-800">
                          {fam.family_reference_id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{fam.head_of_family_name}</td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {fam.village_name || "—"} {fam.khasra_number ? `(Kh. ${fam.khasra_number})` : ""}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">
                            {fam.eligibility_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                            {fam.rehabilitation_status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">
                          {fam.allotted_plot_number || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={`/affected-families/${fam.id}`}
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            Review 360° →
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-gray-400">
                        No affected families recorded for this project yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RISK INTELLIGENCE & ANALYTICS */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          {/* Risk Summary Header Banner */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statutory Risk Assessment
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${
                      (riskDetail?.risk_level || (project.risk_score >= 75 ? "CRITICAL" : project.risk_score >= 50 ? "HIGH" : project.risk_score >= 25 ? "MODERATE" : "LOW")) === "CRITICAL"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : (riskDetail?.risk_level || (project.risk_score >= 50 ? "HIGH" : "MODERATE")) === "HIGH"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {riskDetail?.risk_level || (project.risk_score >= 75 ? "CRITICAL" : project.risk_score >= 50 ? "HIGH" : project.risk_score >= 25 ? "MODERATE" : "LOW")} RISK
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  Predictive Risk Intelligence & SLA Radar
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Methodology: {riskDetail?.methodology_version || "RFCTLARR-v1.0 (Rule-Based Operational Indicators)"}
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-extrabold text-gray-900 font-mono">
                  {riskDetail?.overall_risk_score ?? project.risk_score}
                </span>
                <span className="text-sm text-gray-400 font-bold"> / 100</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Continuous Operational Score</p>
              </div>
            </div>

            {/* Top Risk Drivers & Recommendations */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  Primary Contributing Delay Drivers
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-amber-950">
                  {riskDetail?.top_risk_drivers && riskDetail.top_risk_drivers.length > 0 ? (
                    riskDetail.top_risk_drivers.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-amber-800">Operational tasks currently operating within statutory SLA limits.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-teal-50/60 border border-teal-200">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  Decision-Support Recommendations
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-teal-950">
                  {riskDetail?.decision_support_recommendations && riskDetail.decision_support_recommendations.length > 0 ? (
                    riskDetail.decision_support_recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">→</span>
                        <span>{r}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-teal-800">Proceed with standard statutory gazette publication and field verification.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 5 Risk Factors Breakdown Grid */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">5-Factor Risk Weight & Benchmark Scores</h3>
              <p className="text-xs text-gray-500">
                Detailed factor score contribution: Score × Weight = Weighted Risk Contribution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskDetail?.factors?.map((f) => (
                <div key={f.factor_id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {f.factor_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          f.status === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : f.status === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : f.status === "MODERATE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {f.status} ({f.score}/100)
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm mt-2">{f.factor_name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{f.explanation}</p>

                    <div className="mt-3 space-y-1">
                      {f.key_indicators?.map((ind, i) => (
                        <p key={i} className="text-[11px] text-gray-500 flex items-center gap-1">
                          <span className="text-gray-400">•</span> {ind}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Weight: <strong>{f.weight_percent}%</strong></span>
                    <span className="text-gray-700 font-semibold">Contribution: <strong>+{f.weighted_contribution}</strong> pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TIMELINE */}
      {activeTab === "timeline" && (

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Statutory Acquisition Milestones</h3>
            <p className="text-xs text-gray-500">
              Chronological record of statutory gazette publications, scrutiny clearances, and audit logs.
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-primary-200 space-y-6 ml-2">
            {workflowStages
              .filter((s) => s.status === "COMPLETED" || s.status === "IN_PROGRESS")
              .map((s) => (
                <div key={s.id} className="relative group">
                  <div
                    className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 bg-white ${
                      s.status === "COMPLETED"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-amber-500 bg-amber-500 text-white"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{s.stage_name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Assigned Authority: <strong>{s.assigned_role || "Statutory Authority"}</strong> • Completed:{" "}
                      {s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-IN") : "Ongoing"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 9: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Project Statutory Documents</h3>
            <p className="text-xs text-gray-500">
              Approved administrative sanctions, Preliminary Notifications, and Cadastral maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Administrative Sanction & DPR",
                code: "DOC-DPR-2024",
                type: "Detailed Project Report",
                date: "15 Jan 2024",
                size: "4.8 MB",
              },
              {
                title: "Preliminary Notification (Sec 11)",
                code: "SEC-11-GAZETTE",
                type: "Official Gazette Notification",
                date: "10 Feb 2024",
                size: "1.2 MB",
              },
              {
                title: "Joint Cadastral Survey Map",
                code: "CAD-MAP-V1",
                type: "Revenue Cadastre GIS Map",
                date: "28 Feb 2024",
                size: "8.4 MB",
              },
              {
                title: "Social Impact Scrutiny Note",
                code: "SIA-SCRUTINY-REP",
                type: "Expert Group Report",
                date: "12 Mar 2024",
                size: "2.1 MB",
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-start justify-between rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{doc.title}</h4>
                    <p className="text-[11px] text-gray-500">{doc.type}</p>
                    <span className="text-[10px] text-gray-400">
                      {doc.code} • {doc.date} • {doc.size}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Transition Modal */}
      {workflow && (
        <StageTransitionModal
          timeline={workflow}
          isOpen={isTransitionModalOpen}
          onClose={() => setIsTransitionModalOpen(false)}
        />
      )}
    </div>
  );
}
