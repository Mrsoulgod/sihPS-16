"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";
import { fetchScopedFamilies } from "@/lib/api/social";
import { AffectedFamilyCaseItem } from "@/lib/types/social";

export default function EligibilityManagementPage() {
  const [families, setFamilies] = useState<AffectedFamilyCaseItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchScopedFamilies({
          eligibility_status: filterStatus === "ALL" ? undefined : filterStatus,
          search: search || undefined,
        });
        setFamilies(res);
      } catch {
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterStatus, search]);

  const underReviewCount = families.filter((f) => f.eligibility_status === "UNDER_REVIEW" || f.eligibility_status === "NOT_REVIEWED").length;
  const eligibleCount = families.filter((f) => f.eligibility_status === "ELIGIBLE").length;
  const reworkCount = families.filter((f) => f.eligibility_status === "REWORK_REQUIRED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <Link href="/dashboard" className="hover:text-emerald-700">
              R&R Case Management
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">Eligibility Review</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            <span>R&R Eligibility Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable statutory eligibility determination under RFCTLARR Act 2013 Section 31 and Second Schedule.
          </p>
        </div>

        <Link
          href="/affected-families"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          <Users className="w-4 h-4" />
          <span>All Affected Families</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-amber-200 bg-amber-50/40 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-amber-800">Under Review / Pending</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{underReviewCount}</div>
          <span className="text-[11px] text-amber-600">Awaiting Social Officer assessment</span>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/40 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-emerald-800">Sanctioned Eligible</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{eligibleCount}</div>
          <span className="text-[11px] text-emerald-600">Entitled to Second Schedule package</span>
        </div>
        <div className="bg-white border border-rose-200 bg-rose-50/40 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-rose-800">Rework Required</span>
          <div className="text-2xl font-black text-rose-900 mt-1">{reworkCount}</div>
          <span className="text-[11px] text-rose-600">Returned for tenancy / revenue re-check</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 border rounded-xl px-3 py-2 bg-slate-50 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by family ref, head, village..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {["ALL", "UNDER_REVIEW", "ELIGIBLE", "NOT_ELIGIBLE", "REWORK_REQUIRED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? "bg-[#138808] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading eligibility cases...</div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No eligibility records match filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase font-mono bg-slate-50">
                  <th className="py-3 px-4">Family Ref</th>
                  <th className="py-3 px-4">Head of Family</th>
                  <th className="py-3 px-4">Village / Khasra</th>
                  <th className="py-3 px-4">Displacement Category</th>
                  <th className="py-3 px-4">Social Category</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families.map((fam) => (
                  <tr key={fam.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {fam.family_reference_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {fam.head_of_family_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {fam.village_name} (Khasra {fam.khasra_number})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {fam.displacement_status}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">
                        {fam.social_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                          fam.eligibility_status === "ELIGIBLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : fam.eligibility_status === "UNDER_REVIEW"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {fam.eligibility_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/affected-families/${fam.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
