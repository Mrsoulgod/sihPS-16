"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  UserCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  ArrowLeft,
  Layers,
  Sparkles,
  Loader2,
  Crown,
  Globe2,
  MapPin,
  Building,
  Users,
  Compass,
  FileCheck2,
  Award,
  ChevronRight,
  Briefcase,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

// ==========================================
// 1. CENTRAL LEADERSHIP SUITE (5 PROFILES)
// ==========================================
const CENTRAL_MEMBERS = [
  {
    id: "central_js",
    username: "central_admin",
    name: "Shri Rajesh Kumar, IAS",
    designation: "Joint Secretary (Land Acquisition & National Highways)",
    organization: "Ministry of Road Transport & Highways (MoRTH)",
    portfolio: "National Oversight, Stage 11/12 Sanctions & Statutory Gazette Releases",
    avatarColor: "bg-blue-700",
    badge: "Apex Ministry Sanctions",
  },
  {
    id: "central_dg",
    username: "central_dg",
    name: "Smt. Sunita Rao, IDAS",
    designation: "Director General (Statutory Compliance & Land Audits)",
    organization: "Department of Land Resources (DoLR), MoRD",
    portfolio: "RFCTLARR Act Compliance, CAG Audit Trail & Multi-State Legal Rigor",
    avatarColor: "bg-purple-700",
    badge: "Statutory & CAG Compliance",
  },
  {
    id: "central_nhai",
    username: "central_nhai_member",
    name: "Shri Arvind K. Mishra",
    designation: "Member (PPP & Land Assets)",
    organization: "National Highways Authority of India (NHAI HQ)",
    portfolio: "National Corridor Network, RoW Encumbrance Clearances & Agency Takeover",
    avatarColor: "bg-emerald-700",
    badge: "NHAI National Infrastructure",
  },
  {
    id: "central_cpd",
    username: "central_cpd",
    name: "Dr. S. K. Sen",
    designation: "Chief Project Director (National Greenfield Corridors)",
    organization: "PM GatiShakti National Master Plan Cell",
    portfolio: "Greenfield Alignment Approvals, Multi-Modal Logistics & Inter-State Coordination",
    avatarColor: "bg-amber-700",
    badge: "PM GatiShakti Greenfield Hubs",
  },
  {
    id: "central_rr",
    username: "central_rr_comm",
    name: "Prof. Anuradha Menon",
    designation: "National Social Impact & R&R Commissioner",
    organization: "National Resettlement & PAF Welfare Monitoring Authority",
    portfolio: "SIA Review, Schedule II Entitlement Sanctions & PAF Rehabilitation Welfare",
    avatarColor: "bg-rose-700",
    badge: "National R&R & Social Welfare",
  },
];

// ==========================================
// 2. STATE SELECTION PORTALS (6 STATES)
// ==========================================
interface StatePortalConfig {
  code: string;
  name: string;
  revenueDept: string;
  secretaryName: string;
  username: string;
  activeCorridors: number;
  multiplierRural: string;
  solatium: string;
  districtsCount: number;
  accent: string;
  description: string;
  districts: {
    id: string;
    name: string;
    calaOfficer: { username: string; name: string; designation: string };
    fieldOfficer?: { username: string; name: string; designation: string; tehsil: string };
    socialOfficer?: { username: string; name: string; designation: string };
  }[];
}

