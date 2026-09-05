"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  BarChart3,
  Layers,
  FileCheck,
  Info,
  Building2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/overview", label: "National Overview", icon: BarChart3 },
    { href: "/how-it-works", label: "How It Works", icon: Layers },
    { href: "/transparency", label: "Public Transparency", icon: FileCheck },
    { href: "/about", label: "About NLAMS", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Tricolor Statutory Bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Institutional Apex Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-8 py-1 text-[11px] flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            Government of India • Ministry of Rural Development & MoRTH
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span>RFCTLARR Act 2013 Statutory Compliance</span>
          <span>•</span>
          <span>Public Data Transparency Portal</span>
        </div>
      </div>

      {/* Main Public Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-serif font-black text-xl shadow-sm border border-slate-800 ring-2 ring-emerald-600/20 group-hover:ring-emerald-600/50 transition-all">
              NL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg text-slate-950 tracking-tight leading-none group-hover:text-[#138808] transition-colors">
                  NLAMS
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
                National Land Acquisition & Management System
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? "text-[#138808] bg-emerald-50/80 font-bold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Officer Portal CTA & Language */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-[#138808] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <span>Command Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-[#0B2545] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Government Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold ${
                    isActive
                      ? "text-[#138808] bg-emerald-50 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-[#138808] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <span>Command Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-[#0B2545] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Government Officer Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
