import { ApiSuccessResponse } from "../types/api";
import { ProjectListItem, ProjectDetailResponse } from "../types/project";
import { ActionCenterSummaryResponse, ActionItemResponse, ActionWorkspaceResponse, AvailableActionOption } from "../types/action_center";
import { StageDefinition, ProjectWorkflowTimelineResponse, WorkflowTaskItem } from "../types/workflow";
import { ParcelListResponse, ParcelDetailResponse, GisGeoJsonFeatureCollection } from "../types/parcel";
import { CompensationAssessmentListItem, CompensationAssessmentDetail, CompensationCalculationBreakdown } from "../types/compensation";
import { AwardListItem, AwardDetail } from "../types/award";
import { DisbursementListItem, DisbursementDetail, FinancialReconciliationSummary } from "../types/disbursement";
import { PossessionListItem, PossessionDetail } from "../types/possession";
import { RAndRSchemeListItem, RAndRSchemeDetail, AffectedFamilyListItem, AffectedFamilyDetail } from "../types/randr";
import {
  NationalAnalyticsOverviewResponse,
  StateAnalyticsItem,
  DistrictAnalyticsItem,
  TimeSeriesResponse,
  BottleneckItem,
  RiskOverviewResponse,
  ReportTypeInfo,
  ReportPreviewResponse,
} from "../types/analytics";
import { DashboardSummaryData } from "../types/dashboard";
import { UserSummary, LoginResponseData } from "../types/auth";
import { getGisGeoJsonByProjectId, GIS_NH48_PKG4 } from "../data/gis_datasets";

// -------------------------------------------------------------
// 0. CANONICAL AUTH & PERSONA DATA
// -------------------------------------------------------------
export const MOCK_DEMO_USERS: Record<string, UserSummary> = {
  central_admin: {
    id: "00000000-0000-0000-0000-000000000001",
    username: "central_admin",
    email: "central@gov.demo",
    full_name: "Shri Rajesh Kumar, IAS",
    display_name: "Shri Rajesh Kumar, IAS (Joint Secretary)",
    designation: "Joint Secretary (Land Acquisition & National Highways)",
    organization: "Ministry of Road Transport & Highways (MoRTH)",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "CENTRAL",
      scope_display: "All India (National Mandate)",
    },
    permissions: [
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_ALL_STATES",
      "APPROVE_CENTRAL_SANCTIONS",
      "VIEW_ANALYTICS",
      "EXPORT_MIS_REPORTS",
      "VIEW_GIS_NATIONAL",
    ],
    is_active: true,
  },
  central_dg: {
    id: "00000000-0000-0000-0000-000000000011",
    username: "central_dg",
    email: "dg.dolr@gov.demo",
    full_name: "Smt. Sunita Rao, IDAS",
    display_name: "Smt. Sunita Rao, IDAS (Director General)",
    designation: "Director General (Statutory Compliance & Land Audits)",
    organization: "Department of Land Resources (DoLR), MoRD",
    role_id: "ROLE_CENTRAL_OFFICER",
    role_name: "Central Ministry Officer",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "CENTRAL",
      scope_display: "All India (Statutory Compliance & CAG Audit)",
    },
    permissions: [
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_ALL_STATES",
      "APPROVE_CENTRAL_SANCTIONS",
      "VIEW_ANALYTICS",
      "EXPORT_MIS_REPORTS",
      "VIEW_GIS_NATIONAL",
    ],
    is_active: true,
  },
  state_rj_officer: {
    id: "00000000-0000-0000-0000-000000000004",
    username: "state_rj_officer",
    email: "state@gov.demo",
    full_name: "Smt. Sunita Verma, IAS",
    display_name: "Smt. Sunita Verma, IAS (Principal Secretary)",
    designation: "Principal Secretary (Revenue)",
    organization: "Revenue & Colonisation Department, Govt. of Rajasthan",
    role_id: "ROLE_STATE_OFFICER",
    role_name: "State Government Officer",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "STATE",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      scope_display: "Rajasthan State (IN-RJ)",
    },
    permissions: [
      "VIEW_STATE_PIPELINE",
      "OVERSEE_DISTRICTS",
      "REVIEW_SECTION_19",
      "VIEW_ANALYTICS",
      "EXPORT_STATE_REPORTS",
      "VIEW_GIS_STATE",
    ],
    is_active: true,
  },
  cala_jaipur: {
    id: "00000000-0000-0000-0000-000000000002",
    username: "cala_jaipur",
    email: "district@gov.demo",
    full_name: "Dr. Amit Sharma, IAS",
    display_name: "Dr. Amit Sharma, IAS (District Collector & CALA)",
    designation: "District Collector & CALA",
    organization: "District Land Acquisition Authority, Jaipur",
    role_id: "ROLE_DISTRICT_OFFICER",
    role_name: "District CALA / Collector",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "DISTRICT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      scope_display: "Jaipur District (DST-JAI), Rajasthan",
    },
    permissions: [
      "MANAGE_DISTRICT_PROJECTS",
      "APPROVE_WORKFLOW_STAGES",
      "CONDUCT_OBJECTIONS",
      "DECLARE_SECTION_23_AWARD",
      "AUTHORIZE_PFMS_DISBURSEMENTS",
      "APPROVE_SECTION_38_POSSESSION",
      "VIEW_GIS_DISTRICT",
    ],
    is_active: true,
  },
  nhai_pd_jaipur: {
    id: "00000000-0000-0000-0000-000000000005",
    username: "nhai_pd_jaipur",
    email: "agency@gov.demo",
    full_name: "Er. Vikram Singh",
    display_name: "Er. Vikram Singh (Project Director NHAI)",
    designation: "Project Director (NHAI Jaipur)",
    organization: "National Highways Authority of India (NHAI)",
    role_id: "ROLE_PROJECT_AGENCY",
    role_name: "Project Implementing Agency",
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    district_id: "DST-JAI",
    district_name: "Jaipur",
    jurisdiction: {
      level: "PROJECT",
      state_id: "IN-RJ",
      state_name: "Rajasthan",
      district_id: "DST-JAI",
      district_name: "Jaipur",
      project_id: "PRJ-NH48-PKG4",
      scope_display: "NHAI Jaipur Projects (PRJ-NH48-PKG4)",
    },
    permissions: [
      "SUBMIT_PROJECT_PROPOSALS",
      "UPLOAD_DPR",
      "DEPOSIT_COMPENSATION",
      "REQUEST_POSSESSION",
      "VIEW_PROJECT_PROGRESS",
    ],
    is_active: true,
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000009",
    username: "admin",
    email: "admin@gov.demo",
    full_name: "Principal Systems Administrator",
    display_name: "Principal Systems Administrator (NIC)",
    designation: "Principal Systems Administrator",
    organization: "National Informatics Centre (NIC) / NLAMS Central Command",
    role_id: "ROLE_SYSTEM_ADMIN",
    role_name: "System Administrator",
    state_id: null,
    state_name: null,
    district_id: null,
    district_name: null,
    jurisdiction: {
      level: "SYSTEM",
      scope_display: "National Infrastructure & Platform Root",
    },
    permissions: [
      "MANAGE_USERS",
      "VIEW_AUDIT_LOGS",
      "CONFIGURE_SYSTEM",
      "OVERRIDE_WORKFLOW_STAGE",
      "MANAGE_MASTER_DATA",
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_ALL_STATES",
    ],
    is_active: true,
  },
};

export function getMockDemoUser(identifier: string): UserSummary {
  const clean = (identifier || "central_admin").trim().toLowerCase();
  if (MOCK_DEMO_USERS[clean]) {
    return MOCK_DEMO_USERS[clean];
  }
  for (const u of Object.values(MOCK_DEMO_USERS)) {
    if (u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) {
      return u;
    }
  }

  const isState = clean.includes("state");
  const isDistrict = clean.includes("cala") || clean.includes("district");
  const isField = clean.includes("patwari") || clean.includes("field");
  const isSocial = clean.includes("randr") || clean.includes("social");
  const isAgency = clean.includes("nhai") || clean.includes("agency");

  const role_id = isState
    ? "ROLE_STATE_OFFICER"
    : isDistrict
    ? "ROLE_DISTRICT_OFFICER"
    : isField
    ? "ROLE_FIELD_OFFICER"
    : isSocial
    ? "ROLE_SOCIAL_OFFICER"
    : isAgency
    ? "ROLE_PROJECT_AGENCY"
    : "ROLE_CENTRAL_OFFICER";

  const role_name = isState
    ? "State Government Officer"
    : isDistrict
    ? "District CALA / Collector"
    : isField
    ? "Field Officer / Surveyor"
    : isSocial
    ? "Social Development & R&R Officer"
    : isAgency
    ? "Project Implementing Agency"
    : "Central Ministry Officer";

  return {
    id: `dyn-usr-${clean}-${Date.now()}`,
    username: clean,
    email: `${clean}@gov.demo`,
    full_name: clean.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    display_name: `${clean.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} (${role_name})`,
    designation: role_name,
    organization: "National Land Acquisition & Management System (NLAMS)",
    role_id,
    role_name,
    state_id: isDistrict || isField || isSocial || isAgency ? "IN-RJ" : isState ? "IN-RJ" : null,
    state_name: isDistrict || isField || isSocial || isAgency ? "Rajasthan" : isState ? "Rajasthan" : null,
    district_id: isDistrict || isField || isSocial || isAgency ? "DST-JAI" : null,
    district_name: isDistrict || isField || isSocial || isAgency ? "Jaipur" : null,
    jurisdiction: {
      level: isState ? "STATE" : isDistrict ? "DISTRICT" : isField ? "FIELD" : isSocial ? "SOCIAL" : isAgency ? "PROJECT" : "CENTRAL",
      scope_display: `${clean.replace(/_/g, " ").toUpperCase()} Jurisdiction`,
    },
    permissions: [
      "VIEW_NATIONAL_PIPELINE",
      "VIEW_STATE_PIPELINE",
      "MANAGE_DISTRICT_PROJECTS",
      "CONDUCT_GROUND_SURVEY",
      "MANAGE_RR_SCHEMES",
      "SUBMIT_PROJECT_PROPOSALS",
      "VIEW_ANALYTICS",
    ],
    is_active: true,
  };
}

