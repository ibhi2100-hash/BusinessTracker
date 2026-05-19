"use client"

import "./globals.css"

import { Toaster } from "sonner"
import { Providers } from "./providers"
import SyncBootstrap from "@/offline/bootstrap/syncBootstrap"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>

          {/* Global Sync Engine */}
          <SyncBootstrap />

          {children}

          <Toaster
            richColors
            position="top-right"
          />
        </Providers>
      </body>
    </html>
  )
}