"use client"

import "./globals.css"

import { Toaster } from "sonner"
import { Providers } from "./providers"
import { runSync } from "@/offline/sync/networkMonitor"
import { startInterval } from "@/offline/sync/networkMonitor"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Do not auto-start sync on pages like /register or /login
  const isAuthPage = typeof window !== "undefined" && location.pathname.startsWith("/register");

  if (navigator.onLine && !isAuthPage) {
    runSync();
    startInterval();
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}