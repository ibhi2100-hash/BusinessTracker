import { dbPromise } from "../db/indexDB"

export async function syncEvents() {
    const db = dbPromise
    const events = await db
        .where("synced")
        .equals(false)
        .toArray()

    if(!events.length) return

    const snapshot = await eventService.sync(events)

    db.snapshot.put(snapshot)
}