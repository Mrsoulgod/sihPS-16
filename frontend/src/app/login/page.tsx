"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, UserCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEMO_ACCOUNTS = [
  { label: "Central Ministry", role: "ROLE_CENTRAL_OFFICER", email: "central@gov.demo", name: "Shri Rajesh Kumar", org: "MoRTH" },
  { label: "State Officer", role: "ROLE_STATE_OFFICER", email: "state@gov.demo", name: "Smt. Sunita Verma", org: "Govt. of Rajasthan" },
  { label: "District CALA", role: "ROLE_DISTRICT_OFFICER", email: "district@gov.demo", name: "Dr. Amit Sharma, IAS", org: "Jaipur District" },
  { label: "Project Agency", role: "ROLE_PROJECT_AGENCY", email: "agency@gov.demo", name: "Er. Vikram Singh", org: "NHAI" },
  { label: "Field Surveyor", role: "ROLE_FIELD_OFFICER", email: "field@gov.demo", name: "Shri Ramesh Choudhary", org: "Tehsil Kotputli" },
  { label: "System Admin", role: "ROLE_ADMIN", email: "admin@gov.demo", name: "Administrator", org: "NIC / NLAMS" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, logout, isLoading } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!usernameOrEmail.trim()) {
      setFormError("Please enter your username or official email address.");
      return;
    }

    try {
      await login({
        username_or_email: usernameOrEmail.trim(),
        password: password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setFormError(err.message || "Invalid authentication credentials.");
    }
  };

  const handleSelectDemoAccount = (email: string) => {
    setUsernameOrEmail(email);
    setPassword("demo123");
    setFormError(null);
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-slate-200 shadow-sm">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100 pb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <div>
                <CardTitle className="text-emerald-950 text-lg">Active Session Established</CardTitle>
                <CardDescription className="text-emerald-800">You are securely signed in to NLAMS.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-md border border-slate-200 p-4 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Official Name</span>
                <span className="text-sm font-medium text-slate-900">{user.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Role</span>
                <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 font-mono text-xs">
                  {user.role_id}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Designation</span>
                <span className="text-sm text-slate-700">{user.designation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Organization</span>
                <span className="text-sm text-slate-700">{user.organization}</span>
              </div>
              {user.state_name && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jurisdiction</span>
                  <span className="text-sm text-slate-700">
                    {user.state_name} {user.district_name ? `• ${user.district_name}` : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => router.push("/dashboard")}>
              Continue to Command Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 text-emerald-800 mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">National Land Acquisition Portal</h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Authorized Single-Window Access for Central, State, and District Land Administration Authorities
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg text-slate-900">Sign In to Your Account</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Enter your official government email or username to access your jurisdiction
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Username or Official Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. district@gov.demo or district_officer"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-slate-400 font-mono">Default: Demo@123456</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white text-slate-900"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2 rounded-md transition-colors"
              >
                {isLoading ? "Authenticating..." : "Sign In with Credentials"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Evaluator Demo Accounts Quick-Picker */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              SIH Evaluator Demo Accounts
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500 bg-slate-50 border-slate-200">
              1-Click Autofill
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemoAccount(acc.email)}
                className={`text-left p-2.5 rounded border text-xs transition-all ${
                  usernameOrEmail === acc.email
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-600"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="font-semibold text-slate-900">{acc.label}</div>
                <div className="text-[11px] text-slate-500 truncate">{acc.name}</div>
                <div className="text-[10px] font-mono text-emerald-700 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Statutory Security Disclaimer */}
        <p className="text-center text-xs text-slate-500">
          Statutory Land Governance System under RFCTLARR Act 2013.
          <br />
          All actions, authorizations, and audits are cryptographically logged.
        </p>
      </div>
    </div>
  );
}
