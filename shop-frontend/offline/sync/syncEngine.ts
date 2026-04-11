import { getDb } from "../db/indexDB"
import { TABLES } from "../db/schema"
import { getByIndex } from "../db/helpers"
import { syncEvents } from "@/services/sync/syncEvents"
import { BaseEvent } from "../events/eventFactory"

export async function syncEvent() {
  const db = await getDb()
  try {
    const status = "pending"
    const events: BaseEvent[] = await getByIndex(TABLES.EVENTS, "by_status", status)

    if (!events.length) return

    const response = await syncEvents(events)
    const { results } = response

    for (const r of results) {
      if (r.status === "duplicate" || r.status === "synced") {
        await db.delete(TABLES.EVENTS, r.eventId)
      }
    }
  } finally {
    
  }
}