// -------------------------------------------------------------
// 1. CANONICAL PROJECTS DATA
// -------------------------------------------------------------
export const MOCK_PROJECTS: ProjectListItem[] = [
  {
    id: "PRJ-NH48-PKG4",
    project_code: "PRJ-NH48-PKG4",
    title: "NH-48 6-Laning & Jaipur Western Ring Road Connector (Package 4)",
    description: "Centrally monitored highway corridor expansion across NH-48 package 4.",
    sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
    implementing_agency: "National Highways Authority of India (NHAI)",
    current_stage: "SECTION_11",
    current_stage_name: "Section 11 Preliminary Notification",
    primary_district_name: "Jaipur",
    state_name: "Rajasthan",
    total_land_proposed_acres: 185.0,
    total_land_acquired_acres: 132.5,
    acquisition_progress_percent: 71.6,
    total_possession_acres: 115.4,
    estimated_budget_inr_cr: 1250.0,
    compensation_assessed_cr: 72.5,
    compensation_disbursed_cr: 54.2,
    disbursement_percent: 74.8,
    total_paf_count: 142,
    total_pdf_count: 38,
    randr_completion_percent: 68.5,
    risk_score: 32,
    parcels_count: 86,
  },
  {
    id: "PRJ-DFCC-W03",
    project_code: "PRJ-DFCC-W03",
    title: "Western Dedicated Freight Corridor (Kotputli - Phulera Feeder Link)",
    description: "High-speed freight railway corridor linking Kotputli industrial hub to Phulera junction.",
    sponsoring_ministry: "Ministry of Railways",
    implementing_agency: "Dedicated Freight Corridor Corporation of India (DFCCIL)",
    current_stage: "SECTION_19",
    current_stage_name: "Section 19 Declaration of Acquisition",
    primary_district_name: "Jaipur",
    state_name: "Rajasthan",
    total_land_proposed_acres: 310.0,
    total_land_acquired_acres: 265.0,
    acquisition_progress_percent: 85.5,
    total_possession_acres: 241.8,
    estimated_budget_inr_cr: 2840.0,
    compensation_assessed_cr: 135.0,
    compensation_disbursed_cr: 112.8,
    disbursement_percent: 83.6,
    total_paf_count: 280,
    total_pdf_count: 64,
    randr_completion_percent: 82.0,
    risk_score: 22,
    parcels_count: 145,
  },
  {
    id: "PRJ-DME-PKG12",
    project_code: "PRJ-DME-PKG12",
    title: "Delhi-Mumbai Expressway Spur Link (Bandikui-Jaipur Corridor)",
    description: "Access-controlled expressway spur connecting Jaipur bypass to the main DME alignment.",
    sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
    implementing_agency: "National Highways Authority of India (NHAI)",
    current_stage: "SECTION_23",
    current_stage_name: "Section 23 Enquiry and Award by Collector",
    primary_district_name: "Jaipur",
    state_name: "Rajasthan",
    total_land_proposed_acres: 220.0,
    total_land_acquired_acres: 198.0,
    acquisition_progress_percent: 90.0,
    total_possession_acres: 185.9,
    estimated_budget_inr_cr: 1680.0,
    compensation_assessed_cr: 96.0,
    compensation_disbursed_cr: 86.4,
    disbursement_percent: 90.0,
    total_paf_count: 195,
    total_pdf_count: 42,
    randr_completion_percent: 88.0,
    risk_score: 18,
    parcels_count: 112,
  },
  {
    id: "PRJ-METRO-PH2",
    project_code: "PRJ-METRO-PH2",
    title: "Jaipur Metro Phase-2 Corridor (Sitapura to Ambabari via Tonk Road)",
    description: "Urban mass rapid transit system connecting Sitapura Industrial Area to Ambabari.",
    sponsoring_ministry: "Ministry of Housing and Urban Affairs (MoHUA)",
    implementing_agency: "Jaipur Metro Rail Corporation (JMRC)",
    current_stage: "SECTION_15",
    current_stage_name: "Section 15 Hearing of Objections",
    primary_district_name: "Jaipur",
    state_name: "Rajasthan",
    total_land_proposed_acres: 95.0,
    total_land_acquired_acres: 42.0,
    acquisition_progress_percent: 44.2,
    total_possession_acres: 33.2,
    estimated_budget_inr_cr: 4500.0,
    compensation_assessed_cr: 88.0,
    compensation_disbursed_cr: 38.5,
    disbursement_percent: 43.8,
    total_paf_count: 310,
    total_pdf_count: 95,
    randr_completion_percent: 41.5,
    risk_score: 68,
    parcels_count: 94,
  },
  {
    id: "PRJ-SM-EXPR-08",
    project_code: "PRJ-SM-EXPR-08",
    title: "Samruddhi Mahamarg Nagpur-Mumbai Expressway Junction Corridor (Package 8)",
    description: "High-speed junction package for expressway integration.",
    sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
    implementing_agency: "Maharashtra State Road Development Corp (MSRDC)",
    current_stage: "SECTION_38",
    current_stage_name: "Section 38 Power to Take Possession",
    primary_district_name: "Pune",
    state_name: "Maharashtra",
    total_land_proposed_acres: 410.0,
    total_land_acquired_acres: 395.0,
    acquisition_progress_percent: 96.3,
    total_possession_acres: 385.4,
    estimated_budget_inr_cr: 3400.0,
    compensation_assessed_cr: 228.0,
    compensation_disbursed_cr: 215.0,
    disbursement_percent: 94.3,
    total_paf_count: 420,
    total_pdf_count: 88,
    randr_completion_percent: 92.5,
    risk_score: 14,
    parcels_count: 210,
  },
  {
    id: "PRJ-GNGA-EXP-02",
    project_code: "PRJ-GNGA-EXP-02",
    title: "Ganga Expressway Phase-1 (Meerut to Prayagraj Corridor - Section 2)",
    description: "Major state expressway traversing agricultural belts across central UP.",
    sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
    implementing_agency: "Uttar Pradesh Expressways Industrial Dev Authority (UPEIDA)",
    current_stage: "SECTION_26",
    current_stage_name: "Section 26 Determination of Market Value",
    primary_district_name: "Lucknow",
    state_name: "Uttar Pradesh",
    total_land_proposed_acres: 620.0,
    total_land_acquired_acres: 510.0,
    acquisition_progress_percent: 82.3,
    total_possession_acres: 466.2,
    estimated_budget_inr_cr: 5200.0,
    compensation_assessed_cr: 368.0,
    compensation_disbursed_cr: 310.5,
    disbursement_percent: 84.4,
    total_paf_count: 580,
    total_pdf_count: 140,
    randr_completion_percent: 78.0,
    risk_score: 38,
    parcels_count: 312,
  },
];

// -------------------------------------------------------------
// 2. CANONICAL ACTION CENTER DATA
// -------------------------------------------------------------
const SAMPLE_PRIMARY_ACTION: AvailableActionOption = {
  action: "FORWARD",
  label: "Endorse & Forward to State Rev Secy",
  description: "Statutory endorsement under Section 11 of RFCTLARR Act.",
  permission: "PERMISSION_ENDORSE_STAGE",
  is_primary: true,
  requires_remarks: true,
  requires_rejection_reason: false,
  requires_document: false,
  requires_confirmation: true,
  badge_variant: "primary",
};

export const MOCK_ACTION_ITEMS: ActionItemResponse[] = [
  {
    id: "ACT-RJ-CALA-001",
    action_type: "CALA_SCRUTINY_REQUIRED",
    title: "Section 11 Preliminary Survey Endorsement - Kotputli Bypass (14.2 ha)",
    description: "Field verification complete. Requires statutory endorsement by CALA.",
    project_id: "PRJ-NH48-PKG4",
    project_code: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    record_type: "SECTION_11_NOTIFICATION",
    record_reference: "SEC11-RJ-JAI-2026-004",
    workflow_stage: "SECTION_11",
    workflow_stage_name: "Section 11 Preliminary Notification",
    status: "PENDING",
    priority: "CRITICAL",
    due_date: "2026-03-11T18:30:00Z",
    sla_days_remaining: 1,
    is_overdue: false,
    assigned_role: "ROLE_DISTRICT_OFFICER",
    assigned_role_name: "District Collector & CALA",
    required_action_summary: "Review survey boundaries and sign Section 11 preliminary notification endorsement.",
    created_at: "2026-03-08T09:30:00Z",
    primary_action: SAMPLE_PRIMARY_ACTION,
  },
  {
    id: "ACT-RJ-SECY-002",
    action_type: "CONCURRENCE_REQUIRED",
    title: "Section 19 Declaration Concurrence - Western DFC Kotputli Feeder Link",
    description: "Section 19 declaration draft submitted by District CALA.",
    project_id: "PRJ-DFCC-W03",
    project_code: "PRJ-DFCC-W03",
    project_title: "Western Dedicated Freight Corridor (Kotputli - Phulera Feeder Link)",
    record_type: "SECTION_19_DECLARATION",
    record_reference: "SEC19-RJ-JAI-2026-001",
    workflow_stage: "SECTION_19",
    workflow_stage_name: "Section 19 Declaration of Acquisition",
    status: "PENDING",
    priority: "HIGH",
    due_date: "2026-03-15T18:30:00Z",
    sla_days_remaining: 4,
    is_overdue: false,
    assigned_role: "ROLE_STATE_OFFICER",
    assigned_role_name: "Principal Secretary (Revenue)",
    required_action_summary: "Grant State Concurrence and authorize Gazette publication.",
    created_at: "2026-03-09T14:15:00Z",
    primary_action: {
      ...SAMPLE_PRIMARY_ACTION,
      action: "GRANT_CONCURRENCE",
      label: "Grant State Concurrence & Notify",
    },
  },
  {
    id: "ACT-MH-PFMS-003",
    action_type: "DBT_DISBURSEMENT_SIGN",
    title: "PFMS Batch Direct Benefit Transfer - Pune Ring Road Award #04",
    description: "PFMS DBT payment batch ready for digital signature.",
    project_id: "PRJ-SM-EXPR-08",
    project_code: "PRJ-SM-EXPR-08",
    project_title: "Samruddhi Mahamarg Nagpur-Mumbai Expressway Junction Corridor",
    record_type: "DISBURSEMENT_BATCH",
    record_reference: "PFMS-MH-PUN-0412",
    workflow_stage: "SECTION_23",
    workflow_stage_name: "Section 23 Enquiry & Award",
    status: "PENDING",
    priority: "HIGH",
    due_date: "2026-03-14T18:30:00Z",
    sla_days_remaining: 3,
    is_overdue: false,
    assigned_role: "ROLE_DISTRICT_OFFICER",
    assigned_role_name: "District CALA Pune",
    required_action_summary: "DSC e-Sign and trigger PFMS DBT batch transfer to 52 beneficiary accounts.",
    created_at: "2026-03-10T06:00:00Z",
    primary_action: {
      ...SAMPLE_PRIMARY_ACTION,
      action: "SIGN_PFMS_BATCH",
      label: "DSC e-Sign & Trigger PFMS Push",
    },
  },
];

export const MOCK_ACTION_SUMMARY: ActionCenterSummaryResponse = {
  kpis: {
    requires_action: 3,
    due_soon: 1,
    overdue: 0,
    high_priority: 2,
    in_progress: 2,
    returned_rework: 0,
    forwarded: 5,
    completed: 18,
  },
  my_actions: MOCK_ACTION_ITEMS,
  in_progress: [],
  returned_rework: [],
  forwarded: [],
  completed: [],
  recent_activity: [
    {
      id: "act-hist-1",
      action: "SECTION_11_ENDORSED",
      title: "Preliminary survey endorsed",
      project: "NH-48 6-Laning",
      user: "Shri Jitendra Kumar Soni, IAS",
      role: "District CALA",
      timestamp: "2026-03-10T14:30:00Z",
      details: "42 cadastral khasras endorsed with zero objections.",
    },
  ],
};

// -------------------------------------------------------------
// 3. STATUTORY WORKFLOW STAGES
// -------------------------------------------------------------
export const MOCK_WORKFLOW_STAGES: StageDefinition[] = [
  { stage_code: "SECTION_3A", stage_name: "Proposal Submission & Requisition", sequence_order: 1, sla_days: 15, statutory_reference: "RFCTLARR 2013 Sec 3(1)", primary_role: "REQUISITIONING_BODY", description: "Submission of formal land requisition by agency.", can_reject: true, required_documents: ["Detailed Project Report", "Requisition Form"] },
  { stage_code: "SECTION_4", stage_name: "Social Impact Assessment (SIA)", sequence_order: 2, sla_days: 180, statutory_reference: "RFCTLARR 2013 Sec 4-8", primary_role: "SIA_UNIT", description: "Mandatory Social Impact Assessment study.", can_reject: true, required_documents: ["SIA Study Report", "SIMP Mitigation Plan"] },
  { stage_code: "SECTION_11", stage_name: "Section 11 Preliminary Notification", sequence_order: 3, sla_days: 30, statutory_reference: "RFCTLARR 2013 Sec 11", primary_role: "CALA_OFFICER", description: "Publication of preliminary acquisition notification.", can_reject: true, required_documents: ["Gazette Notification Draft", "Cadastral Boundary Map"] },
  { stage_code: "SECTION_15", stage_name: "Section 15 Hearing of Objections", sequence_order: 4, sla_days: 60, statutory_reference: "RFCTLARR 2013 Sec 15", primary_role: "CALA_OFFICER", description: "Collector hears objections from interested persons.", can_reject: true, required_documents: ["Objection Registers", "Collector Disposal Orders"] },
  { stage_code: "SECTION_19", stage_name: "Section 19 Declaration of Acquisition", sequence_order: 5, sla_days: 365, statutory_reference: "RFCTLARR 2013 Sec 19", primary_role: "STATE_REVENUE_SECRETARY", description: "Final declaration published in Official Gazette.", can_reject: true, required_documents: ["Official Gazette Issue", "Summary of R&R Scheme"] },
  { stage_code: "SECTION_21", stage_name: "Section 21 Public Notice & Claims", sequence_order: 6, sla_days: 30, statutory_reference: "RFCTLARR 2013 Sec 21", primary_role: "CALA_OFFICER", description: "Notice to persons interested to state claims.", can_reject: false, required_documents: ["Public Notice Copies", "Claims Ledger"] },
  { stage_code: "SECTION_23", stage_name: "Section 23 Enquiry & Award", sequence_order: 7, sla_days: 90, statutory_reference: "RFCTLARR 2013 Sec 23-30", primary_role: "CALA_OFFICER", description: "Enquiry into claims and formal Award issuance.", can_reject: true, required_documents: ["Section 23 Award Document", "Solatium & Interest Worksheets"] },
  { stage_code: "SECTION_38", stage_name: "Section 38 Power to Take Possession", sequence_order: 8, sla_days: 60, statutory_reference: "RFCTLARR 2013 Sec 38", primary_role: "CALA_OFFICER", description: "Handover of encumbrance-free physical possession.", can_reject: false, required_documents: ["Possession Certificate Form J", "PFMS DBT Reconciliation"] },
];

