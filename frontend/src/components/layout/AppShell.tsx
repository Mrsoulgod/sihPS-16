"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/how-it-works",
  "/transparency",
  "/overview",
  "/login",
];

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

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/transparency") ||
    pathname.startsWith("/overview");

  // Redirect to login if user attempts to access protected operations unauthenticated
  useEffect(() => {
    if (!isPublicRoute && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isPublicRoute, isLoading, isAuthenticated, router]);

  // 1. Dedicated standalone layout for Login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 2. Public Transparency Website layout (PublicHeader + PublicFooter, no sidebar)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <PublicHeader />
        <main className="flex-1 w-full">{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // 3. Loading state for protected routes while session is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        <p className="mt-3 text-xs font-semibold text-slate-600">Verifying statutory authorization...</p>
      </div>
    );
  }

  // 4. If not authenticated on protected route, return null while router pushes to /login
  if (!isAuthenticated) {
    return null;
  }

  // 5. Authenticated Government Operations Platform (AppHeader + AppSidebar)
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Permanent Command Header */}
      <AppHeader
        onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        isSidebarOpen={isMobileOpen}
      />

      {/* Main Body with Sidebar and Operations Content */}
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

