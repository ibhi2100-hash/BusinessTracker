import { closeDbConnection } from "../db/connection"
import { getDb } from "../db/indexDB"
import { syncEvents } from "@/services/syncService"
import { TABLES } from "../db/schema"
import { getByIndex } from "../db/helpers"

export async function syncEvent() {
  const db = await getDb()
  try {
    const status = "pending"
    const events = await getByIndex(TABLES.EVENTS, "by_status", status)

    if (!events.length) return

    const response = await syncEvents(events)
    const { results } = response

    for (const r of results) {
      if (r.status === "duplicate" || r.status === "synced") {
        await db.delete(TABLES.EVENTS, r.eventId)
      }
    }
  } finally {
    // Close the connection after sync completes
    closeDbConnection()
  }
}