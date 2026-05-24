"use client"

import "./globals.css"

import { Toaster } from "sonner"
import { Providers } from "./providers"
import SyncBootstrap from "@/offline/bootstrap/syncBootstrap"
import { useEffect, useState } from "react"
const metadata = {
  manifest: "/manifest.json",
  title: "Shop App",
  description: "A modern e-commerce application built with Next.js and TypeScript.",
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  },[])
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