import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { BaseEvent } from "@business/shared-types";


export class IndexedDbVersionManager {

  async update(event: BaseEvent) {
    const userId = useAuthStore.getState().user.id;
    const db = getDb(userId)
    // Construct a full AggregateRecord expected by IndexedDB
    await db.aggregates.put({
      id: event.aggregateId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType ?? "unknown",
      version: event.aggregateVersion,
      lastEventId: event.id,
      lastLogicClock: event.logicClock,
      updatedAt: event.createdAt
    });
  }
}