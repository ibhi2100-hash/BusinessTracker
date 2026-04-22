import { getDb } from "../core/db"
import { TABLES } from "../core/db/schema"
import { syncEvents } from "@/services/sync/syncEvents"
import { BaseEvent } from "../core/events/eventFactory"

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
  
      }
    }
  } finally {
    
  }
}