const STATE_PORTALS: StatePortalConfig[] = [
  {
    code: "IN-RJ",
    name: "Rajasthan",
    revenueDept: "Revenue & Colonisation Department, Govt. of Rajasthan",
    secretaryName: "Smt. Sunita Verma, IAS (Principal Secretary)",
    username: "state_rj_officer",
    activeCorridors: 4,
    multiplierRural: "2.00x",
    solatium: "100%",
    districtsCount: 33,
    accent: "border-amber-500 bg-amber-50/40 text-amber-900",
    description: "Delhi-Jaipur Expressway, Jaipur Ring Road, Amritsar-Jamnagar Corridor",
    districts: [
      {
        id: "DST-JAI",
        name: "Jaipur District",
        calaOfficer: { username: "cala_jaipur", name: "Dr. Amit Sharma, IAS", designation: "District Collector & CALA" },
        fieldOfficer: { username: "patwari_kotputli", name: "Shri Ramesh Choudhary", designation: "Senior Revenue Patwari", tehsil: "Kotputli Tehsil" },
        socialOfficer: { username: "randr_jaipur", name: "Smt. Meenakshi Sundaram", designation: "Social Welfare & R&R Officer" },
      },
      {
        id: "DST-JOD",
        name: "Jodhpur District",
        calaOfficer: { username: "cala_jodhpur", name: "Shri Himanshu Gupta, IAS", designation: "District Collector & CALA" },
      },
    ],
  },
  {
    code: "IN-MH",
    name: "Maharashtra",
    revenueDept: "Revenue & Forest Department, Govt. of Maharashtra",
    secretaryName: "Shri Devendra Patil, IAS (Secretary Revenue)",
    username: "state_mh_officer",
    activeCorridors: 6,
    multiplierRural: "1.50x",
    solatium: "100%",
    districtsCount: 36,
    accent: "border-blue-500 bg-blue-50/40 text-blue-900",
    description: "Samruddhi Mahamarg, Mumbai-Pune Expressway Expansion, Pune Ring Road",
    districts: [
      {
        id: "DST-PUN",
        name: "Pune District",
        calaOfficer: { username: "cala_pune", name: "Dr. Rajesh Deshmukh, IAS", designation: "District Collector & CALA" },
        fieldOfficer: { username: "patwari_pune", name: "Shri Santosh Shinde", designation: "Talathi & Ground Cadastral Inspector", tehsil: "Haveli Tehsil" },
        socialOfficer: { username: "randr_pune", name: "Smt. Anjali Kadam", designation: "District R&R Officer" },
      },
      {
        id: "DST-NAG",
        name: "Nagpur District",
        calaOfficer: { username: "cala_nagpur", name: "Dr. Vipin Itankar, IAS", designation: "District Collector & CALA" },
      },
    ],
  },
  {
    code: "IN-UP",
    name: "Uttar Pradesh",
    revenueDept: "Board of Revenue, Govt. of Uttar Pradesh",
    secretaryName: "Shri Alok Tandon, IAS (Chairman Board of Revenue)",
    username: "state_up_officer",
    activeCorridors: 8,
    multiplierRural: "2.00x",
    solatium: "100%",
    districtsCount: 75,
    accent: "border-emerald-500 bg-emerald-50/40 text-emerald-900",
    description: "Ganga Expressway, Purvanchal Expressway, Noida International Airport RoW",
    districts: [
      {
        id: "DST-LKO",
        name: "Lucknow District",
        calaOfficer: { username: "cala_lucknow", name: "Shri Surya Pal Gangwar, IAS", designation: "District Magistrate & CALA" },
        fieldOfficer: { username: "patwari_lucknow", name: "Shri Suresh Yadav", designation: "Senior Lekhpal & Cadastral Surveyor", tehsil: "Mohanlalganj Tehsil" },
      },
      {
        id: "DST-GBN",
        name: "Gautam Buddha Nagar (Noida)",
        calaOfficer: { username: "cala_noida", name: "Shri Manish Verma, IAS", designation: "District Magistrate & CALA" },
      },
    ],
  },
  {
    code: "IN-GJ",
    name: "Gujarat",
    revenueDept: "Revenue Department, Govt. of Gujarat",
    secretaryName: "Smt. Mona Khandhar, IAS (Principal Secretary)",
    username: "state_gj_officer",
    activeCorridors: 5,
    multiplierRural: "1.25x",
    solatium: "100%",
    districtsCount: 33,
    accent: "border-purple-500 bg-purple-50/40 text-purple-900",
    description: "Vadodara-Mumbai Expressway, Dholera SIR Corridor, Bullet Train Package",
    districts: [
      {
        id: "DST-AHM",
        name: "Ahmedabad District",
        calaOfficer: { username: "cala_ahmedabad", name: "Smt. Praveena D.K., IAS", designation: "District Collector & CALA" },
      },
    ],
  },
  {
    code: "IN-KA",
    name: "Karnataka",
    revenueDept: "Revenue Department & Land Administration Directorate, Govt. of Karnataka",
    secretaryName: "Shri Rajeev Chawla, IAS (Commissioner Land Admin)",
    username: "state_ka_officer",
    activeCorridors: 3,
    multiplierRural: "1.50x",
    solatium: "100%",
    districtsCount: 31,
    accent: "border-rose-500 bg-rose-50/40 text-rose-900",
    description: "Bengaluru-Chennai Expressway, Bengaluru Satellite Ring Road (STRR)",
    districts: [
      {
        id: "DST-BLR",
        name: "Bengaluru Rural District",
        calaOfficer: { username: "cala_bengaluru", name: "Shri N. Manjunatha Prasad, IAS", designation: "Special Deputy Commissioner (Land Acquisition)" },
      },
    ],
  },
  {
    code: "IN-MP",
    name: "Madhya Pradesh",
    revenueDept: "Revenue Department, Govt. of Madhya Pradesh",
    secretaryName: "Shri Vivek Aggarwal, IAS (Principal Secretary)",
    username: "state_mp_officer",
    activeCorridors: 4,
    multiplierRural: "2.00x",
    solatium: "100%",
    districtsCount: 55,
    accent: "border-teal-500 bg-teal-50/40 text-teal-900",
    description: "Chambal Expressway, Bhopal-Indore Expressway Link, Narmada Corridor",
    districts: [
      {
        id: "DST-BHO",
        name: "Bhopal District",
        calaOfficer: { username: "cala_jaipur", name: "Shri Kaushlendra Vikram Singh, IAS", designation: "District Collector & CALA" },
      },
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"central" | "state" | "district" | "agency" | "credentials">("central");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("IN-RJ");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("DST-JAI");

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingUser, setSubmittingUser] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedState = STATE_PORTALS.find((s) => s.code === selectedStateCode) || STATE_PORTALS[0];
  const selectedDistrict = selectedState.districts.find((d) => d.id === selectedDistrictId) || selectedState.districts[0];

  const handleExecuteLogin = async (username: string, pass: string = "Password@123") => {
    setFormError(null);
    setIsSubmitting(true);
    setSubmittingUser(username);
    try {
      await login({
        username_or_email: username.trim(),
        password: pass,
      });
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please verify credentials.");
      setIsSubmitting(false);
      setSubmittingUser(null);
    }
  };

  const handleManualFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setFormError("Please enter your official username or government email.");
      return;
    }
    await handleExecuteLogin(usernameOrEmail, password);
  };

  // If already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-[#138808] shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950">Active Official Session</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{user.full_name}</p>
              <p className="text-[11px] text-slate-600 font-mono">{user.designation || user.role_id}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                {user.jurisdiction?.scope_display || "Authorized Mandate"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#138808] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <span>Go to Command Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Switch Officer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Statutory Tricolor Bar */}
      <div>
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-white" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        {/* Apex Navigation Bar */}
        <div className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-2 text-xs flex items-center justify-between font-mono border-b border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-sans font-semibold">Public Land Acquisition Portal</span>
          </Link>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">National Single Sign-On (SSO) &amp; Jan Parichay Compatible</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Multi-Tier Login Container */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#138808] text-xs font-bold font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CENTRALIZED NATIONAL FEDERATION &amp; GOVERNANCE PORTAL</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            National Land Acquisition System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Select your administrative echelon below to access real-time statutory workflows, corridor scrutinies, and digital disbursement ledgers.
          </p>
        </div>

        {/* Tier Selector Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("central")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "central"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Crown className="h-4 w-4 text-amber-400" />
            <span>Central Leadership Suite (5 Profiles)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("state")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "state"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Globe2 className="h-4 w-4 text-blue-400" />
            <span>State Portals Hub (6 States)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("district")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "district"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building className="h-4 w-4 text-emerald-400" />
            <span>District Command &amp; CALA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("agency")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "agency"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            <span>Agencies &amp; Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "credentials"
                ? "bg-[#0B2545] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span>Official Credentials</span>
          </button>
        </div>

        {formError && (
          <div className="max-w-3xl mx-auto flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* TAB 1: CENTRAL MINISTRY LEADERSHIP SUITE */}
        {activeTab === "central" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  NATIONAL MANDATE • 5 CENTRAL PORTFOLIOS
                </span>
                <h2 className="text-base font-bold font-serif mt-1">
                  Central Ministry &amp; Apex Leadership Echelon
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full nationwide visibility across all 28 States &amp; 8 UTs. Direct authorization of Section 19 sanctions and National Corridor pipelines.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-slate-300">
                <span className="font-bold text-emerald-400">All India (IN)</span> • National Jurisdiction
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CENTRAL_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-800 border border-slate-200">
                        {member.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {member.username}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors font-serif">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {member.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {member.organization}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <strong className="text-slate-800 block text-[10px] uppercase tracking-wider font-mono">Portfolio Responsibility:</strong>
                      <p className="line-clamp-2">{member.portfolio}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecuteLogin(member.username)}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0B2545] hover:bg-[#138808] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submittingUser === member.username ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In as {member.name.split(",")[0]}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STATE SELECTION PORTALS HUB */}
        {activeTab === "state" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 font-bold">
                  STATE REVENUE BOARDS &amp; SECRETARIATS
                </span>
                <h2 className="text-base font-bold font-serif text-slate-900 mt-1">
                  State-Wise Land Acquisition Portals
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each state operates with customized Solatium Multipliers, Gazette publishing rules, and dedicated State Revenue Secretary command.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <strong>6 States</strong> Federated • 260+ Districts
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATE_PORTALS.map((state) => (
                <div
                  key={state.code}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-7 w-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                          {state.code.replace("IN-", "")}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors font-serif">
                            {state.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            {state.code} • {state.districtsCount} Districts
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {state.activeCorridors} Corridors
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-800">{state.secretaryName}</p>
                      <p className="text-[11px] text-slate-500">{state.revenueDept}</p>
                    </div>

                    {/* State Statutory Particulars */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Rural Multiplier</span>
                        <strong className="text-slate-900">{state.multiplierRural}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Solatium</span>
                        <strong className="text-emerald-700">{state.solatium}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      <strong className="text-slate-800">Priority Projects:</strong> {state.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleExecuteLogin(state.username)}
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                    >
                      {submittingUser === state.username ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Login as State Revenue Secretary</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStateCode(state.code);
                        setActiveTab("district");
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>View {state.name} Districts &amp; CALAs</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISTRICT COMMAND & CALA STATIONS */}
        {activeTab === "district" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold">
                  DISTRICT-WISE CALA &amp; FIELD OFFICES
                </span>
                <h2 className="text-base font-bold font-serif text-slate-900 mt-1">
                  District Competent Authority (CALA) Workspaces
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select state and district to sign in as District Collector, Field Patwari, or Social R&amp;R Officer.
                </p>
              </div>

              {/* State Switcher Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {STATE_PORTALS.map((st) => (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => {
                      setSelectedStateCode(st.code);
                      if (st.districts[0]) {
                        setSelectedDistrictId(st.districts[0].id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedStateCode === st.code
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            {/* District Profiles Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: District Selector */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Districts in {selectedState.name}
                </h3>
                <div className="space-y-1.5">
                  {selectedState.districts.map((dst) => (
                    <button
                      key={dst.id}
                      type="button"
                      onClick={() => setSelectedDistrictId(dst.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        selectedDistrict.id === dst.id
                          ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-bold">{dst.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {dst.id}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: District Officers in Selected District */}
              <div className="lg:col-span-8 space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-serif">
                        {selectedDistrict.name} Officers ({selectedState.name})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Authorized District Land Acquisition Authority &amp; Field Survey Staff
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {selectedDistrict.id}
                    </span>
                  </div>

                  {/* 1. CALA Officer Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                        STATUTORY CALA / ADM
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 mt-1">
                        {selectedDistrict.calaOfficer.name}
                      </h5>
                      <p className="text-xs text-slate-600">
                        {selectedDistrict.calaOfficer.designation}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteLogin(selectedDistrict.calaOfficer.username)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
                    >
                      {submittingUser === selectedDistrict.calaOfficer.username ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span>Login as CALA / Collector</span>
                      )}
                    </button>
                  </div>

                  {/* 2. Field Surveyor / Patwari Card */}
                  {selectedDistrict.fieldOfficer && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                          TEHSIL REVENUE INSPECTOR / PATWARI
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">
                          {selectedDistrict.fieldOfficer.name}
                        </h5>
                        <p className="text-xs text-slate-600">
                          {selectedDistrict.fieldOfficer.designation} • {selectedDistrict.fieldOfficer.tehsil}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteLogin(selectedDistrict.fieldOfficer!.username)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
                      >
                        {submittingUser === selectedDistrict.fieldOfficer!.username ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Login as Field Patwari</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 3. Social Development & R&R Officer Card */}
                  {selectedDistrict.socialOfficer && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-900 border border-rose-200 font-mono">
                          SOCIAL WELFARE &amp; RESETTLEMENT
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">
                          {selectedDistrict.socialOfficer.name}
                        </h5>
                        <p className="text-xs text-slate-600">
                          {selectedDistrict.socialOfficer.designation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteLogin(selectedDistrict.socialOfficer!.username)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
                      >
                        {submittingUser === selectedDistrict.socialOfficer!.username ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Login as R&amp;R Officer</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMPLEMENTING AGENCIES & ADMIN */}
        {activeTab === "agency" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NHAI Agency Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      National Highways Authority of India (NHAI)
                    </h3>
                    <p className="text-xs text-slate-500">Project Implementation Agency</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Er. Vikram Singh</p>
                  <p className="text-[11px] text-slate-500">Project Director (NHAI Jaipur PIU)</p>
                  <p className="text-[11px] text-purple-800 font-medium">Scope: Alignment Proposals, DPR, Compensation Deposits</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteLogin("nhai_pd_jaipur")}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {submittingUser === "nhai_pd_jaipur" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Project Agency (NHAI)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Systems Administrator Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Platform System Administration
                    </h3>
                    <p className="text-xs text-slate-500">NIC / NLAMS Central Command</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Principal Systems Administrator</p>
                  <p className="text-[11px] text-slate-500">Lead System Architect</p>
                  <p className="text-[11px] text-slate-700 font-medium">Scope: Security Audit Logs, Workflow Overrides &amp; RBAC</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteLogin("admin")}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {submittingUser === "admin" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Super Admin</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL CREDENTIALS FORM */}
        {activeTab === "credentials" && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-950">
                Official Digital Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your designated government username or official email address.
              </p>
            </div>

            <form onSubmit={handleManualFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Username or Official Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cala_jaipur or central_admin"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#138808]/20 focus:border-[#138808] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Statutory Password
                  </label>
                  <span className="text-[10px] text-slate-400">Default: Password@123</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#138808]/20 focus:border-[#138808] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#138808] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Authenticate &amp; Enter Platform</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Institutional Bottom Disclaimer */}
      <div className="bg-slate-900 text-slate-400 text-center py-4 px-4 text-[11px] border-t border-slate-800">
        <p>
          NLAMS • National Land Acquisition &amp; Management System • Government Digital Platform Prototype
        </p>
      </div>
    </div>
  );
}
