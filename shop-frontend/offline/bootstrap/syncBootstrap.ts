"use client"

import { useEffect } from "react"
import {
  startSyncMonitor,
  stopSyncMonitor,
} from "@/lib/syncMonitor"

export default function SyncBootstrap() {
  useEffect(() => {
    const path = window.location.pathname

    // Prevent sync on auth pages
    const isAuthPage =
      path.startsWith("/login") ||
      path.startsWith("/register")

    if (!isAuthPage) {
      startSyncMonitor()
    }

    return () => {
      stopSyncMonitor()
    }
  }, [])

  return null
}