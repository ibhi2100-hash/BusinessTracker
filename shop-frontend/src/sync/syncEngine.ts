import { getDb } from "@/src/db";
import { syncService } from "../services/syncService";
import { useAuthStore } from "../store/useAuthStore";

export async function syncEngine() {
  const userId = useAuthStore.getState().user?.id;
  const db = getDb(userId);

  if (!db) return;

  // ONLY pending events
  const events = await db.events
    .where("status")
    .equals("pending")
    .toArray();

  if (!events.length) return;

   await syncService.sync();
}