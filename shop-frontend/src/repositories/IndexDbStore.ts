import { getDb } from "../db";
import { useAuthStore } from "../store/useAuthStore";
import { BaseEvent } from "@business/shared-types";

export class IndexedDbEventStore {

  async exists(id: string): Promise<boolean> {

    const user =
      useAuthStore.getState().user;

      if (!user?.id) {
        throw new Error("User not available");
      }

    const userId = user.id;
    const db = getDb(userId);

    const event =
      await db.events.get(id);

    return !!event;
  }

  async append(
    event: BaseEvent
  ): Promise<void> {

    const user =
      useAuthStore.getState().user;

    if (!user?.id) {
      throw new Error("User not available");
    }

    const userId = user.id;

    const db = getDb(userId);

    await db.events.put(event);
  }
}