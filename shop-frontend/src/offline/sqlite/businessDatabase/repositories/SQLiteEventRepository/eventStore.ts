// SQLiteEventRepository.ts
import { DomainEvent } from "@business/shared-types";
import { EventRepository } from "./contracts";
import { EventStatements } from "../../statements/events/EventStatements";
import { ProjectionRebuildOptions } from "../../projections/rebuild/types";
import { BackendAcceptedEvent } from "@business/shared-types";
import { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { EventStatementKeys } from "../../statements/events/Keys";
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

    correlationId: string;

    logicClock: number;

    createdAt : number;

    checksum: string | null;
}
export class SQLiteEventRepository implements EventRepository {

    constructor(
        private readonly statements: EventStatements
    ) {}

    private toInsertOperation(
        event: DomainEvent
    ): SQLiteStatementOperation {

        const row = EventMapper.toRow(event);

        return {
            statementKey: EventStatementKeys.insert,

            params: [
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
                row.correlationId,
                row.logicClock,
                row.createdAt,
                row.checksum
            ]
        };
    }

    async append(
        events: readonly DomainEvent[]
    ): Promise<void> {

        for (const event of events) {

            const operation =
                this.toInsertOperation(event);

            await this.statements.insert.execute(
                operation.params
            );
        }
    }

    appendOperations(
        events: readonly DomainEvent[]
    ): SQLiteStatementOperation[] {

        return events.map(
            event => this.toInsertOperation(event)
        );
    }

    async loadAggregate(
        aggregateId: string
    ): Promise<DomainEvent[]> {

        const rows =
            await this.statements.loadAggregate.query<EventRow>([
                aggregateId
            ]);

        return rows.map(EventMapper.fromRow);
    }

    async exists(
        eventId: string
    ): Promise<boolean> {

        return this.statements.exists.exists([
            eventId
        ]);
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
    async loadAllEvents():Promise<DomainEvent[]>{
        const rows = 
            await this.statements.loadAll.query<EventRow>();

        return rows.map(EventMapper.fromRow)
    }

    async *stream(
        options: ProjectionRebuildOptions = {}
    ): AsyncGenerator<readonly DomainEvent[], void, unknown>{

        const batchSize = options.batchSize ?? 500;
        let cursor = options.fromLogicalClock ?? 0;

        const asOfTimestamp = options.asOf instanceof Date ? options.asOf.getTime(): null;

        const toLogicClock = options.toLogicalClock ?? null;

        while (true){
            const rows = await this.statements.streamEvent.query<EventRow>([
                cursor,
                toLogicClock,
                toLogicClock,
                asOfTimestamp,
                asOfTimestamp,
                batchSize
            ]);

            if(rows.length === 0) break;

            const events = rows.map(EventMapper.fromRow);
            yield events;
            const last = events[events.length - 1];
            if(!last) break;

            cursor = last.logicClock;
        }
    }

    async applyRemoteEvents(events: BackendAcceptedEvent[]): Promise<void> {
        
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

            correlationId: event.correlationId,

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

           payload: JSON.parse(
                row.payload
           ),

           businessId: row.businessId,

           branchId: row.branchId,

           mode: row.mode,

           actor: JSON.parse(
                row.actor
            ),

            correlationId: row.correlationId,
            
           causationId: row.causationId,

           logicClock: row.logicClock,

           createdAt: row.createdAt,

           checksum: row.checksum
        }
    }
}
