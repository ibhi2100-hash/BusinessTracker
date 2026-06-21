import { AppDB } from "@/src/db"
import { EventRepository } from "@business/events"
import { BaseEvent } from "@business/shared-types"

export class IndexedDbRepository implements EventRepository<BaseEvent> {
    constructor(
        private readonly db: AppDB
    ){}
    async append(event: BaseEvent<string, Record<string, any>>): Promise<void> {
        this.appendMany([event])
    }
    async appendMany(events: BaseEvent<string, Record<string, any>>[]): Promise<void> {
        await this.db.transaction(
            "rw",
            this.db.events,
            async () => {
                await this.db.events.bulkPut(events)
            }
        )
    }

    async loadAggregate(aggregateId: string): Promise<BaseEvent<string, Record<string, any>>[]> {
        return this.db.events
            .where("aggregateId")
            .equals(aggregateId)
            .sortBy("aggregateVersion")
    }

    async loadSince(globalPosition: bigint): Promise<BaseEvent<string, Record<string, any>>[]> {
        return []
    }

    loadByIds(id: string): Promise<BaseEvent<string, Record<string, any>>>[] {
        return [this.db.events.get(id) as Promise<BaseEvent<string, Record<string, any>>>];
    }

    async exists(eventId: string): Promise<boolean> {
        return(
            (await this.db.events.get(eventId)) != null
        )
    }
}
