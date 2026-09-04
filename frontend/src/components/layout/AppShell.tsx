"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Route protection: redirect unauthenticated users to /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-serif font-black text-xl shadow-lg ring-2 ring-emerald-500 animate-pulse">
            NL
          </div>
          <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Connecting to National Land Acquisition Command Portal...</span>
          </div>
          <p className="text-xs text-slate-500">Authenticating credentials against database</p>
        </div>
      </div>
    );
  }

  // If on login page, don't show the dashboard shell
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Authenticated layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Permanent Header */}
      <AppHeader
        onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        isSidebarOpen={isMobileOpen}
      />

      {/* Main Body with Sidebar and Content */}
      <div className="flex flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <AppSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
