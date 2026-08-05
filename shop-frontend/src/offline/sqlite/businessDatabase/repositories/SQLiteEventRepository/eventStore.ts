// SQLiteEventRepository.ts
import { DomainEvent } from "@business/shared-types";
import { EventRepository } from "./contracts";
import { EventStatements } from "../../statements/events/EventStatements";
interface EventRow {

    id: string;

    aggregateId: string;

    aggregateType: string;

    expectedAggregateVersion: number;

    type: string;

    mode: "OPENING" | "LIVE";

    businessId: string | null;

    branchId: string | null;

    payload: string;

    actor: string;

    causationId: string;

    logicClock: number;

    createdAt : number;

    checksum: string | null;
}
export class SQLiteEventRepository
implements EventRepository {

    constructor(
        private readonly statements: EventStatements
    ) {}

    async append(
        events: readonly DomainEvent[]
    ): Promise<void> {

        for (const event of events) {

    const row =
        EventMapper.toRow(event);

    await this.statements.insert.execute([
        row.id,
        row.aggregateId,
        row.aggregateType,
        row.expectedAggregateVersion,
        row.type,
        row.payload,
        row.businessId,
        row.branchId,
        row.mode,
        row.actor,
        row.causationId,
        row.logicClock,
        row.createdAt,
        row.checksum
    ]);
}
    const SQLiteEvents =
        await this.loadAllEvents();
    console.log("This are the SQLite Saved Events: ", SQLiteEvents)
    }

    async loadAggregate(
        aggregateId: string
    ): Promise<DomainEvent[]>{
        const rows = await this.statements.loadAggregate.query<EventRow>([
                    aggregateId
                ]);

        return rows.map(EventMapper.fromRow)

    }

    async exists(
        eventId: string
    ): Promise<boolean> {

        return this.statements.count
                .exists([
                    eventId
                ]);

    }

    async loadSince(
        position: bigint
    ): Promise<DomainEvent[]> {

        const rows =
            await this.statements
                .loadSince
                .query<any>([
                    Number(position)
                ]);

        return rows.map(EventMapper.fromRow)

    }

    async loadById(
        id: string
    ): Promise<DomainEvent | null> {

        const rows =
            await this.statements
                .loadEvent
                .query<any>([
                    id
                ]);

        if (rows.length === 0) {
            return null;
        }


        return rows[0];

    }

    async count(): Promise<number> {

        const rows =
            await this.statements
                .count
                .query<{ count: number }>([]);

        return rows[0]?.count ?? 0;

    }

    async lastPosition(): Promise<bigint> {

        const rows =
            await this.statements
                .lastPosition
                .query<{ position: number | null }>([]);

        return BigInt(rows[0]?.position ?? 0);

    }

    async loadAllEvents():Promise<DomainEvent[]>{
        const rows = 
            await this.statements.loadAll.query<EventRow>();

        return rows.map(EventMapper.fromRow)
    }

    


}

class EventMapper {
    static toRow(
        event: DomainEvent
    ): EventRow {
        return {
            id: event.id,

            aggregateId: event.aggregateId,

            aggregateType: event.aggregateType,

            expectedAggregateVersion: event.expectedAggregateVersion,

            type: event.type,

            mode: event.mode,

            businessId: event.businessId,

            branchId: event.branchId,

            payload: JSON.stringify(
                event.payload
            ),
            actor: JSON.stringify(
                event.actor,
            ),
            causationId: event.causationId,

            logicClock: event.logicClock,

            createdAt: event.createdAt,

            checksum: event.checksum ?? null
        }
    
        
    }

    static fromRow(
        row: EventRow
    ): DomainEvent {
        return {
           id: row.id,

           aggregateId: row.aggregateId,

           aggregateType: row.aggregateType,

           expectedAggregateVersion: row.expectedAggregateVersion,

           type: row.type,

           payload: row.payload,

           businessId: row.businessId,

           branchId: row.branchId,

           mode: row.mode,

           actor: JSON.parse(
                row.actor
            ),
           causationId: row.causationId,

           logicClock: row.logicClock,

           createdAt: row.createdAt,

           checksum: row.checksum
        }
    }
    

}
