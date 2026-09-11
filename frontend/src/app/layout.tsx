import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppShell } from "@/components/layout/AppShell";

import { LanguageProvider } from "@/lib/context/LanguageContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";

export const metadata: Metadata = {
  title: "NLAMS | National Land Acquisition & Management System",
  description: "Unified digital command center for statutory RFCTLARR land acquisition, compensation, and R&R monitoring across India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(event) {
                  if (
                    (event.filename && (
                      event.filename.includes('chrome-extension://') ||
                      event.filename.includes('moz-extension://') ||
                      event.filename.includes('safari-extension://')
                    )) ||
                    (event.error && event.error.stack && (
                      event.error.stack.includes('chrome-extension://') ||
                      event.error.stack.includes('moz-extension://') ||
                      event.error.stack.includes('M_ID')
                    )) ||
                    (event.message && event.message.includes("reading 'M_ID'"))
                  ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  if (
                    event.reason && (
                      (event.reason.stack && event.reason.stack.includes('chrome-extension://')) ||
                      (event.reason.message && (event.reason.message.includes('M_ID') || event.reason.message.includes('chrome-extension://')))
                    )
                  ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased">
        <QueryProvider>
          <AuthProvider>
            <LanguageProvider>
              <NotificationProvider>
                <AppShell>
                  {children}
                </AppShell>
              </NotificationProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
