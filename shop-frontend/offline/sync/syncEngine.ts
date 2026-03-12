import { getDb } from "../db/indexDB"
import { syncEvents } from "@/services/syncService"
import { TABLES } from "../db/schema"
import { addDashboardSnapshot, getPendingEvents } from "../db/helpers"

export async function syncEvent() {
    const db = await getDb()
    const events = await getPendingEvents()

    if(!events.length) return

    const response = await syncEvents(events)
    console.log("Sync Events Response", response)

    const { results, snapshot } = response;

    await addDashboardSnapshot(snapshot)

    for ( const r of results) {
        if(r.status === "success") {
            await db.delete(TABLES.EVENTS, r.eventId)
        }
    }
}