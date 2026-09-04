"use client";

import React from "react";
import { QuickActionItem } from "@/lib/types/dashboard";
import {
  Building2,
  FileCheck,
  BarChart3,
  Newspaper,
  Layers,
  Home,
  Gavel,
  FileBadge,
  CreditCard,
  UploadCloud,
  Wallet,
  ShieldCheck,
  MapPin,
  Calculator,
  UserCheck,
  Users,
  FileText,
  Database,
  ArrowUpRight,
} from "lucide-react";

interface QuickActionsPanelProps {
  actions: QuickActionItem[];
  userRoleName?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  FileCheck,
  BarChart3,
  Newspaper,
  Layers,
  Home,
  Gavel,
  FileBadge,
  CreditCard,
  UploadCloud,
  Wallet,
  ShieldCheck,
  MapPin,
  Calculator,
  UserCheck,
  Users,
  FileText,
  Database,
};

export function QuickActionsPanel({ actions, userRoleName }: QuickActionsPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Role-Mandated Quick Actions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operational tasks authorized for <strong className="text-slate-700">{userRoleName || "Current Role"}</strong>
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Statutory Actions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {actions.map((act) => {
          const IconComponent = ICON_MAP[act.icon] || FileCheck;
          return (
            <div
              key={act.id}
              className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded bg-emerald-100 text-[#138808] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {act.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {act.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-[#138808] transition-colors flex items-center justify-between">
                  <span>{act.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#138808] transition-colors" />
                </h4>

                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-800 group-hover:underline">
                Execute Action →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
