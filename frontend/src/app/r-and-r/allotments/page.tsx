'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Home, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  PlusCircle,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { fetchScopedFamilies } from '@/lib/api/social';
import type { AffectedFamilyCaseItem } from '@/lib/types/social';

export default function AllotmentManagementPage() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<AffectedFamilyCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchScopedFamilies();
        setFamilies(data);
      } catch (err) {
        console.error('Failed to load families for allotment', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFamilies = families.filter(f => {
    const matchesSearch = 
      f.family_reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.head_of_family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.project_title.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ALLOTTED') return matchesSearch && (f.allotment_status === 'ALLOTTED' || f.allotment_status === 'DELIVERED');
    if (statusFilter === 'PENDING') return matchesSearch && f.allotment_status === 'PENDING';
    if (statusFilter === 'NONE') return matchesSearch && (!f.allotment_status || f.allotment_status === 'NONE' || f.allotment_status === 'NOT_ALLOTTED');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              R&amp;R ALLOTMENT TRACKER
            </span>
            <span className="text-xs text-gray-500">Jurisdiction: {user?.assigned_district || 'District Jaipur'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Resettlement Allotments</h1>
          <p className="text-sm text-gray-600">
            Track, assign, and dispatch land plots, built-up housing units, and rehabilitation infrastructure.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Eligible Cases</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {families.filter(f => f.eligibility_status === 'ELIGIBLE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase">Allotment Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {families.filter(f => f.allotment_status === 'PENDING' || f.allotment_status === 'NOT_ALLOTTED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Plots / Units Issued</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {families.filter(f => f.allotment_status === 'ALLOTTED' || f.allotment_status === 'DELIVERED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-purple-600 uppercase">Implemented &amp; Verified</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {families.filter(f => f.case_status === 'COMPLETED' || f.case_status === 'SETTLED').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search family ID, head, village or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex bg-gray-100 p-1 rounded-md text-xs font-medium text-gray-700">
            {['ALL', 'PENDING', 'ALLOTTED', 'NONE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-sm transition-colors ${
                  statusFilter === status 
                    ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Family ID / Head</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Project &amp; Location</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Eligibility</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Entitlement Matrix</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Allotment Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs">Implementation</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading allotment records...
                  </td>
                </tr>
              ) : filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No matching allotment records found.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((fam) => (
                  <tr key={fam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{fam.family_reference_id}</div>
                      <div className="text-xs text-gray-500">{fam.head_of_family_name}</div>
                      <div className="text-[11px] text-gray-400">Members: {fam.family_members_count}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium text-xs">{fam.project_title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {fam.village_name} (Khasra {fam.khasra_number})
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        fam.eligibility_status === 'ELIGIBLE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : fam.eligibility_status === 'NOT_ELIGIBLE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fam.eligibility_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900 font-medium">{fam.entitlement_status}</div>
                      <div className="text-[11px] text-gray-500">RFCTLARR 2013 Sched. II</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        fam.allotment_status === 'ALLOTTED' || fam.allotment_status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fam.allotment_status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {fam.allotment_status === 'ALLOTTED' || fam.allotment_status === 'DELIVERED' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {fam.allotment_status || 'NOT_ASSIGNED'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900 font-medium">{fam.implementation_status}</div>
                      <div className="text-[11px] text-gray-500">Stage: {fam.case_status}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/affected-families/${fam.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        Workspace
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
