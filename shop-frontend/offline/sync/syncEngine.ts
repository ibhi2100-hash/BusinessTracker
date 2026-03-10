import { getDb } from "../db/indexDB"
import { syncEvents } from "@/services/syncService"
import { TABLES } from "../db/schema"
import { addDashboardSnapshot, getPendingEvents } from "../db/helpers"

export async function syncEvent() {
    const db = getDb()
    const events = getPendingEvents()

    if(!events) return

    const snapshot = await syncEvents(events)

    await addDashboardSnapshot(snapshot)
}