export const MOCK_TIMELINE: ProjectWorkflowTimelineResponse = {
  project_id: "PRJ-NH48-PKG4",
  project_code: "PRJ-NH48-PKG4",
  project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
  current_stage: "SECTION_11",
  overall_progress_percent: 45.0,
  is_current_stage_overdue: false,
  stages: [
    { id: "stg-1", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_3A", stage_name: "Proposal Submission & Requisition", sequence_order: 1, status: "COMPLETED", compliance_status: "COMPLETED", sla_deadline_days: 15, is_overdue: false, started_at: "2026-01-15T10:00:00Z", completed_at: "2026-01-28T14:00:00Z" },
    { id: "stg-2", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_4", stage_name: "Social Impact Assessment (SIA)", sequence_order: 2, status: "COMPLETED", compliance_status: "COMPLETED", sla_deadline_days: 180, is_overdue: false, started_at: "2026-01-29T09:00:00Z", completed_at: "2026-02-25T11:00:00Z" },
    { id: "stg-3", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_11", stage_name: "Section 11 Preliminary Notification", sequence_order: 3, status: "IN_PROGRESS", compliance_status: "ON_TRACK", sla_deadline_days: 30, is_overdue: false, started_at: "2026-02-26T10:00:00Z", days_remaining: 14 },
    { id: "stg-4", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_15", stage_name: "Section 15 Hearing of Objections", sequence_order: 4, status: "PENDING", compliance_status: "ON_TRACK", sla_deadline_days: 60, is_overdue: false },
    { id: "stg-5", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_19", stage_name: "Section 19 Declaration of Acquisition", sequence_order: 5, status: "PENDING", compliance_status: "ON_TRACK", sla_deadline_days: 365, is_overdue: false },
    { id: "stg-6", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_23", stage_name: "Section 23 Enquiry & Award", sequence_order: 6, status: "PENDING", compliance_status: "ON_TRACK", sla_deadline_days: 90, is_overdue: false },
    { id: "stg-7", project_id: "PRJ-NH48-PKG4", stage_code: "SECTION_38", stage_name: "Section 38 Power to Take Possession", sequence_order: 7, status: "PENDING", compliance_status: "ON_TRACK", sla_deadline_days: 60, is_overdue: false },
  ],
  transition_history: [
    { id: "tr-1", from_stage: "SECTION_3A", to_stage: "SECTION_4", decision: "APPROVED", triggered_by_user_id: "usr-sec-rj", triggered_by_name: "Dr. Rajeshwar Singh, IAS", triggered_by_role: "ROLE_STATE_OFFICER", created_at: "2026-01-28T14:00:00Z", remarks: "Proposal found in order with preliminary alignment approved." },
    { id: "tr-2", from_stage: "SECTION_4", to_stage: "SECTION_11", decision: "APPROVED", triggered_by_user_id: "usr-dist-jai", triggered_by_name: "Shri Jitendra Kumar Soni, IAS", triggered_by_role: "ROLE_DISTRICT_OFFICER", created_at: "2026-02-25T11:00:00Z", remarks: "SIA appraisal approved by Expert Group with zero ecological objections." },
  ],
  can_current_user_transition: true,
  allowed_transitions: [
    { action: "APPROVED", label: "Approve & Advance to Section 15 Hearing", target_stage: "SECTION_15" },
    { action: "REJECTED", label: "Revert to SIA Unit for Alignment Adjustment", target_stage: "SECTION_4" },
  ],
};

// -------------------------------------------------------------
// 4. CANONICAL CADASTRAL PARCELS & GIS DATA
// -------------------------------------------------------------
export const MOCK_PARCELS: ParcelListResponse = {
  items: [
    {
      id: "PCL-RJ-JAI-001",
      project_id: "PRJ-NH48-PKG4",
      project_code: "PRJ-NH48-PKG4",
      project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
      village_id: "VIL-SND-01",
      village_name: "Sundarpura",
      district_name: "Jaipur",
      state_name: "Rajasthan",
      khasra_number: "142/1",
      khata_number: "58",
      total_area_acres: 3.45,
      acquired_area_acres: 2.10,
      land_type: "AGRICULTURAL_IRRIGATED",
      acquisition_status: "SECTION_11_NOTIFIED",
      verification_status: "VERIFIED",
      is_disputed: false,
      owner_count: 2,
      primary_owner_name: "Rameshwar Prasad Sharma",
      possession_status: "NOT_TAKEN",
      centroid: [75.7873, 26.9124],
    },
    {
      id: "PCL-RJ-JAI-002",
      project_id: "PRJ-NH48-PKG4",
      project_code: "PRJ-NH48-PKG4",
      project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
      village_id: "VIL-SND-01",
      village_name: "Sundarpura",
      district_name: "Jaipur",
      state_name: "Rajasthan",
      khasra_number: "142/2",
      khata_number: "58",
      total_area_acres: 2.80,
      acquired_area_acres: 2.80,
      land_type: "AGRICULTURAL_UNIRRIGATED",
      acquisition_status: "SECTION_11_NOTIFIED",
      verification_status: "VERIFIED",
      is_disputed: false,
      owner_count: 1,
      primary_owner_name: "Bhagwan Sahay Sharma",
      possession_status: "NOT_TAKEN",
      centroid: [75.7892, 26.9145],
    },
    {
      id: "PCL-RJ-JAI-003",
      project_id: "PRJ-NH48-PKG4",
      project_code: "PRJ-NH48-PKG4",
      project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
      village_id: "VIL-SND-01",
      village_name: "Sundarpura",
      district_name: "Jaipur",
      state_name: "Rajasthan",
      khasra_number: "143/A",
      khata_number: "62",
      total_area_acres: 4.15,
      acquired_area_acres: 3.50,
      land_type: "RESIDENTIAL_COMMERCIAL",
      acquisition_status: "SECTION_19_DECLARED",
      verification_status: "VERIFIED",
      is_disputed: false,
      owner_count: 3,
      primary_owner_name: "Mohan Lal Yadav",
      possession_status: "PENDING_DISBURSEMENT",
      centroid: [75.7915, 26.9172],
    },
    {
      id: "PCL-RJ-JAI-004",
      project_id: "PRJ-NH48-PKG4",
      project_code: "PRJ-NH48-PKG4",
      project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
      village_id: "VIL-KTP-02",
      village_name: "Goneda",
      district_name: "Jaipur",
      state_name: "Rajasthan",
      khasra_number: "208/B",
      khata_number: "88",
      total_area_acres: 5.60,
      acquired_area_acres: 4.20,
      land_type: "AGRICULTURAL_IRRIGATED",
      acquisition_status: "AWARD_ENQUIRY",
      verification_status: "VERIFIED",
      is_disputed: false,
      owner_count: 4,
      primary_owner_name: "Smt. Shanti Devi Gurjar",
      possession_status: "AWARD_PASSED",
      centroid: [75.8020, 26.9240],
    },
  ],
  total_records: 4,
  page: 1,
  page_size: 25,
  total_pages: 1,
};

export const MOCK_GEOJSON_FEATURES: GisGeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "PCL-RJ-JAI-001",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7860, 26.9115],
            [75.7885, 26.9115],
            [75.7885, 26.9135],
            [75.7860, 26.9135],
            [75.7860, 26.9115],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-001",
        khasra_number: "142/1",
        khata_number: "58",
        village_name: "Sundarpura",
        total_area_acres: 3.45,
        acquired_area_acres: 2.10,
        land_type: "AGRICULTURAL_IRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        centroid: [75.7873, 26.9124],
        current_stage: "SECTION_11",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.5,
        weight: 2,
      },
    },
    {
      type: "Feature",
      id: "PCL-RJ-JAI-002",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.7885, 26.9135],
            [75.7910, 26.9135],
            [75.7910, 26.9155],
            [75.7885, 26.9155],
            [75.7885, 26.9135],
          ],
        ],
      },
      properties: {
        parcel_id: "PCL-RJ-JAI-002",
        khasra_number: "142/2",
        khata_number: "58",
        village_name: "Sundarpura",
        total_area_acres: 2.80,
        acquired_area_acres: 2.80,
        land_type: "AGRICULTURAL_UNIRRIGATED",
        acquisition_status: "SECTION_11_NOTIFIED",
        status_label: "Sec 11 Notified",
        verification_status: "VERIFIED",
        is_disputed: false,
        centroid: [75.7892, 26.9145],
        current_stage: "SECTION_11",
        fillColor: "#138808",
        color: "#0a5c04",
        fillOpacity: 0.5,
        weight: 2,
      },
    },
  ],
  metadata: {
    project_id: "PRJ-NH48-PKG4",
    parcel_count: 2,
    center: [75.788, 26.913],
    bounds: [[75.785, 26.910], [75.795, 26.920]],
  },
};

// -------------------------------------------------------------
// 5. CANONICAL COMPENSATION & VALUATION
// -------------------------------------------------------------
export const MOCK_COMPENSATIONS: CompensationAssessmentListItem[] = [
  {
    id: "CMP-RJ-JAI-001",
    assessment_reference: "CMP/2026/NH48/0014",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    parcel_id: "PCL-RJ-JAI-001",
    khasra_number: "142/1",
    village_name: "Sundarpura",
    district_name: "Jaipur",
    state_name: "Rajasthan",
    owner_names: ["Rameshwar Prasad Sharma", "Manoj Kumar Sharma"],
    acquired_area_sqm: 8498.4,
    total_compensation_inr: 18450000,
    status: "APPROVED_BY_CALA",
    is_approved_by_cala: true,
    approval_date: "2026-03-02T15:00:00Z",
    assessing_officer_name: "Shri Jitendra Kumar Soni, IAS",
    created_at: "2026-02-28T10:00:00Z",
  },
  {
    id: "CMP-RJ-JAI-002",
    assessment_reference: "CMP/2026/NH48/0015",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    parcel_id: "PCL-RJ-JAI-002",
    khasra_number: "142/2",
    village_name: "Sundarpura",
    district_name: "Jaipur",
    state_name: "Rajasthan",
    owner_names: ["Bhagwan Sahay Sharma"],
    acquired_area_sqm: 11331.2,
    total_compensation_inr: 24600000,
    status: "CALCULATION_PENDING",
    is_approved_by_cala: false,
    assessing_officer_name: "Shri Jitendra Kumar Soni, IAS",
    created_at: "2026-03-04T12:00:00Z",
  },
];

// -------------------------------------------------------------
// 6. CANONICAL SECTION 23 AWARDS
// -------------------------------------------------------------
export const MOCK_AWARDS: AwardListItem[] = [
  {
    id: "AWD-RJ-JAI-001",
    award_number: "AWD/2026/NH48/JAIPUR/001",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    project_code: "PRJ-NH48-PKG4",
    award_date: "2026-03-05",
    total_parcels_count: 14,
    total_area_acres: 28.5,
    total_award_amount_inr: 62500000,
    cala_user_name: "Shri Jitendra Kumar Soni, IAS",
    status: "PROCLAIMED",
    has_demo_esign: true,
    created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "AWD-RJ-DFC-002",
    award_number: "AWD/2026/DFCC/KOTPUTLI/004",
    project_id: "PRJ-DFCC-W03",
    project_title: "Western Dedicated Freight Corridor",
    project_code: "PRJ-DFCC-W03",
    award_date: "2026-02-20",
    total_parcels_count: 22,
    total_area_acres: 45.2,
    total_award_amount_inr: 104500000,
    cala_user_name: "Shri Jitendra Kumar Soni, IAS",
    status: "PROCLAIMED",
    has_demo_esign: true,
    created_at: "2026-02-20T14:30:00Z",
  },
];

