import { getDb } from "@/src/db/index";

export const syncService = {
  async sync() {
    const db = getDb();
    if (!db) return;

    const events = await db.events
      .where("synced")
      .equals(false)
      .toArray();

    for (const event of events) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(event),
        });

        await db.events.update(event.id, { synced: true });
      } catch {
        // leave as unsynced
      }
    }
  }
};