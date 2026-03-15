import { getDb } from "../db/indexDB"
import { syncEvents } from "@/services/syncService"
import { TABLES } from "../db/schema"
import { getByIndex } from "../db/helpers"

export async function syncEvent() {
    const db = await getDb()
    const synced = false;
    const events = await getByIndex(TABLES.EVENTS, "by_synced", synced )

    if(!events.length) return

    const response = await syncEvents(events)

    const { results, snapshot } = response;

    await db.put(TABLES.SNAPSHOT, snapshot)

    for ( const r of results) {
        if(r.status === "success") {
            await db.delete(TABLES.EVENTS, r.eventId)
        }
    }
}