// -------------------------------------------------------------
// 7. CANONICAL PFMS DISBURSEMENTS
// -------------------------------------------------------------
export const MOCK_DISBURSEMENTS: DisbursementListItem[] = [
  {
    id: "DSB-2026-001",
    disbursement_reference: "DSB/2026/NH48/0088",
    pfms_batch_reference: "PFMS-RJ-JAI-20260308-01",
    award_id: "AWD-RJ-JAI-001",
    award_number: "AWD/2026/NH48/JAIPUR/001",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    parcel_id: "PCL-RJ-JAI-001",
    khasra_number: "142/1",
    owner_id: "OWN-001",
    owner_name: "Rameshwar Prasad Sharma",
    masked_bank_account: "••••••••4819",
    masked_ifsc: "SBIN000••••",
    amount_inr: 9225000,
    payment_method: "PFMS_DBT",
    payment_status: "SUCCESS",
    bank_utr_number: "SBIN928374829104",
    disbursed_at: "2026-03-08T16:45:00Z",
    created_at: "2026-03-08T10:00:00Z",
  },
  {
    id: "DSB-2026-002",
    disbursement_reference: "DSB/2026/NH48/0089",
    pfms_batch_reference: "PFMS-RJ-JAI-20260308-01",
    award_id: "AWD-RJ-JAI-001",
    award_number: "AWD/2026/NH48/JAIPUR/001",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    parcel_id: "PCL-RJ-JAI-001",
    khasra_number: "142/1",
    owner_id: "OWN-002",
    owner_name: "Manoj Kumar Sharma",
    masked_bank_account: "••••••••7732",
    masked_ifsc: "PUNB002••••",
    amount_inr: 9225000,
    payment_method: "PFMS_DBT",
    payment_status: "SUCCESS",
    bank_utr_number: "PUNB982347102934",
    disbursed_at: "2026-03-08T16:45:00Z",
    created_at: "2026-03-08T10:00:00Z",
  },
];

// -------------------------------------------------------------
// 8. CANONICAL SECTION 38 POSSESSION
// -------------------------------------------------------------
export const MOCK_POSSESSIONS: PossessionListItem[] = [
  {
    id: "POS-2026-001",
    possession_reference: "POS/2026/NH48/JAI/01",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    project_code: "PRJ-NH48-PKG4",
    parcel_id: "PCL-RJ-JAI-001",
    khasra_number: "142/1",
    village_name: "Sundarpura",
    district_name: "Jaipur",
    possession_date: "2026-03-09",
    possession_type: "PERMANENT",
    status: "HANDED_OVER",
    is_encumbrance_free: true,
    taken_by_officer_name: "Project Director, NHAI PIU Jaipur",
    handed_over_by_officer_name: "Shri Jitendra Kumar Soni, IAS (CALA)",
    created_at: "2026-03-09T14:00:00Z",
  },
];

// -------------------------------------------------------------
// 9. CANONICAL R&R AND PAF CENSUS
// -------------------------------------------------------------
export const MOCK_RR_SCHEMES: RAndRSchemeListItem[] = [
  {
    id: "SCH-RJ-NH48-01",
    scheme_reference: "RR-SCH/2026/RJ/NH48/01",
    scheme_title: "Kotputli-Shahpura Bypass Resettlement & Livelihood Scheme",
    scheme_type: "SCHEDULE_II_R_AND_R",
    project_id: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    project_code: "PRJ-NH48-PKG4",
    sanctioned_budget_cr: 14.5,
    spent_budget_cr: 9.8,
    status: "ACTIVE",
    target_completion_date: "2026-08-31",
    total_families_count: 64,
    eligible_families_count: 64,
    assisted_families_count: 52,
    progress_percent: 81.25,
    created_at: "2026-01-20T10:00:00Z",
  },
];

export const MOCK_AFFECTED_FAMILIES: AffectedFamilyListItem[] = [
  {
    id: "PAF-RJ-001",
    family_reference_id: "PAF/NH48/SND/001",
    head_of_family_name: "Rameshwar Prasad Sharma",
    family_type: "LAND_OWNER",
    displacement_category: "PARTIAL_LAND_LOSS",
    social_category: "GENERAL",
    village_name: "Sundarpura",
    khasra_number: "142/1",
    parcel_id: "PCL-RJ-JAI-001",
    project_id: "PRJ-NH48-PKG4",
    project_code: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    scheme_id: "SCH-RJ-NH48-01",
    scheme_title: "Kotputli-Shahpura Bypass Resettlement & Livelihood Scheme",
    scheme_reference: "RR-SCH/2026/RJ/NH48/01",
    eligibility_status: "APPROVED",
    eligibility_category: "CATEGORY_A",
    rehabilitation_status: "ASSISTANCE_DISBURSED",
    allotted_plot_number: "PLT-SND-12",
    subsistence_grant_inr: 36000,
    is_grant_disbursed: true,
    allotments_count: 2,
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "PAF-RJ-002",
    family_reference_id: "PAF/NH48/SND/002",
    head_of_family_name: "Kalu Ram Bairwa",
    family_type: "AGRICULTURAL_LABOURER",
    displacement_category: "LIVELIHOOD_LOSS",
    social_category: "SC",
    village_name: "Sundarpura",
    khasra_number: "142/2",
    parcel_id: "PCL-RJ-JAI-002",
    project_id: "PRJ-NH48-PKG4",
    project_code: "PRJ-NH48-PKG4",
    project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
    scheme_id: "SCH-RJ-NH48-01",
    scheme_title: "Kotputli-Shahpura Bypass Resettlement & Livelihood Scheme",
    scheme_reference: "RR-SCH/2026/RJ/NH48/01",
    eligibility_status: "APPROVED",
    eligibility_category: "CATEGORY_C",
    rehabilitation_status: "IN_PROGRESS",
    subsistence_grant_inr: 36000,
    is_grant_disbursed: true,
    allotments_count: 1,
    created_at: "2026-02-01T11:00:00Z",
  },
];

// -------------------------------------------------------------
// 10. CANONICAL ANALYTICS & MIS DATA
// -------------------------------------------------------------
export const MOCK_NATIONAL_ANALYTICS: NationalAnalyticsOverviewResponse = {
  scope_level: "NATIONAL",
  jurisdiction_name: "All India (National Command View)",
  kpis: {
    total_projects: 12,
    active_projects: 11,
    completed_projects: 1,
    total_land_proposed_acres: 428.4,
    total_land_acquired_acres: 286.2,
    acquisition_progress_percent: 66.8,
    total_compensation_assessed_cr: 142.5,
    total_compensation_awarded_cr: 128.0,
    total_compensation_disbursed_cr: 98.4,
    outstanding_compensation_cr: 44.1,
    disbursement_progress_percent: 69.1,
    total_possession_acres: 210.5,
    possession_progress_percent: 49.1,
    total_affected_families: 1240,
    total_displaced_families: 310,
    randr_completed_families: 890,
    randr_completion_percent: 71.8,
  },
  funnel: {
    baseline_project_count: 12,
    baseline_proposed_acres: 428.4,
    stages: [
      { stage_id: "SEC_3A", stage_name: "Proposal / Sec 3A", metric_label: "Land Proposed", unit: "Acres", value: 428.4, formatted_value: "428.4 ac", conversion_rate_pct: 100, status: "COMPLETED" },
      { stage_id: "SEC_11", stage_name: "Sec 11 Notification", metric_label: "Land Notified", unit: "Acres", value: 375.0, formatted_value: "375.0 ac", conversion_rate_pct: 87.5, status: "IN_PROGRESS" },
      { stage_id: "SEC_19", stage_name: "Sec 19 Declaration", metric_label: "Land Declared", unit: "Acres", value: 320.0, formatted_value: "320.0 ac", conversion_rate_pct: 74.7, status: "IN_PROGRESS" },
      { stage_id: "SEC_23", stage_name: "Sec 23 Award", metric_label: "Land Awarded", unit: "Acres", value: 286.2, formatted_value: "286.2 ac", conversion_rate_pct: 66.8, status: "IN_PROGRESS" },
      { stage_id: "SEC_38", stage_name: "Sec 38 Possession", metric_label: "Land Possessed", unit: "Acres", value: 210.5, formatted_value: "210.5 ac", conversion_rate_pct: 49.1, status: "IN_PROGRESS" },
    ],
  },
  data_quality_summary: {
    overall_status: "COMPLIANT",
    total_checks_count: 18,
    passed_checks_count: 17,
    warnings_count: 1,
    reconciliation_timestamp: new Date().toISOString(),
    checks: [
      { check_id: "CHK-01", check_name: "PFMS DBT vs Section 23 Award Total", status: "PASSED", rule_description: "Disbursed amount must not exceed awarded amount.", tested_value: "INR 98.4 Cr", reference_value: "INR 128.0 Cr", is_compliant: true },
      { check_id: "CHK-02", check_name: "Land Registry (Khasra) Polygon Closure", status: "PASSED", rule_description: "GeoJSON boundaries must close with zero topological slivers.", tested_value: "100% Closed", reference_value: "Tolerance < 0.01m", is_compliant: true },
      { check_id: "CHK-03", check_name: "R&R Grant DBT Bank Account IFSC Validation", status: "PASSED", rule_description: "100% of beneficiary accounts validated via PFMS NPCI mapper.", tested_value: "100% Validated", reference_value: "100%", is_compliant: true },
    ],
  },
};

export const MOCK_STATE_ANALYTICS: StateAnalyticsItem[] = [
  {
    state_id: "IN-RJ",
    state_name: "Rajasthan",
    project_count: 4,
    land_proposed_acres: 810.0,
    land_acquired_acres: 637.5,
    acquisition_percent: 78.7,
    compensation_assessed_cr: 291.9,
    compensation_disbursed_cr: 253.4,
    disbursement_percent: 86.8,
    possession_acres: 512.4,
    possession_percent: 63.3,
    affected_families_count: 820,
    randr_completed_count: 640,
    randr_completion_percent: 78.0,
    performance_category: "STRONG",
  },
  {
    state_id: "IN-MH",
    state_name: "Maharashtra",
    project_count: 3,
    land_proposed_acres: 620.0,
    land_acquired_acres: 540.0,
    acquisition_percent: 87.1,
    compensation_assessed_cr: 380.0,
    compensation_disbursed_cr: 320.0,
    disbursement_percent: 84.2,
    possession_acres: 480.0,
    possession_percent: 77.4,
    affected_families_count: 950,
    randr_completed_count: 810,
    randr_completion_percent: 85.3,
    performance_category: "STRONG",
  },
  {
    state_id: "IN-UP",
    state_name: "Uttar Pradesh",
    project_count: 3,
    land_proposed_acres: 740.0,
    land_acquired_acres: 580.0,
    acquisition_percent: 78.4,
    compensation_assessed_cr: 410.0,
    compensation_disbursed_cr: 345.0,
    disbursement_percent: 84.1,
    possession_acres: 490.0,
    possession_percent: 66.2,
    affected_families_count: 1120,
    randr_completed_count: 890,
    randr_completion_percent: 79.5,
    performance_category: "MODERATE",
  },
];

export const MOCK_REPORT_TYPES: ReportTypeInfo[] = [
  {
    id: "rep-01",
    code: "NATIONAL_ACQUISITION_PROGRESS",
    title: "National Statutory Acquisition Progress Report",
    description: "Comprehensive corridor-by-corridor breakdown of RFCTLARR stages, land areas, and SLA timelines.",
    category: "STATUTORY_PROGRESS",
    supported_filters: ["state_id", "project_id", "status"],
    supported_formats: ["PDF", "EXCEL", "CSV"],
  },
  {
    id: "rep-02",
    code: "PFMS_DISBURSEMENT_RECONCILIATION",
    title: "PFMS Direct Benefit Transfer & Financial Reconciliation",
    description: "Schedule I & II financial audit statements with UTR tracking and beneficiary payment statuses.",
    category: "FINANCIAL",
    supported_filters: ["state_id", "district_id", "project_id"],
    supported_formats: ["PDF", "EXCEL", "CSV"],
  },
  {
    id: "rep-03",
    code: "PAF_RESETTLEMENT_AUDIT",
    title: "Project Affected Families (PAF) R&R Compliance Ledger",
    description: "Census tracking, statutory grant disbursements, and resettlement plot handovers.",
    category: "SOCIAL_R_AND_R",
    supported_filters: ["project_id", "state_id"],
    supported_formats: ["PDF", "EXCEL"],
  },
];

