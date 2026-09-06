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
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const DEMO_ACCOUNTS = [
  {
    roleId: "ROLE_CENTRAL_OFFICER",
    label: "Central Ministry Officer",
    officer: "Shri Rajesh Kumar",
    jurisdiction: "National Command (MoRTH)",
    username: "central_admin",
    email: "central@gov.demo",
    badge: "National Oversight & Sanctions",
  },
  {
    roleId: "ROLE_STATE_OFFICER",
    label: "State Revenue Officer",
    officer: "Smt. Sunita Verma, IAS",
    jurisdiction: "Rajasthan Revenue Board (IN-RJ)",
    username: "state_rj_officer",
    email: "state@gov.demo",
    badge: "State Corridor Scrutiny & Section 19",
  },
  {
    roleId: "ROLE_DISTRICT_OFFICER",
    label: "District Collector / CALA",
    officer: "Dr. Amit Sharma, IAS",
    jurisdiction: "Jaipur District CALA (DST-JAI)",
    username: "cala_jaipur",
    email: "district@gov.demo",
    badge: "Approve Stages & Awards",
  },
  {
    roleId: "ROLE_PROJECT_AGENCY",
    label: "Project Agency Officer",
    officer: "Er. Vikram Singh",
    jurisdiction: "NHAI Project Office (Jaipur)",
    username: "nhai_pd_jaipur",
    email: "agency@gov.demo",
    badge: "Alignment Proposals & DPR",
  },
  {
    roleId: "ROLE_FIELD_OFFICER",
    label: "Field Survey Officer (Patwari)",
    officer: "Shri Ramesh Choudhary",
    jurisdiction: "Tehsil Kotputli (Field)",
    username: "patwari_kotputli",
    email: "field@gov.demo",
    badge: "Record Ground Verification",
  },
  {
    roleId: "ROLE_SOCIAL_OFFICER",
    label: "Social Development & R&R Officer",
    officer: "Smt. Meenakshi Sundaram",
    jurisdiction: "Jaipur District R&R Schemes",
    username: "randr_jaipur",
    email: "randr@gov.demo",
    badge: "PAF Census & Entitlement Schemes",
  },
  {
    roleId: "ROLE_ADMIN",
    label: "System Administrator",
    officer: "Principal Systems Administrator",
    jurisdiction: "NIC / NLAMS Central",
    username: "admin",
    email: "admin@gov.demo",
    badge: "Governance & Audit Logs",
  },
];


export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, logout, isLoading } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("Password@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!usernameOrEmail.trim()) {
      setFormError("Please enter your username or official email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        username_or_email: usernameOrEmail.trim(),
        password: password || "Password@123",
      });
      router.push("/dashboard");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setFormError(err.message || "Invalid credentials or unauthorized access.");
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setFormError(null);
    setUsernameOrEmail(account.username);
    setPassword("Password@123");
    setIsSubmitting(true);

    try {
      await login({
        username_or_email: account.username,
        password: "Password@123",
      });
      router.push("/dashboard");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setFormError(err.message || "Quick demo authentication failed.");
      setIsSubmitting(false);
    }
  };

  // If already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-[#138808] shrink-0" />
            <div>
              <p className="text-xs font-bold">Currently Authenticated</p>
              <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 font-mono">{user.role_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#138808] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <span>Go to Command Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log Out
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
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-white" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        {/* Apex Bar */}
        <div className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-1.5 text-[11px] flex items-center justify-between font-mono border-b border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
            <span>Back to Public Transparency Portal</span>
          </Link>
          <span className="hidden sm:inline text-slate-400">
            Official Statutory Authentication Gateway
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#0B2545] text-white font-serif font-black text-2xl shadow-sm border border-slate-800 ring-2 ring-emerald-600/20 mb-1">
            NL
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Government Operations Sign-In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            National Land Acquisition &amp; Management System • Restricted to authorized statutory officers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Sign-in Form */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-950">
                Officer Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your official government credentials or NIC single sign-on username.
              </p>
            </div>

            {formError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Username or Official Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. cala_jaipur or district@gov.demo"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808]/20 focus:border-[#138808] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Statutory Password
                  </label>
                  <span className="text-[10px] text-slate-400">Demo: DemoPass@123</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#138808]/20 focus:border-[#138808] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#138808] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Role-Based Statutory Access</span>
              </span>
              <span>Audit Logging Active</span>
            </div>
          </div>

          {/* Right Column: 1-Click Fast Demo Login for Evaluators */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="h-3 w-3" />
                  <span>SIH 2026 Evaluation Shortcut</span>
                </div>
                <h2 className="font-serif text-lg font-bold text-slate-950">
                  1-Click Role-Based Quick Sign-In
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select any pre-configured statutory officer profile to test role-scoped workflows immediately.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.roleId}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  disabled={isSubmitting}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-[#138808]/40 hover:shadow-2xs transition-all group flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-950 group-hover:text-[#138808] transition-colors">
                        {acc.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {acc.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {acc.officer} • <span className="text-slate-500">{acc.jurisdiction}</span>
                    </p>
                    <span className="text-[10px] font-medium text-emerald-700 block">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="h-7 w-7 rounded-md bg-white border border-slate-200 text-slate-400 group-hover:text-[#138808] group-hover:border-[#138808]/30 flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
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
