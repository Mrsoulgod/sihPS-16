"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProjectDetail } from "@/lib/hooks/useProjects";
import { useProjectWorkflow } from "@/lib/hooks/useWorkflow";
import { useParcels, useProjectParcelsGis } from "@/lib/hooks/useParcels";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { StageTransitionModal } from "@/components/workflow/StageTransitionModal";
import { ParcelTable } from "@/components/parcels/ParcelTable";
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

type ActiveTab = "overview" | "workflow" | "parcels" | "timeline" | "documents";

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

  const currentStageObj = workflow?.stages?.find((s) => s.stage_code === workflow.current_stage);

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
        <div className="mt-6 border-b border-gray-200 flex space-x-6">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "workflow", label: "Statutory Workflow", icon: GitMerge },
            { id: "parcels", label: `Land Parcels (${parcelList?.total_records || 0})`, icon: Layers },
            { id: "timeline", label: "Timeline & History", icon: Clock },
            { id: "documents", label: "Documents", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick SLA Status Cards */}
          {workflow && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Statutory Stages</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{workflow.stages.length}</p>
                <span className="text-[11px] text-gray-500">12 RFCTLARR stages</span>
              </div>
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Completed Stages</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {workflow.stages.filter((s) => s.status === "COMPLETED").length}
                </p>
                <span className="text-[11px] text-gray-500">Formally approved</span>
              </div>
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Cadastral Parcels</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{parcelList?.total_records || 0}</p>
                <span className="text-[11px] text-gray-500">Linked to project</span>
              </div>
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Stage Due</span>
                <p
                  className={`text-sm font-bold mt-1 ${
                    currentStageObj?.compliance_status === "OVERDUE" ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {currentStageObj?.due_date
                    ? new Date(currentStageObj.due_date).toLocaleDateString("en-IN")
                    : "Not set"}
                </p>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    currentStageObj?.compliance_status === "OVERDUE"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {currentStageObj?.compliance_status || "ON_TRACK"}
                </span>
              </div>
            </div>
          )}

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

          {/* Stage Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflow.stages.map((stage) => {
              const isCurrent = stage.stage_code === workflow.current_stage;
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

                  {stage.comments && (
                    <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      {stage.comments}
                    </p>
                  )}

                  {stage.rejection_reason && (
                    <p className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-start gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Rejection: {stage.rejection_reason}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LAND PARCELS & GIS */}
      {activeTab === "parcels" && (
        <div className="space-y-6">
          {/* GIS Map */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary-700" />
                  Cadastral Boundaries & Verification Status
                </h3>
                <p className="text-xs text-gray-500">
                  PostGIS boundary polygons for {project.title}. Click any parcel to view records.
                </p>
              </div>
            </div>

            <div className="h-[420px] w-full rounded-lg overflow-hidden border border-gray-200">
              <LeafletParcelMap
                geoJson={gisData}
                height="100%"
                onParcelClick={(parcelId: string) => {
                  router.push(`/land-parcels/${parcelId}`);
                }}
              />
            </div>
          </div>

          {/* Parcel Table */}
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

      {/* TAB 4: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Statutory Acquisition Milestones</h3>
            <p className="text-xs text-gray-500">
              Chronological record of statutory gazette publications, scrutiny clearances, and audit logs.
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-primary-200 space-y-6 ml-2">
            {workflow?.stages
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
                      Assigned Authority: <strong>{stageAssignedRole(s)}</strong> • Completed:{" "}
                      {s.completed_at
                        ? new Date(s.completed_at).toLocaleDateString("en-IN")
                        : "Ongoing"}
                    </p>
                    {s.comments && (
                      <p className="mt-1 text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                        {s.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
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

function stageAssignedRole(s: any): string {
  return s.assigned_role || s.assigned_role_name || "Statutory Authority";
}