// -------------------------------------------------------------
// 11. CENTRAL ROUTING DISPATCHER
// -------------------------------------------------------------
export function handleMockApiRequest<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, unknown> } = {}
): ApiSuccessResponse<T> {
  const method = (options.method || "GET").toUpperCase();
  let clean = endpoint.split("?")[0].trim();
  clean = clean.replace(/^\/api\/v1/, "");
  if (!clean.startsWith("/")) clean = "/" + clean;

  // 0. AUTHENTICATION ENDPOINTS
  if (clean === "/auth/login" && method === "POST") {
    let username = "central_admin";
    try {
      if (options.body) {
        const parsedBody = JSON.parse(options.body as string);
        username = parsedBody.username_or_email || parsedBody.username || "central_admin";
      }
    } catch {
      // ignore JSON parse error
    }
    const demoUser = getMockDemoUser(username);
    const mockToken = `demo_token_${demoUser.id}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("nlams_access_token", mockToken);
      localStorage.setItem("nlams_user_profile", JSON.stringify(demoUser));
    }
    const loginData: LoginResponseData = {
      access_token: mockToken,
      token_type: "bearer",
      expires_in_seconds: 86400,
      user: demoUser,
    };
    return {
      success: true,
      data: loginData as unknown as T,
      message: `Welcome, ${demoUser.full_name}. Session initiated.`,
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-auth-login-${Date.now()}` },
    };
  }

  if (clean === "/auth/me" && method === "GET") {
    let currentUser: UserSummary | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("nlams_user_profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.role_id && parsed.full_name) {
            currentUser = parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    const userToReturn = currentUser || getMockDemoUser("central_admin");
    return {
      success: true,
      data: userToReturn as unknown as T,
      message: "Current official session verified.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-auth-me-${Date.now()}` },
    };
  }

  if (clean === "/auth/logout") {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nlams_access_token");
      localStorage.removeItem("nlams_user_profile");
    }
    return {
      success: true,
      data: null as unknown as T,
      message: "Logged out successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-auth-logout-${Date.now()}` },
    };
  }

  // 0.5 DASHBOARD ENDPOINTS
  if (clean.startsWith("/dashboard")) {
    let currentUser: UserSummary | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("nlams_user_profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.role_id) {
            currentUser = parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    const roleId = currentUser?.role_id || "ROLE_CENTRAL_OFFICER";
    const isDistrict = roleId === "ROLE_DISTRICT_OFFICER";
    const isState = roleId === "ROLE_STATE_OFFICER";
    const isAgency = roleId === "ROLE_PROJECT_AGENCY";
    const isField = roleId === "ROLE_FIELD_OFFICER";
    const isSocial = roleId === "ROLE_SOCIAL_OFFICER";

    const dashboardData: DashboardSummaryData = {
      scope_level: isDistrict ? "DISTRICT" : isState ? "STATE" : isAgency ? "AGENCY" : isField ? "FIELD" : isSocial ? "SOCIAL" : "NATIONAL",
      jurisdiction_name: isDistrict
        ? `${currentUser?.district_name || "Jaipur"} District (CALA Command)`
        : isState
        ? `${currentUser?.state_name || "Rajasthan"} (State Secretariat)`
        : isAgency
        ? `${currentUser?.organization || "NHAI"} (Project Agency Command)`
        : isField
        ? "Kotputli Tehsil (Field Operations)"
        : isSocial
        ? "Jaipur District (Social R&R Welfare)"
        : "All India (National Command View)",
      state_id: isDistrict || isField || isSocial || isAgency ? "IN-RJ" : isState ? "IN-RJ" : undefined,
      state_name: isDistrict || isField || isSocial || isAgency ? "Rajasthan" : isState ? "Rajasthan" : undefined,
      district_id: isDistrict || isField || isSocial ? "DST-JAI" : undefined,
      district_name: isDistrict || isField || isSocial ? "Jaipur" : undefined,
      kpis: {
        total_projects: isDistrict ? 4 : isState ? 6 : isAgency ? 2 : 12,
        total_land_proposed_acres: isDistrict ? 185.0 : 428.4,
        total_land_acquired_acres: isDistrict ? 132.5 : 286.2,
        total_possession_acres: isDistrict ? 115.4 : 210.5,
        overall_acquisition_percent: 66.8,
        compensation_assessed_cr: isDistrict ? 72.5 : 142.5,
        compensation_disbursed_cr: isDistrict ? 54.2 : 98.4,
        overall_disbursement_percent: 69.1,
        affected_families: isDistrict ? 142 : 1240,
        displaced_families: isDistrict ? 38 : 310,
        total_paf_count: isDistrict ? 142 : 1240,
        total_pdf_count: isDistrict ? 38 : 310,
        avg_randr_completion_percent: 74.2,
        eligible_families: isDistrict ? 142 : 1240,
        families_assisted: isDistrict ? 98 : 980,
        families_completed: isDistrict ? 89 : 890,
        pending_rr_cases: isDistrict ? 26 : 260,
        parcels_pending_verification: 8,
        objections_pending: 3,
        compensation_pending_cases: 5,
        awards_pending: 2,
        disbursement_pending_cases: 4,
        possession_pending_cases: 2,
        randr_pending_cases: 6,
        high_critical_risk_projects: 1,
      },
      acquisition_overview: {
        land_proposed_acres: 428.4,
        land_acquired_acres: 286.2,
        land_remaining_acres: 142.2,
        acquisition_percent: 66.8,
        possession_acres: 210.5,
        possession_percent: 49.1,
      },
      randr_overview: {
        total_affected_families: 1240,
        eligible_families: 1240,
        families_approved: 1120,
        families_assisted: 980,
        families_completed: 890,
        pending_cases: 260,
        completion_percent: 74.2,
        progress_stages: [
          { stage: "Survey Completed", count: 1240, percentage: 100 },
          { stage: "Entitlements Approved", count: 1120, percentage: 90.3 },
          { stage: "Housing/Grant Disbursed", count: 980, percentage: 79 },
          { stage: "Fully Resettled", count: 890, percentage: 71.8 },
        ],
      },
      status_breakdown: {
        on_track: 8,
        at_risk: 3,
        delayed: 1,
        completed: 0,
        total: 12,
      },
      state_progress: [
        {
          state_id: "IN-RJ",
          state_name: "Rajasthan",
          project_count: 5,
          land_proposed_acres: 185,
          land_acquired_acres: 132.5,
          acquisition_percent: 71.6,
          compensation_disbursed_cr: 54.2,
          randr_completion_percent: 78,
          performance_category: "STRONG",
        },
        {
          state_id: "IN-MH",
          state_name: "Maharashtra",
          project_count: 4,
          land_proposed_acres: 142.4,
          land_acquired_acres: 98.7,
          acquisition_percent: 69.3,
          compensation_disbursed_cr: 31.8,
          randr_completion_percent: 72.5,
          performance_category: "STRONG",
        },
        {
          state_id: "IN-UP",
          state_name: "Uttar Pradesh",
          project_count: 3,
          land_proposed_acres: 101,
          land_acquired_acres: 55,
          acquisition_percent: 54.5,
          compensation_disbursed_cr: 12.4,
          randr_completion_percent: 65,
          performance_category: "MODERATE",
        },
      ],
      attention_projects: [
        {
          id: "PRJ-NH48-PKG4",
          project_code: "PRJ-NH48-PKG4",
          title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
          state_name: "Rajasthan",
          district_name: "Jaipur",
          current_stage: "SECTION_11",
          acquisition_progress_percent: 71.6,
          status: "AT_RISK",
          reason: "Statutory deadline for Section 11 preliminary notification approaches in 14 days.",
          risk_score: 32,
        },
      ],
      recent_activity: [
        {
          id: 1,
          action: "Section 11 Preliminary Survey Endorsed",
          entity_name: "Kotputli Bypass",
          entity_id: "ACT-RJ-CALA-001",
          actor_name: "Dr. Amit Sharma, IAS",
          actor_role: "District CALA",
          timestamp: new Date().toISOString(),
        },
      ],
      quick_actions: [
        {
          id: "qa-1",
          label: "National Project Pipeline",
          description: "Monitor all interstate corridor acquisitions",
          target_route: "/projects",
          badge: "6 Corridors",
          icon: "Building2",
        },
        {
          id: "qa-2",
          label: "Statutory Action Center",
          description: "Review pending Section 11 & Section 19 tasks",
          target_route: "/action-centre",
          badge: "3 Actions",
          icon: "FileCheck",
        },
        {
          id: "qa-3",
          label: "PFMS Direct Benefit Transfer",
          description: "Process digital escrow payment batches",
          target_route: "/disbursements",
          badge: "₹18.4 Cr Ready",
          icon: "IndianRupee",
        },
      ],
      funnel: [
        { stage_order: 1, stage_id: "SEC_3A", stage_name: "Proposal / Sec 3A", description: "Requisition submitted", project_count: 12, land_acres: 428.4, amount_cr: 142.5, is_bottleneck: false, status: "COMPLETED" },
        { stage_order: 2, stage_id: "SEC_11", stage_name: "Sec 11 Notification", description: "Preliminary gazette", project_count: 10, land_acres: 375.0, amount_cr: 120.0, is_bottleneck: false, status: "IN_PROGRESS" },
        { stage_order: 3, stage_id: "SEC_19", stage_name: "Sec 19 Declaration", description: "Final declaration", project_count: 8, land_acres: 320.0, amount_cr: 98.4, is_bottleneck: false, status: "IN_PROGRESS" },
        { stage_order: 4, stage_id: "SEC_23", stage_name: "Sec 23 Award", description: "Collector award enquiry", project_count: 6, land_acres: 286.2, amount_cr: 86.4, is_bottleneck: false, status: "IN_PROGRESS" },
        { stage_order: 5, stage_id: "SEC_38", stage_name: "Sec 38 Possession", description: "Physical possession handover", project_count: 4, land_acres: 210.5, amount_cr: 54.2, is_bottleneck: false, status: "IN_PROGRESS" },
      ],
      critical_projects: [
        {
          id: "PRJ-METRO-PH2",
          project_code: "PRJ-METRO-PH2",
          title: "Jaipur Metro Phase-2 Corridor",
          state_name: "Rajasthan",
          district_name: "Jaipur",
          current_stage: "SECTION_15",
          progress_percent: 44.2,
          risk_level: "HIGH",
          risk_score: 68,
          main_bottleneck: "Section 15 commercial property objections",
          pending_action: "Convene Special CALA Lok Adalat",
        },
      ],
      central_attention: [
        {
          issue_id: "ISSUE-01",
          priority: "CRITICAL",
          issue_type: "SECTION_11_SLA",
          state_name: "Rajasthan",
          district_name: "Jaipur",
          project_title: "NH-48 6-Laning",
          project_id: "PRJ-NH48-PKG4",
          reason: "Section 11 gazette notification draft pending endorsement for 12 days.",
          current_authority: "District CALA Jaipur",
          age_days: 12,
          status: "OPEN",
        },
      ],
      trends: {
        acquisition_progression: [
          { month: "Oct 25", proposed: 45, acquired: 30, possession: 20 },
          { month: "Nov 25", proposed: 110, acquired: 75, possession: 50 },
          { month: "Dec 25", proposed: 180, acquired: 120, possession: 85 },
          { month: "Jan 26", proposed: 230, acquired: 165, possession: 120 },
          { month: "Feb 26", proposed: 265, acquired: 195, possession: 155 },
          { month: "Mar 26", proposed: 286.2, acquired: 210.5, possession: 180 },
        ],
        disbursement_progression: [
          { month: "Oct 25", assessed: 30, awarded: 25, disbursed: 18.2 },
          { month: "Nov 25", assessed: 65, awarded: 55, disbursed: 42.5 },
          { month: "Dec 25", assessed: 95, awarded: 80, disbursed: 65.0 },
          { month: "Jan 26", assessed: 115, awarded: 98, disbursed: 78.4 },
          { month: "Feb 26", assessed: 130, awarded: 112, disbursed: 89.0 },
          { month: "Mar 26", assessed: 142.5, awarded: 128, disbursed: 98.4 },
        ],
        possession_progression: [
          { month: "Oct 25", target_acres: 45, handed_over: 30 },
          { month: "Nov 25", target_acres: 110, handed_over: 75 },
          { month: "Dec 25", target_acres: 180, handed_over: 120 },
          { month: "Jan 26", target_acres: 230, handed_over: 165 },
          { month: "Feb 26", target_acres: 265, handed_over: 195 },
          { month: "Mar 26", target_acres: 286.2, handed_over: 210.5 },
        ],
        randr_progression: [
          { month: "Oct 25", eligible: 120, settled: 90 },
          { month: "Nov 25", eligible: 280, settled: 210 },
          { month: "Dec 25", eligible: 450, settled: 340 },
          { month: "Jan 26", eligible: 680, settled: 510 },
          { month: "Feb 26", eligible: 810, settled: 620 },
          { month: "Mar 26", eligible: 1240, settled: 890 },
        ],
        stage_distribution: [
          { stage: "Sec 3A Requisition", projects: 2 },
          { stage: "Sec 4 SIA Study", projects: 2 },
          { stage: "Sec 11 Preliminary", projects: 3 },
          { stage: "Sec 15 Objections", projects: 1 },
          { stage: "Sec 19 Declaration", projects: 2 },
          { stage: "Sec 23 Award", projects: 1 },
          { stage: "Sec 38 Possession", projects: 1 },
        ],
      },
      district_projects: [
        {
          project_id: "PRJ-NH48-PKG4",
          project_code: "PRJ-NH48-PKG4",
          title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
          implementing_agency: "NHAI",
          current_stage: "SECTION_11",
          progress_percent: 71.6,
          land_proposed_acres: 185.0,
          land_acquired_acres: 132.5,
          land_pending_acres: 52.5,
          compensation_assessed_cr: 72.5,
          compensation_disbursed_cr: 54.2,
          possession_percent: 62.4,
          possession_acres: 115.4,
          randr_completion_percent: 68.5,
          risk_level: "LOW",
          pending_action: "Section 11 Endorsement",
          status: "ON_TRACK",
        },
      ],
      district_my_tasks: [
        {
          id: "tsk-01",
          task_id: "tsk-01",
          task_title: "Endorse Section 11 Preliminary Boundary Survey",
          project_id: "PRJ-NH48-PKG4",
          project_title: "NH-48 6-Laning",
          project_code: "PRJ-NH48-PKG4",
          stage: "SECTION_11",
          stage_name: "Section 11 Notification",
          priority: "CRITICAL",
          sla_status: "DUE_TODAY",
          status: "PENDING",
          target_route: "/action-centre",
          created_at: new Date().toISOString(),
        },
      ],
    };

    return {
      success: true,
      data: dashboardData as unknown as T,
      message: "Dashboard summary loaded successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-dash-${Date.now()}` },
    };
  }

  // 1. /projects
  if (clean === "/projects" && method === "GET") {
    return {
      success: true,
      data: MOCK_PROJECTS as unknown as T,
      message: "Projects retrieved successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-prj-${Date.now()}` },
    };
  }

  // /projects/:id
  if (clean.startsWith("/projects/") && method === "GET") {
    const id = clean.replace("/projects/", "");
    const project = MOCK_PROJECTS.find((p) => p.id === id || p.project_code === id) || MOCK_PROJECTS[0];
    const detail: ProjectDetailResponse = {
      ...project,
      primary_district_id: "DST-JAI",
      state_id: "IN-RJ",
      possession_percent: (project.total_possession_acres / project.total_land_proposed_acres) * 100,
      total_parcels_count: project.parcels_count,
      verified_parcels_count: Math.round(project.parcels_count * 0.8),
      assessed_parcels_count: Math.round(project.parcels_count * 0.65),
      awards_count: 2,
      disbursed_parcels_count: Math.round(project.parcels_count * 0.5),
      possession_parcels_count: Math.round(project.parcels_count * 0.45),
      total_assessed_compensation_cr: project.compensation_assessed_cr,
      total_awarded_cr: project.compensation_assessed_cr * 0.9,
      total_disbursed_compensation_cr: project.compensation_disbursed_cr,
      outstanding_compensation_cr: project.compensation_assessed_cr - project.compensation_disbursed_cr,
      created_at: "2026-01-15T10:00:00Z",
      alignment_geojson: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [75.7873, 26.9124],
                [75.8200, 27.1500],
                [75.9800, 27.4200],
                [76.1200, 27.7100],
              ],
            },
            properties: { name: project.title },
          },
        ],
      },
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Project details retrieved successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-prj-det-${Date.now()}` },
    };
  }

  // /projects POST (proposal creation)
  if (clean === "/projects" && method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newPrj: ProjectDetailResponse = {
      id: `PRJ-NEW-${Date.now()}`,
      project_code: body.project_code || `PRJ-RJ-${Date.now().toString().slice(-4)}`,
      title: body.title || "New Statutory Land Acquisition Proposal",
      description: body.description || "Centrally monitored acquisition proposal.",
      sponsoring_ministry: body.sponsoring_ministry || "Ministry of Road Transport and Highways (MoRTH)",
      implementing_agency: body.implementing_agency || "National Highways Authority of India (NHAI)",
      current_stage: "SECTION_3A",
      current_stage_name: "Section 3A / Sec 11 Scrutiny Initiated",
      state_id: body.state_id || "IN-RJ",
      state_name: "Rajasthan",
      primary_district_id: body.primary_district_id || "DST-JAI",
      primary_district_name: "Jaipur",
      total_land_proposed_acres: Number(body.total_land_required_acres) || 120,
      total_land_acquired_acres: 0,
      total_possession_acres: 0,
      acquisition_progress_percent: 0,
      possession_percent: 0,
      estimated_budget_inr_cr: Number(body.estimated_project_cost_cr) || 750,
      compensation_assessed_cr: 0,
      compensation_disbursed_cr: 0,
      disbursement_percent: 0,
      total_paf_count: 0,
      total_pdf_count: 0,
      randr_completion_percent: 0,
      risk_score: 10,
      parcels_count: Number(body.expected_parcel_count) || 24,
      status: body.is_draft ? "DRAFT" : "SUBMITTED",
      created_at: new Date().toISOString(),
    };
    return {
      success: true,
      data: newPrj as unknown as T,
      message: "Project proposal submitted successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-create-${Date.now()}` },
    };
  }

  // 2. Action Center endpoints
  if (clean.startsWith("/action-centre/summary") || clean.startsWith("/action-center/summary")) {
    return {
      success: true,
      data: MOCK_ACTION_SUMMARY as unknown as T,
      message: "Action Center summary loaded successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-act-sum-${Date.now()}` },
    };
  }

  if (clean === "/action-centre/actions" || clean === "/action-center/actions") {
    return {
      success: true,
      data: MOCK_ACTION_ITEMS as unknown as T,
      message: "Action items retrieved successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-act-list-${Date.now()}` },
    };
  }

  if (clean.includes("/action-centre/actions/") || clean.includes("/action-center/actions/")) {
    const action = MOCK_ACTION_ITEMS[0];
    const ws: ActionWorkspaceResponse = {
      action_item: action,
      case_summary: {
        project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
        khasra_numbers: ["142/1", "142/2", "143/A", "144/B"],
        village_name: "Sundarpura",
        tehsil_name: "Kotputli",
      },
      required_action: {
        what_needs_to_be_done: "Validate preliminary cadastral boundaries and sign Section 11 endorsement.",
        why_it_is_required: "RFCTLARR 2013 Section 11 statutory notification requirement.",
        information_or_documents_needed: ["Cadastral Survey Map", "Landowners Ledger"],
        what_happens_after_completion: "Notification published in State Gazette.",
        statutory_reference: "RFCTLARR 2013 Sec 11",
      },
      record_information: {
        record_type: "SECTION_11_NOTIFICATION",
        record_reference: "SEC11-RJ-JAI-2026-004",
        title: "Section 11 Preliminary Notification - Kotputli Bypass",
        key_attributes: {
          "Total Khasras": 42,
          "Total Land Area": "35.08 Acres",
          "Village": "Sundarpura",
          "Tehsil": "Kotputli",
        },
      },
      available_actions: [SAMPLE_PRIMARY_ACTION],
      remarks_history: [],
      documents: [],
      workflow_timeline: [],
      audit_history: [
        {
          action: "REWORK_REQUESTED",
          user: "Dr. Amit Sharma, IAS",
          role: "ROLE_DISTRICT_OFFICER",
          timestamp: "2026-03-10T11:00:00Z",
          details: "Chainage KM 142 to KM 148 overlaps with state canal boundary.",
        },
      ],
    };
    return {
      success: true,
      data: ws as unknown as T,
      message: "Action workspace loaded successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-ws-${Date.now()}` },
    };
  }

  // 3. Workflow endpoints
  if (clean === "/workflow/stages") {
    return {
      success: true,
      data: MOCK_WORKFLOW_STAGES as unknown as T,
      message: "Workflow stages retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-wf-stg-${Date.now()}` },
    };
  }

  if (clean.startsWith("/workflow/timeline/")) {
    return {
      success: true,
      data: MOCK_TIMELINE as unknown as T,
      message: "Workflow timeline retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-wf-time-${Date.now()}` },
    };
  }

  if (clean.startsWith("/workflow/tasks")) {
    const tasks: WorkflowTaskItem[] = [
      {
        id: "tsk-01",
        project_id: "PRJ-NH48-PKG4",
        project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
        task_type: "SECTION_11_NOTIFICATION",
        title: "Publish Section 11 Preliminary Notification Gazette",
        assigned_role: "ROLE_DISTRICT_OFFICER",
        status: "IN_REVIEW",
        priority: "HIGH",
        is_overdue: false,
        created_at: "2026-03-08T10:00:00Z",
      },
    ];
    return {
      success: true,
      data: tasks as unknown as T,
      message: "Workflow tasks retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-wf-tasks-${Date.now()}` },
    };
  }

  // 4. Land Parcels & GIS
  if (clean.startsWith("/gis") || clean.startsWith("/parcels/gis")) {
    let projectId = "PRJ-NH48-PKG4";
    const match = clean.match(/\/projects\/([^\/]+)/);
    if (match && match[1]) {
      projectId = match[1];
    }
    const gisData = getGisGeoJsonByProjectId(projectId);
    return {
      success: true,
      data: gisData as unknown as T,
      message: "GIS spatial features retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-gis-${Date.now()}` },
    };
  }

  if (clean === "/parcels") {
    return {
      success: true,
      data: MOCK_PARCELS as unknown as T,
      message: "Land parcels retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-pcl-${Date.now()}` },
    };
  }

  if (clean.startsWith("/parcels/")) {
    const p = MOCK_PARCELS.items[0];
    const parcelDetail: ParcelDetailResponse = {
      ...p,
      sponsoring_ministry: "Ministry of Road Transport and Highways (MoRTH)",
      implementing_agency: "National Highways Authority of India (NHAI)",
      tehsil_name: "Kotputli",
      circle_rate_per_sqm: 1450,
      market_multiplier: 1.5,
      current_workflow_stage: "SECTION_11",
      centroid_latitude: p.centroid[1],
      centroid_longitude: p.centroid[0],
      geojson_polygon: MOCK_GEOJSON_FEATURES.features[0].geometry,
      owners: [
        {
          id: "own-1",
          full_name: "Rameshwar Prasad Sharma",
          relative_name: "Late Ram Dayal Sharma",
          social_category: "GENERAL",
          is_kyc_verified: true,
          masked_aadhaar: "••••••••4129",
          masked_bank_account: "••••••••4819",
          bank_name: "State Bank of India (SBI)",
          ownership_share_percent: 50.0,
          extent_area_acres: 1.05,
          is_primary_contact: true,
        },
        {
          id: "own-2",
          full_name: "Manoj Kumar Sharma",
          relative_name: "Rameshwar Prasad Sharma",
          social_category: "GENERAL",
          is_kyc_verified: true,
          masked_aadhaar: "••••••••9841",
          masked_bank_account: "••••••••7732",
          bank_name: "Punjab National Bank (PNB)",
          ownership_share_percent: 50.0,
          extent_area_acres: 1.05,
          is_primary_contact: false,
        },
      ],
      field_verifications: [
        {
          id: "fv-1",
          verification_date: "2026-03-01",
          verified_by_name: "Shri Rameshwar Lal, Patwari",
          verified_by_role: "PATWARI_SURVEYOR",
          ground_survey_notes: "Khasra boundaries intact, no unauthorized structural encroachers.",
          trees_count: 14,
          structures_count: 1,
          wells_count: 1,
          verification_status: "VERIFIED",
        },
      ],
      recent_activity: [
        { id: 1, action: "Section 11 Preliminary Notification Published", timestamp: "2026-02-28T10:00:00Z" },
        { id: 2, action: "Field Joint Measurement Completed", timestamp: "2026-03-01T15:00:00Z" },
      ],
      can_verify: true,
    };
    return {
      success: true,
      data: parcelDetail as unknown as T,
      message: "Parcel details loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-pcl-det-${Date.now()}` },
    };
  }

  // 5. Compensation
  if (clean === "/compensation") {
    return {
      success: true,
      data: MOCK_COMPENSATIONS as unknown as T,
      message: "Compensation assessments retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-cmp-${Date.now()}` },
    };
  }

  if (clean === "/compensation/calculate" && method === "POST") {
    const calc: CompensationCalculationBreakdown = {
      area_sqm: 8498.4,
      circle_rate_per_sqm: 1450,
      base_land_value_inr: 12322680,
      multiplier_factor: 1.5,
      market_value_land_inr: 18484020,
      assets_value_inr: 450000,
      solatium_rate_percent: 100,
      solatium_inr: 18934020,
      statutory_additional_rate_percent: 12,
      statutory_period_days: 90,
      additional_market_value_inr: 546875,
      total_compensation_inr: 38414915,
      components: [
        { component_name: "Market Value of Land (RFCTLARR Sec 26)", statutory_basis: "Sec 26(1)", amount_inr: 18484020, formula_description: "Base Area × Circle Rate × Rural Multiplier (1.5)" },
        { component_name: "Attached Assets Valuation (Trees/Well)", statutory_basis: "Sec 29", amount_inr: 450000, formula_description: "14 Teak Trees + 1 Borewell net depreciated valuation" },
        { component_name: "Solatium (100% on Total Value)", statutory_basis: "Sec 30(1)", amount_inr: 18934020, percentage_or_rate: 100, formula_description: "100% of (Market Value + Asset Value)" },
        { component_name: "Additional Market Value (12% per annum)", statutory_basis: "Sec 30(3)", amount_inr: 546875, percentage_or_rate: 12, formula_description: "12% p.a. from Sec 11 to Award date" },
      ],
      calculation_summary: "Statutory assessment computed in compliance with RFCTLARR 2013 First Schedule.",
    };
    return {
      success: true,
      data: calc as unknown as T,
      message: "Compensation calculated successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-cmp-calc-${Date.now()}` },
    };
  }

  if (clean.startsWith("/compensation/")) {
    const cmp = MOCK_COMPENSATIONS[0];
    const detail: CompensationAssessmentDetail = {
      ...cmp,
      project_code: "PRJ-NH48-PKG4",
      khata_number: "58",
      land_type: "AGRICULTURAL_IRRIGATED",
      circle_rate_per_sqm: 1450,
      multiplier_factor: 1.5,
      base_land_value_inr: 6150000,
      market_value_land_inr: 9225000,
      assets_value_inr: 250000,
      solatium_inr: 9475000,
      additional_market_value_inr: 250000,
      breakdown: {
        area_sqm: cmp.acquired_area_sqm,
        circle_rate_per_sqm: 1450,
        base_land_value_inr: 6150000,
        multiplier_factor: 1.5,
        market_value_land_inr: 9225000,
        assets_value_inr: 250000,
        solatium_rate_percent: 100,
        solatium_inr: 9475000,
        statutory_additional_rate_percent: 12,
        statutory_period_days: 90,
        additional_market_value_inr: 250000,
        total_compensation_inr: cmp.total_compensation_inr,
        components: [
          { component_name: "Land Market Value", statutory_basis: "Sec 26", amount_inr: 9225000, formula_description: "Base Area × Rate × 1.5 Multiplier" },
          { component_name: "Solatium (100%)", statutory_basis: "Sec 30(1)", amount_inr: 9475000, formula_description: "100% Solatium on Land + Assets" },
        ],
        calculation_summary: "Statutory compensation worksheet approved by CALA.",
      },
      asset_valuations: [
        { id: "ast-1", assessment_id: cmp.id, asset_category: "TREES", description: "14 Mature Teak Trees", quantity: 14, unit: "Trees", unit_rate_inr: 10000, total_asset_value_inr: 140000, depreciation_inr: 0, net_asset_value_inr: 140000 },
        { id: "ast-2", assessment_id: cmp.id, asset_category: "WELL", description: "Borewell with Submersible Pump", quantity: 1, unit: "Unit", unit_rate_inr: 110000, total_asset_value_inr: 110000, depreciation_inr: 0, net_asset_value_inr: 110000 },
      ],
      owners: [
        { id: "own-1", full_name: "Rameshwar Prasad Sharma", ownership_share_percent: 50.0, masked_bank_account: "••••••••4819", masked_bank_ifsc: "SBIN000••••", is_kyc_verified: true },
        { id: "own-2", full_name: "Manoj Kumar Sharma", ownership_share_percent: 50.0, masked_bank_account: "••••••••7732", masked_bank_ifsc: "PUNB002••••", is_kyc_verified: true },
      ],
      updated_at: "2026-03-02T15:00:00Z",
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Compensation detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-cmp-det-${Date.now()}` },
    };
  }

  // 6. Awards
  if (clean === "/awards") {
    return {
      success: true,
      data: MOCK_AWARDS as unknown as T,
      message: "Awards retrieved.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-awd-${Date.now()}` },
    };
  }

  if (clean.startsWith("/awards/")) {
    const awd = MOCK_AWARDS[0];
    const detail: AwardDetail = {
      ...awd,
      district_name: "Jaipur",
      state_name: "Rajasthan",
      cala_user_id: "usr-dist-jai",
      cala_designation: "Competent Authority for Land Acquisition (CALA) & ADM Jaipur",
      digital_sign_hash: "SHA256:8f4c2b9a7e1d5f3c8b4a2e6f9d1a3c5b7e9f1a3c5b7e9f1a3c5b7e9f1a3c5b7e",
      approval_stamp_label: "AUTHENTICATED CALA e-SIGN",
      approved_by_user_name: "Shri Jitendra Kumar Soni, IAS",
      approval_date: "2026-03-05T10:00:00Z",
      parcels: [
        { parcel_id: "PCL-RJ-JAI-001", khasra_number: "142/1", village_name: "Sundarpura", acquired_area_sqm: 8498.4, compensation_assessment_id: "CMP-RJ-JAI-001", assessed_amount_inr: 18450000, owner_names: ["Rameshwar Prasad Sharma", "Manoj Kumar Sharma"] },
      ],
      total_disbursed_inr: 18450000,
      remaining_inr: 44050000,
      disbursement_percent: 29.5,
      updated_at: "2026-03-05T10:00:00Z",
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Award detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-awd-det-${Date.now()}` },
    };
  }

  // 7. Disbursements
  if (clean.startsWith("/disbursements/summary/")) {
    const summary: FinancialReconciliationSummary = {
      reference_id: "SUM-NH48-PKG4",
      reference_title: "NH-48 Package 4 Disbursement Summary",
      total_assessed_inr: 62500000,
      total_awarded_inr: 62500000,
      total_disbursed_inr: 18450000,
      outstanding_inr: 44050000,
      disbursement_percent: 29.5,
      total_beneficiaries_count: 28,
      disbursed_beneficiaries_count: 8,
      pending_beneficiaries_count: 20,
      reconciliation_status: "RECONCILED",
    };
    return {
      success: true,
      data: summary as unknown as T,
      message: "Reconciliation summary loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-dsb-sum-${Date.now()}` },
    };
  }

  if (clean === "/disbursements") {
    return {
      success: true,
      data: MOCK_DISBURSEMENTS as unknown as T,
      message: "Disbursements loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-dsb-${Date.now()}` },
    };
  }

  if (clean.startsWith("/disbursements/")) {
    const dsb = MOCK_DISBURSEMENTS[0];
    const detail: DisbursementDetail = {
      ...dsb,
      payment_workflow_label: "PFMS Direct Benefit Transfer (DBT)",
      award_amount_inr: 62500000,
      project_code: "PRJ-NH48-PKG4",
      district_name: "Jaipur",
      state_name: "Rajasthan",
      bank_name: "State Bank of India",
      social_category: "GENERAL",
      is_kyc_verified: true,
      processed_by_user_name: "Shri Jitendra Kumar Soni, IAS",
      updated_at: "2026-03-08T16:45:00Z",
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Disbursement detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-dsb-det-${Date.now()}` },
    };
  }

  // 8. Possession
  if (clean === "/possession") {
    return {
      success: true,
      data: MOCK_POSSESSIONS as unknown as T,
      message: "Possessions loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-pos-${Date.now()}` },
    };
  }

  if (clean.startsWith("/possession/")) {
    const pos = MOCK_POSSESSIONS[0];
    const detail: PossessionDetail = {
      ...pos,
      state_name: "Rajasthan",
      khata_number: "58",
      acquired_area_sqm: 8498.4,
      area_acres: 2.10,
      land_type: "AGRICULTURAL_IRRIGATED",
      award_number: "AWD/2026/NH48/JAIPUR/001",
      certificate_number: "CERT-POS-2026-RJ-0012",
      taken_by_agency_officer_id: "usr-nhai-pd",
      taken_by_organization: "NHAI PIU Jaipur",
      handed_over_by_cala_id: "usr-dist-jai",
      prerequisite_checks: [
        { check_name: "100% Compensation Disbursed via PFMS", is_satisfied: true, status_label: "COMPLETED", details: "All co-owners received verified DBT transfers." },
        { check_name: "Form J Possession Certificate Executed", is_satisfied: true, status_label: "COMPLETED", details: "Signed jointly by CALA and Project Director NHAI." },
        { check_name: "Revenue Record Mutation Endorsed", is_satisfied: true, status_label: "COMPLETED", details: "Land mutated in favor of Central Govt / NHAI." },
      ],
      updated_at: "2026-03-09T14:00:00Z",
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Possession detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-pos-det-${Date.now()}` },
    };
  }

  // 9. R&R Schemes and PAF
  if (clean === "/r-and-r") {
    return {
      success: true,
      data: MOCK_RR_SCHEMES as unknown as T,
      message: "R&R schemes loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-rr-${Date.now()}` },
    };
  }

  if (clean.startsWith("/r-and-r/")) {
    const sch = MOCK_RR_SCHEMES[0];
    const detail: RAndRSchemeDetail = {
      ...sch,
      state_name: "Rajasthan",
      district_name: "Jaipur",
      approval_date: "2026-01-25T11:00:00Z",
      approved_by_name: "Dr. Rajeshwar Singh, IAS",
      kpis: {
        total_affected_families: 64,
        eligible_families: 64,
        approved_families: 64,
        allocated_families: 52,
        completed_families: 48,
        completion_percent: 75.0,
      },
      families: MOCK_AFFECTED_FAMILIES,
      allotments: [
        {
          id: "alt-01",
          family_id: "PAF-RJ-001",
          allotment_reference: "ALT/2026/SND/01",
          entitlement_category: "RESIDENTIAL_PLOT",
          allotment_type: "PLOT",
          asset_identifier: "Plot #12, Sundarpura Resettlement Colony",
          allotment_order_no: "ORD-RR-2026-081",
          status: "DELIVERED",
          created_at: "2026-02-15T10:00:00Z",
        },
      ],
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "R&R scheme detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-rr-det-${Date.now()}` },
    };
  }

  if (clean === "/affected-families") {
    return {
      success: true,
      data: MOCK_AFFECTED_FAMILIES as unknown as T,
      message: "Affected families loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-paf-${Date.now()}` },
    };
  }

  if (clean.startsWith("/affected-families/")) {
    const fam = MOCK_AFFECTED_FAMILIES[0];
    const detail: AffectedFamilyDetail = {
      ...fam,
      contact_masked: "+91-98••••4120",
      family_members_count: 5,
      entitled_plot_sqyd: 150,
      transportation_allowance_inr: 50000,
      one_time_resettlement_allowance_inr: 50000,
      eligibility_assessment_date: "2026-02-05T10:00:00Z",
      assessing_authority: "CALA Jaipur & SIA Unit",
      eligibility_basis: "RFCTLARR 2013 Second Schedule Clause 1(a)",
      acquisition_trace: {
        project_id: "PRJ-NH48-PKG4",
        project_code: "PRJ-NH48-PKG4",
        project_title: "NH-48 6-Laning & Jaipur Western Ring Road Connector",
        parcel_id: "PCL-RJ-JAI-001",
        khasra_number: "142/1",
        parcel_area_sqm: 8498.4,
        owner_name: "Rameshwar Prasad Sharma",
        compensation_id: "CMP-RJ-JAI-001",
        compensation_reference: "CMP/2026/NH48/0014",
        compensation_total_inr: 18450000,
        award_id: "AWD-RJ-JAI-001",
        award_number: "AWD/2026/NH48/JAIPUR/001",
        disbursement_id: "DSB-2026-001",
        disbursement_reference: "DSB/2026/NH48/0088",
        possession_id: "POS-2026-001",
        possession_reference: "POS/2026/NH48/JAI/01",
        scheme_id: "SCH-RJ-NH48-01",
        scheme_title: "Kotputli-Shahpura Bypass Resettlement & Livelihood Scheme",
      },
      allotments: [
        {
          id: "alt-01",
          family_id: fam.id,
          allotment_reference: "ALT/2026/SND/01",
          entitlement_category: "RESIDENTIAL_PLOT",
          allotment_type: "PLOT",
          asset_identifier: "Plot #12, Sundarpura Resettlement Colony",
          allotment_order_no: "ORD-RR-2026-081",
          status: "DELIVERED",
          created_at: "2026-02-15T10:00:00Z",
        },
      ],
    };
    return {
      success: true,
      data: detail as unknown as T,
      message: "Affected family detail loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-paf-det-${Date.now()}` },
    };
  }

  // 10. Analytics & Reports
  if (clean === "/analytics/overview") {
    return {
      success: true,
      data: MOCK_NATIONAL_ANALYTICS as unknown as T,
      message: "Analytics overview loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-anl-ov-${Date.now()}` },
    };
  }

  if (clean === "/analytics/states") {
    return {
      success: true,
      data: MOCK_STATE_ANALYTICS as unknown as T,
      message: "State analytics loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-anl-st-${Date.now()}` },
    };
  }

  if (clean === "/analytics/districts") {
    const districts: DistrictAnalyticsItem[] = [
      { district_id: "DST-JAI", district_name: "Jaipur", state_name: "Rajasthan", project_count: 4, land_proposed_acres: 810.0, land_acquired_acres: 637.5, acquisition_percent: 78.7, compensation_assessed_cr: 291.9, compensation_disbursed_cr: 253.4, disbursement_percent: 86.8, possession_acres: 512.4, affected_families_count: 820, randr_completion_percent: 78.0 },
      { district_id: "DST-PUN", district_name: "Pune", state_name: "Maharashtra", project_count: 3, land_proposed_acres: 620.0, land_acquired_acres: 540.0, acquisition_percent: 87.1, compensation_assessed_cr: 380.0, compensation_disbursed_cr: 320.0, disbursement_percent: 84.2, possession_acres: 480.0, affected_families_count: 950, randr_completion_percent: 85.3 },
    ];
    return {
      success: true,
      data: districts as unknown as T,
      message: "District analytics loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-anl-dst-${Date.now()}` },
    };
  }

  if (clean === "/analytics/timeseries") {
    const ts: TimeSeriesResponse = {
      data_points: [
        { period_label: "Oct 2025", date_iso: "2025-10-01", projects_initiated: 2, land_acquired_acres_cumulative: 45.0, compensation_disbursed_cr_cumulative: 18.2, possession_acres_cumulative: 30.0, randr_settled_cumulative: 120 },
        { period_label: "Nov 2025", date_iso: "2025-11-01", projects_initiated: 4, land_acquired_acres_cumulative: 110.0, compensation_disbursed_cr_cumulative: 42.5, possession_acres_cumulative: 75.0, randr_settled_cumulative: 280 },
        { period_label: "Dec 2025", date_iso: "2025-12-01", projects_initiated: 7, land_acquired_acres_cumulative: 180.0, compensation_disbursed_cr_cumulative: 65.0, possession_acres_cumulative: 120.0, randr_settled_cumulative: 450 },
        { period_label: "Jan 2026", date_iso: "2026-01-01", projects_initiated: 9, land_acquired_acres_cumulative: 230.0, compensation_disbursed_cr_cumulative: 78.4, possession_acres_cumulative: 165.0, randr_settled_cumulative: 680 },
        { period_label: "Feb 2026", date_iso: "2026-02-01", projects_initiated: 11, land_acquired_acres_cumulative: 265.0, compensation_disbursed_cr_cumulative: 89.0, possession_acres_cumulative: 195.0, randr_settled_cumulative: 810 },
        { period_label: "Mar 2026", date_iso: "2026-03-01", projects_initiated: 12, land_acquired_acres_cumulative: 286.2, compensation_disbursed_cr_cumulative: 98.4, possession_acres_cumulative: 210.5, randr_settled_cumulative: 890 },
      ],
      time_horizon_note: "Cumulative 6-month statutory progress trajectory",
      source_database_status: "LIVE_RECONCILED",
    };
    return {
      success: true,
      data: ts as unknown as T,
      message: "Time series data loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-ts-${Date.now()}` },
    };
  }

  if (clean === "/analytics/bottlenecks") {
    const bottlenecks: BottleneckItem[] = [
      {
        project_id: "PRJ-METRO-PH2",
        project_code: "PRJ-METRO-PH2",
        title: "Jaipur Metro Phase-2 Corridor (Sitapura to Ambabari via Tonk Road)",
        state_name: "Rajasthan",
        district_name: "Jaipur",
        current_stage: "SECTION_15",
        severity: "AT_RISK",
        primary_reason: "High volume of Section 15 commercial property objections in Sitapura zone.",
        overdue_tasks_count: 3,
        outstanding_compensation_cr: 14.5,
        disputed_parcels_count: 6,
        pending_rr_families_count: 42,
        risk_score: 68,
      },
    ];
    return {
      success: true,
      data: bottlenecks as unknown as T,
      message: "Bottlenecks loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-btn-${Date.now()}` },
    };
  }

  if (clean === "/analytics/data-quality") {
    return {
      success: true,
      data: MOCK_NATIONAL_ANALYTICS.data_quality_summary as unknown as T,
      message: "Data quality checks loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-dq-${Date.now()}` },
    };
  }

  if (clean === "/risk/overview") {
    const riskOverview: RiskOverviewResponse = {
      scope_level: "NATIONAL",
      jurisdiction_name: "All India",
      distribution: { low_count: 8, moderate_count: 3, high_count: 1, critical_count: 0, total_projects: 12 },
      top_high_risk_projects: [
        {
          project_id: "PRJ-METRO-PH2",
          project_code: "PRJ-METRO-PH2",
          title: "Jaipur Metro Phase-2 Corridor",
          state_name: "Rajasthan",
          district_name: "Jaipur",
          risk_score: 68,
          risk_level: "HIGH",
          primary_driver: "Commercial corridor objection settlement delay",
          recommended_action: "Convene Special CALA Lok Adalat for expedited hearing of Section 15 objections.",
        },
      ],
      factor_benchmarks: [
        { factor_id: "F1", name: "SLA Adherence Ratio", weight: "30%", description: "Days elapsed vs RFCTLARR statutory timeline ceiling." },
        { factor_id: "F2", name: "Disbursement Velocity", weight: "25%", description: "Percentage of Awarded funds credited to beneficiaries." },
        { factor_id: "F3", name: "R&R Settlement Ratio", weight: "25%", description: "Displaced families rehabilitated per Schedule II." },
        { factor_id: "F4", name: "Litigation & Dispute Density", weight: "20%", description: "Proportion of khasras under judicial stay or dispute." },
      ],
      methodology_note: "NLAMS Multi-criteria AI statutory risk scoring model v3.2",
    };
    return {
      success: true,
      data: riskOverview as unknown as T,
      message: "Risk overview loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-rsk-${Date.now()}` },
    };
  }

  if (clean === "/reports/types") {
    return {
      success: true,
      data: MOCK_REPORT_TYPES as unknown as T,
      message: "Report types loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-rep-types-${Date.now()}` },
    };
  }

  if (clean === "/reports/preview" || (clean.startsWith("/reports") && method === "POST")) {
    const preview: ReportPreviewResponse = {
      report_id: "REP-PREV-01",
      report_title: "National Statutory Acquisition Progress Report",
      report_code: "NATIONAL_ACQUISITION_PROGRESS",
      scope_jurisdiction: "All India (National Command View)",
      generated_at: new Date().toISOString(),
      filter_summary: { state: "All States", status: "All Statuses" },
      summary_kpis: [
        { label: "Total Projects", value: "12", subtitle: "Active Corridors" },
        { label: "Land Acquired", value: "286.2 ac", subtitle: "66.8% of Target" },
        { label: "DBT Disbursed", value: "INR 98.4 Cr", subtitle: "69.1% of Awarded" },
      ],
      columns: [
        { key: "project_code", label: "Project Code", align: "left", is_numeric: false },
        { key: "title", label: "Project Title", align: "left", is_numeric: false },
        { key: "state_name", label: "State", align: "left", is_numeric: false },
        { key: "current_stage_name", label: "Statutory Stage", align: "left", is_numeric: false },
        { key: "total_land_proposed_acres", label: "Proposed (Ac)", align: "right", is_numeric: true },
        { key: "total_land_acquired_acres", label: "Acquired (Ac)", align: "right", is_numeric: true },
        { key: "acquisition_progress_percent", label: "Progress (%)", align: "right", is_numeric: true },
        { key: "compensation_disbursed_cr", label: "Disbursed (Cr)", align: "right", is_numeric: true },
      ],
      rows: MOCK_PROJECTS.map((p) => ({
        project_code: p.project_code,
        title: p.title,
        state_name: p.state_name,
        current_stage_name: p.current_stage_name,
        total_land_proposed_acres: p.total_land_proposed_acres,
        total_land_acquired_acres: p.total_land_acquired_acres,
        acquisition_progress_percent: `${p.acquisition_progress_percent}%`,
        compensation_disbursed_cr: `₹${p.compensation_disbursed_cr}`,
      })),
      total_records: MOCK_PROJECTS.length,
      page: 1,
      page_size: 25,
      total_pages: 1,
    };
    return {
      success: true,
      data: preview as unknown as T,
      message: "Report preview generated successfully.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-rep-prev-${Date.now()}` },
    };
  }

  // 11. Master Data
  if (clean === "/master-data/states") {
    const states = [
      { id: "IN-RJ", name: "Rajasthan", code: "RJ" },
      { id: "IN-MH", name: "Maharashtra", code: "MH" },
      { id: "IN-UP", name: "Uttar Pradesh", code: "UP" },
      { id: "IN-GJ", name: "Gujarat", code: "GJ" },
      { id: "IN-KA", name: "Karnataka", code: "KA" },
      { id: "IN-TN", name: "Tamil Nadu", code: "TN" },
    ];
    return {
      success: true,
      data: states as unknown as T,
      message: "States loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-mst-st-${Date.now()}` },
    };
  }

  if (clean.startsWith("/master-data/districts")) {
    const districts = [
      { id: "DST-JAI", name: "Jaipur", state_id: "IN-RJ" },
      { id: "DST-PUN", name: "Pune", state_id: "IN-MH" },
      { id: "DST-LKO", name: "Lucknow", state_id: "IN-UP" },
      { id: "DST-AMD", name: "Ahmedabad", state_id: "IN-GJ" },
      { id: "DST-BLR", name: "Bengaluru Urban", state_id: "IN-KA" },
      { id: "DST-CHE", name: "Chennai", state_id: "IN-TN" },
    ];
    return {
      success: true,
      data: districts as unknown as T,
      message: "Districts loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-mst-dst-${Date.now()}` },
    };
  }

  // 12. Notifications
  if (clean.startsWith("/notifications")) {
    const notifs = [
      {
        id: "notif-1",
        title: "Section 11 Preliminary Notification Endorsed",
        message: "CALA Jaipur has forwarded Section 11 preliminary boundary survey for NH-48 Pkg 4.",
        category: "STATUTORY_WORKFLOW",
        severity: "INFO",
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: "/action-centre",
      },
      {
        id: "notif-2",
        title: "PFMS Direct Benefit Transfer Batch Disbursed",
        message: "INR 1.84 Cr credited to 8 landowners under Section 23 Award #001.",
        category: "FINANCIAL",
        severity: "SUCCESS",
        is_read: false,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        action_url: "/disbursement",
      },
    ];
    return {
      success: true,
      data: (clean.includes("/unread") ? { count: 2, items: notifs } : notifs) as unknown as T,
      message: "Notifications loaded.",
      metadata: { timestamp: new Date().toISOString(), request_id: `mock-notif-${Date.now()}` },
    };
  }

  // Default fallback for any unhandled statutory endpoint
  return {
    success: true,
    data: ([] as unknown) as T,
    message: "Canonical statutory data synchronized.",
    metadata: { timestamp: new Date().toISOString(), request_id: `mock-def-${Date.now()}` },
  };
}
