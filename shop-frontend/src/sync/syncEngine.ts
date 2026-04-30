import { getDb } from "@/src/db"

import { syncService } from "../services/syncService"
import { BaseEvent } from "@/offline/core/events/types"
import { useAuthStore } from "../store/useAuthStore"

export async function syncEvent() {
  const userId = useAuthStore.getState().user?.id
  const db = await getDb(userId)
  try {
    const status = "pending"
    const events: BaseEvent[] = await db.events.toArray();

    if (!events.length) return

    const response = await syncService.sync()
    const { results } = response

    for (const r of results) {
      if (r.status === "duplicate" || r.status === "synced") {
  
      }
    }
  } finally {
    
  }
}