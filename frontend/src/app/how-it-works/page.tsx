"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Users,
  Compass,
  Scale,
  FileText,
  MapPin,
  Landmark,
} from "lucide-react";

interface StageInfo {
  num: string;
  code: string;
  title: string;
  statutoryRef: string;
  timelineDays: number;
  stakeholder: string;
  whatHappens: string;
  keyInfoGenerated: string[];
  expectedOutput: string;
}

const STATUTORY_STAGES: StageInfo[] = [
  {
    num: "01",
    code: "PROPOSAL",
    title: "Project Proposal & DPR Submission",
    statutoryRef: "Statutory Initiation",
    timelineDays: 30,
    stakeholder: "Project Implementing Agency (e.g., NHAI, Railways, Metro)",
    whatHappens:
      "The implementing agency submits the corridor alignment proposal, Detailed Project Report (DPR), proposed Right of Way (ROW) width, and estimated budgetary allocation.",
    keyInfoGenerated: [
      "Corridor alignment boundary shapefiles",
      "Tentative revenue village list",
      "Estimated land acquisition acreage requirement",
      "Projected capital expenditure estimate",
    ],
    expectedOutput: "Formal Project Ingestion & Administrative Tracking ID",
  },
  {
    num: "02",
    code: "SCRUTINY",
    title: "Initial Scrutiny & SIA Feasibility",
    statutoryRef: "Section 4 / SIA Feasibility",
    timelineDays: 45,
    stakeholder: "State Revenue Department / Central Ministry",
    whatHappens:
      "Competent administrative authorities review the alignment for forest/environmental overlaps, evaluate Social Impact Assessment (SIA) feasibility, and verify multi-crop agricultural exemptions.",
    keyInfoGenerated: [
      "Social Impact Assessment (SIA) summary report",
      "Environmental & forest clearance status",
      "Expert committee feasibility recommendation",
      "Corridor administrative sanction order",
    ],
    expectedOutput: "Corridor Administrative Sanction & Competent Authority (CALA) Notification",
  },
  {
    num: "03",
    code: "LAND_IDENTIFICATION",
    title: "Cadastral Land Identification",
    statutoryRef: "Cadastral Mapping / Jamabandi",
    timelineDays: 60,
    stakeholder: "District CALA & Tehsil Revenue Staff",
    whatHappens:
      "Revenue authorities map the approved corridor alignment onto digitised village cadastral maps (Jamabandi/Khasra), identifying exact survey parcel boundaries, land tenure classification, and registered titleholders.",
    keyInfoGenerated: [
      "Khasra/Survey parcel inventory with acreage breakdown",
      "Land classification (Agricultural, Commercial, Residential, Govt)",
      "Registered landowner and tenure-holder names",
      "Georeferenced PostGIS parcel polygon boundaries",
    ],
    expectedOutput: "Preliminary Land Schedule & Parcel Geospatial Master",
  },
  {
    num: "04",
    code: "LAND_VERIFICATION",
    title: "Physical Ground Verification & Census",
    statutoryRef: "Ground Survey & Asset Enumeration",
    timelineDays: 45,
    stakeholder: "Field Verification Officers & Revenue Surveyors",
    whatHappens:
      "Field teams conduct physical ground surveys of each parcel, enumerating immovable assets including structures, houses, standing timber/fruit trees, tube-wells, and identifying title or boundary discrepancies.",
    keyInfoGenerated: [
      "Structure count, plinth area, and construction type",
      "Tree census (timber and commercial fruit trees)",
      "Water extraction assets (borewells, open wells, canals)",
      "GPS coordinates and field discrepancy logs",
    ],
    expectedOutput: "Signed Field Verification Report & Discrepancy Matrix",
  },
  {
    num: "05",
    code: "NOTIFICATION",
    title: "Section 11 Preliminary Notification",
    statutoryRef: "RFCTLARR Act 2013 — Section 11(1)",
    timelineDays: 30,
    stakeholder: "Appropriate Government / District Collector",
    whatHappens:
      "Official Gazette notification published in the Official Gazette and two daily newspapers declaring the preliminary intent to acquire specified parcels for public infrastructure.",
    keyInfoGenerated: [
      "Gazette notification number and publication date",
      "Public notice in Gram Panchayats and local offices",
      "Freezing of land transactions and private encumbrances",
      "Formal cutoff date for titleholder entitlements",
    ],
    expectedOutput: "Gazette Published Section 11 Notification Document",
  },
  {
    num: "06",
    code: "OBJECTIONS_HEARING",
    title: "Section 15 Objections & Public Hearings",
    statutoryRef: "RFCTLARR Act 2013 — Section 15(1)-(2)",
    timelineDays: 60,
    stakeholder: "Competent Authority for Land Acquisition (CALA)",
    whatHappens:
      "Statutory 60-day window for any person interested to submit objections regarding corridor alignment, public purpose, area measurements, or title rights. CALA conducts formal public hearings.",
    keyInfoGenerated: [
      "Register of formal objections filed",
      "Public hearing minutes and petitioner submissions",
      "Technical alignment feasibility reassessments",
      "Statutory objection disposal orders signed by CALA",
    ],
    expectedOutput: "Section 15 Hearing Disposal Report & Final Boundary Order",
  },
  {
    num: "07",
    code: "COMPENSATION_ASSESSMENT",
    title: "Compensation & Valuation Assessment",
    statutoryRef: "RFCTLARR Act 2013 — First Schedule",
    timelineDays: 45,
    stakeholder: "CALA & Approved Valuation Committee",
    whatHappens:
      "Determination of market value based on circle rates or recent sale deeds, multiplied by rural factor (1.0x - 2.0x), addition of 100% Solatium, asset valuation for structures/trees, and 12% additional interest.",
    keyInfoGenerated: [
      "Base land market value per square meter/acre",
      "Solatium calculation (100% of market value)",
      "Asset valuation sheets (PWD structure rates, Forest tree rates)",
      "Gross compensation amount per khasra and co-sharer",
    ],
    expectedOutput: "Detailed Statutory Valuation Matrix & Financial Summary",
  },
  {
    num: "08",
    code: "AWARD_ENQUIRY",
    title: "Section 23/30 Award Pronouncement",
    statutoryRef: "RFCTLARR Act 2013 — Section 23 & 30",
    timelineDays: 30,
    stakeholder: "District Collector / CALA",
    whatHappens:
      "Formal enquiry into title claims, apportionment of compensation among multiple co-owners, and final statutory award pronouncement fixing individual legal entitlements.",
    keyInfoGenerated: [
      "Official Award Order signed by Competent Authority",
      "Apportionment register allocating specific share percentages",
      "Beneficiary bank account details for direct credit",
      "Reference list for disputed titles referred to Land Authority (Sec 64)",
    ],
    expectedOutput: "Signed Section 23/30 Statutory Award Decree",
  },
  {
    num: "09",
    code: "COMPENSATION_DISBURSEMENT",
    title: "Electronic PFMS DBT Disbursement",
    statutoryRef: "RFCTLARR Act 2013 — Section 77",
    timelineDays: 30,
    stakeholder: "CALA Treasury & Implementing Agency (PFMS / e-Kuber)",
    whatHappens:
      "Implementing agency deposits awarded compensation funds into dedicated escrow/treasury accounts. Funds are electronically credited directly into verified landowner bank accounts via PFMS.",
    keyInfoGenerated: [
      "PFMS payment transaction reference numbers",
      "Electronic acknowledgment receipts from banks",
      "Disbursement status per parcel and beneficiary",
      "Escrow balance and interest reconciliation records",
    ],
    expectedOutput: "PFMS Electronic Payment Scrolls & 100% Audit Reconciliation",
  },
  {
    num: "10",
    code: "POSSESSION",
    title: "Section 38 Physical Possession Takeover",
    statutoryRef: "RFCTLARR Act 2013 — Section 38(1)",
    timelineDays: 30,
    stakeholder: "CALA Revenue Staff & Implementing Agency Engineers",
    whatHappens:
      "Collector takes formal physical possession of the land free from all encumbrances only after full compensation has been paid or deposited, and hands over right of way to the project agency.",
    keyInfoGenerated: [
      "Section 38 Possession Certificate (Panchnama)",
      "Right of Way (ROW) boundary handover coordinate logs",
      "Site photographs evidencing vacant possession",
      "Demolition / clearance authorizations for structures",
    ],
    expectedOutput: "Signed Section 38 Possession Panchnama & Handover Order",
  },
  {
    num: "11",
    code: "REHABILITATION_RESETTLEMENT",
    title: "Rehabilitation & Resettlement (R&R)",
    statutoryRef: "RFCTLARR Act 2013 — Second Schedule",
    timelineDays: 90,
    stakeholder: "Administrator for Rehabilitation & Resettlement",
    whatHappens:
      "Implementation of approved R&R scheme for displaced families: provision of alternative residential plots/houses, subsistence grants, cattle shed allowances, and community infrastructure at resettlement colonies.",
    keyInfoGenerated: [
      "Displaced family entitlement register",
      "Resettlement housing allotment letters",
      "Subsistence grant disbursement receipts",
      "Resettlement colony social infrastructure audit",
    ],
    expectedOutput: "R&R Scheme Completion Certificate & Citizen Rehabilitation Audit",
  },
  {
    num: "12",
    code: "COMPLETION",
    title: "Revenue Mutation & Project Completion",
    statutoryRef: "State Land Revenue Code & Final Gazette",
    timelineDays: 30,
    stakeholder: "District Collector, Tehsildar & Project Agency",
    whatHappens:
      "Revenue authorities carry out official mutation of acquired land records transferring legal title to the Government of India or acquiring body. Final Gazette completion notice is published.",
    keyInfoGenerated: [
      "Updated Jamabandi / RoR mutation entries in state revenue records",
      "Final Right of Way completion boundary certificates",
      "Complete project audit closure summary",
      "Final gazette notification of completion",
    ],
    expectedOutput: "Completed Revenue Mutation Record & Final Closure Decree",
  },
];

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState<string>("01");

  const selectedStage = STATUTORY_STAGES.find((s) => s.num === activeStage) || STATUTORY_STAGES[0];

  return (
    <div className="bg-[#F8FAFC] text-slate-900">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold uppercase tracking-wider mb-4">
            <span>Statutory Lifecycle Architecture</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            How Land Acquisition Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl">
            A comprehensive, transparent breakdown of the 12 statutory acquisition stages under the RFCTLARR Act, 2013 — from preliminary corridor alignment to revenue record mutation.
          </p>
        </div>
      </section>

      {/* Main Interactive Stepper & Stage Explorer */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stage Selector List */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Statutory 12-Stage Pipeline
            </h3>
            <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1">
              {STATUTORY_STAGES.map((s) => {
                const isSelected = s.num === activeStage;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveStage(s.num)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-white border-[#138808] shadow-sm ring-1 ring-[#138808]/30"
                        : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-[#138808] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.num}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.statutoryRef}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-3.5 w-3.5 ${
                        isSelected ? "text-[#138808]" : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Stage 360° Detail Card */}
          <div className="lg:col-span-7 sticky top-24 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header of Stage */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#138808] uppercase tracking-wider">
                  Stage {selectedStage.num} • {selectedStage.code}
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Target SLA: {selectedStage.timelineDays} Days
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-950">
                {selectedStage.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                <Scale className="h-3.5 w-3.5 text-[#138808]" />
                <span>Statutory Mandate: {selectedStage.statutoryRef}</span>
              </div>
            </div>

            {/* Stakeholder */}
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Responsible Statutory Stakeholder
              </span>
              <p className="text-xs font-bold text-slate-900">{selectedStage.stakeholder}</p>
            </div>

            {/* What Happens */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What Happens in this Stage
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {selectedStage.whatHappens}
              </p>
            </div>

            {/* Key Information Generated */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Information &amp; Data Generated
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedStage.keyInfoGenerated.map((info, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#138808] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{info}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Output */}
            <div className="space-y-1.5 bg-emerald-50/70 p-4 rounded-lg border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-[#138808] tracking-wider block">
                Statutory Deliverable / Milestone Output
              </span>
              <p className="text-xs font-bold text-emerald-950">{selectedStage.expectedOutput}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Explore Real Aggregated Data</h4>
            <p className="text-xs text-slate-400 mt-1">
              See how these 12 stages translate into actual corridor metrics on the Public Transparency page.
            </p>
          </div>
          <Link
            href="/transparency"
            className="inline-flex items-center gap-2 rounded-lg bg-[#138808] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors shrink-0"
          >
            <span>Go to Transparency Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
