// lib/sync/syncMonitor.ts
import { createSyncManager } from "@/src/services/sync"

let syncInProgress = false
let intervalId: ReturnType<typeof setInterval> | null = null

export async function runSync() {
  // Prevent concurrent syncs
  if (syncInProgress) {
    console.log("Sync already running...")
    return
  }

  //ONline checker 

  if(!navigator.onLine){
     console.log("Offline → sync skipped")
    return
  }
  syncInProgress = true

  try {
    console.log("Running sync engine...")
    const synceManager = createSyncManager();
    synceManager.sync()
  } catch (error) {
    console.error("Sync failed:", error)
  } finally {
    syncInProgress = false
  }
}

export function startSyncMonitor() {
  // Prevent duplicate intervals
  if (intervalId) return

  console.log("Starting sync monitor...")

  // Run immediately if online
  if (navigator.onLine) {
    runSync()
  }

  // Retry/check every 10s
  intervalId = setInterval(() => {
    console.log("Periodic sync check...")

    // Even if offline, interval keeps running
    // so reconnect is automatically handled
    runSync()
  }, 10000)

  // Online listener
  window.addEventListener("online", handleOnline)

  // Offline listener
  window.addEventListener("offline", handleOffline)

  // Sync when user returns to tab
  document.addEventListener("visibilitychange", handleVisibility)
}

export function stopSyncMonitor() {
  console.log("Stopping sync monitor...")

  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  window.removeEventListener("online", handleOnline)
  window.removeEventListener("offline", handleOffline)
  document.removeEventListener("visibilitychange", handleVisibility)
}

function handleOnline() {
  console.log("Back online → syncing immediately")
  runSync()
}

function handleOffline() {
  console.log("Went offline")
}

function handleVisibility() {
  if (document.visibilityState === "visible") {
    console.log("Tab active → sync")
    runSync()
  }
}