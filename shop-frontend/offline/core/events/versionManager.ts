import { AppDB } from "@/src/db";
import { BaseEvent } from "@business/shared-types";


export class IndexedDbVersionManager {
  constructor(private db: AppDB){}
  async update(event: BaseEvent) {
 
    // Construct a full AggregateRecord expected by IndexedDB
    await this.db.aggregates.put({
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