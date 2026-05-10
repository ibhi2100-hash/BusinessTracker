import { getDb } from "@/src/db/index";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const syncService = {
  async sync() {
    const userId = useAuthStore.getState().user?.id;
    const db = getDb(userId);
    if (!db) return;

    const events = await db.events
      .where("status")
      .equals("PENDING") // safer than false in IndexedDB contexts
      .toArray();

    if (!events.length) return;

    // optional: batch instead of per-event calls
    const response = await fetch(`${API_URL}/sync`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    });

    // IMPORTANT: check HTTP status explicitly
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result = await response.json();

    /**
     * Expected shape:
     * {
     *   results: [
     *     { id: string, status: "synced" | "failed" }
     *   ]
     * }
     */

    const successUpdates = result.results.success || [];
    const failedUpadates = result.results.failed

    await db.transaction("rw", db.events, async () => {
      for (const r of successUpdates) {
        if (r.status === "SYNCED") {
          await db.events.update(r.eventId, {
            synced: true,
            status: "SYNCED",
          });
        }

        if (r.status === "duplicate") {
          await db.events.update(r.eventId, {
            synced: true,
            status: "SYNCED",
          });
        }
      };
      for(const r of failedUpadates){
        if (r.status === "FAILED") {
          await db.events.update(r.eventId, {
            synced: false,
            status: "FAILED",
          });
        }
      }
    });
  },
};