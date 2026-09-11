"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calculator,
  Search,
  ArrowRight,
  ChevronRight,
  Home,
  IndianRupee,
} from "lucide-react";
import { fetchScopedFamilies } from "@/lib/api/social";
import { AffectedFamilyCaseItem } from "@/lib/types/social";

export default function EntitlementsManagementPage() {
  const [families, setFamilies] = useState<AffectedFamilyCaseItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchScopedFamilies({
          eligibility_status: "ELIGIBLE",
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
  }, [search]);

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
            <span className="text-slate-900 font-bold">Entitlements</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <span>Entitlement & Assistance Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation and tracking of Second Schedule plot allocations, subsistence grants, and shifting allowances.
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

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-96 border rounded-xl px-3 py-2 bg-slate-50 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search eligible families by ref, head, village..."
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Entitlements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading entitlements...</div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No eligible families found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase font-mono bg-slate-50">
                  <th className="py-3 px-4">Family Ref & Head</th>
                  <th className="py-3 px-4">Displacement Category</th>
                  <th className="py-3 px-4">Entitled Plot Area</th>
                  <th className="py-3 px-4">Subsistence Grant</th>
                  <th className="py-3 px-4">Allotment Status</th>
                  <th className="py-3 px-4">Entitlement Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families.map((fam) => (
                  <tr key={fam.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{fam.family_reference_id}</div>
                      <div className="text-slate-700 font-semibold">{fam.head_of_family_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {fam.displacement_status}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {fam.entitled_plot_sqyd} sq.yd
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ₹{Number(fam.subsistence_grant_inr).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                        {fam.allotment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
                        {fam.entitlement_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/affected-families/${fam.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        <span>Workspace</span>
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
