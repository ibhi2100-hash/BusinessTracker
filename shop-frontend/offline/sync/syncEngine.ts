import { getDb } from "../db/indexDB"
import { syncEvents } from "@/services/syncService"
import { TABLES } from "../db/schema"
import { getByIndex } from "../db/helpers"

export async function syncEvent() {
    const db = await getDb()
    const status = "pending";
    const events = await getByIndex(TABLES.EVENTS, "status", status )

    if(!events.length) return

    const response = await syncEvents(events)
    const { results, snapshot } = response;

for (const r of results) {
    console.log("single result from backend: ", r)
    if (r.status === "duplicate" || r.status === "synced") {
            await db.delete(TABLES.EVENTS, r.eventId)
        
    }
}
}