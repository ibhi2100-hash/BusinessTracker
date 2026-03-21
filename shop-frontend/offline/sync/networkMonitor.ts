import { syncEvent } from "./syncEngine"
if (typeof window !== "undefined") {
  window.addEventListener("offline", () => {
    console.log("Went offline → stopping interval")
    stopInterval()
  });

  window.addEventListener("online", () => {
    console.log("Back online → syncing")
    syncEvent()
  });
}
let syncInProgress = false
let intervalId: ReturnType<typeof setInterval> | null = null

export async function runSync() {
    if (syncInProgress) {
        console.log("Sync already running, skipping...")
        return
    }

    syncInProgress = true

    try {
        console.log("Running sync...")
        await syncEvent()
    } catch (err) {
        console.error("Sync error:", err)
    } finally {
        syncInProgress = false
    }
}
export function startInterval() {
    if (intervalId) return // prevent duplicate intervals

    intervalId = setInterval(() => {
        if (navigator.onLine) {
            runSync()
        }
    }, 10000) // 10 seconds (adjust as needed)
}

export function stopInterval() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}