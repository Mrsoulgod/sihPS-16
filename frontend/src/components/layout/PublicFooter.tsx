"use client";

import React from "react";
import Link from "next/link";
import { Shield, CheckCircle2, ExternalLink, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#0B2545] border border-slate-700 text-white flex items-center justify-center font-serif font-black text-lg ring-1 ring-emerald-500/30">
                NL
              </div>
              <div>
                <span className="font-serif font-bold text-white text-base tracking-tight">
                  NLAMS
                </span>
                <p className="text-[11px] text-slate-400">
                  National Land Acquisition & Management System
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              A unified national digital platform engineered for transparent, accountable,
              and data-driven land acquisition across India. Institutional prototype designed
              for Smart India Hackathon (SIH 2026).
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>RFCTLARR Act 2013 Statutory Lifecycle Model</span>
            </div>
          </div>

          {/* Col 2: Public Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Public Transparency
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/overview" className="hover:text-white transition-colors">
                  National Data Overview
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Statutory 12-Stage Lifecycle
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-white transition-colors">
                  Public Disclosures & Metrics
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Mission & Stakeholders
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Operations */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Official Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span>Officer Portal Login</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  PFMS DBT Disbursement Gateway
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  National Spatial Data Infrastructure
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Bhoomi Rashi & PM Gati Shakti API
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Privacy & Prototype Notice */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p>
              © 2026 National Land Acquisition & Management System • Government Digital Platform Prototype.
            </p>
            <p className="mt-0.5 text-slate-400">
              Data Privacy Charter: Citizen Aadhaar numbers, bank accounts, and personal identifiers are strictly masked under privacy regulations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by PostgreSQL 16 + PostGIS</span>
            <span>•</span>
            <span>v1.0.0-SIH2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
