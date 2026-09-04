import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { HeaderUserBar } from "@/components/layout/HeaderUserBar";

export const metadata: Metadata = {
  title: "NLAMS | National Land Acquisition & Management System",
  description: "Unified digital platform for statutory land acquisition, compensation, and R&R monitoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  NL
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    National Land Acquisition & Management System
                  </h1>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    Government of India • Ministry of Road Transport & Highways / CALA Portal
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeaderUserBar />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
