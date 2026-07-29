// SQLiteEventRepository.ts

import { StoredEvent } from "@business/shared-types";
import { EventRepository } from "./contracts";
import { EventStatements } from "../../statements/events/EventStatements";
interface EventRow {
    id: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    expectedAggregateVersion: number;
    type: string;
    mode: string;
    businessId: string;
    branchId: string;
    payload: string;
    metadata: string;
    createdAt: string;
    globalPosition: number;
}
export class SQLiteEventRepository
implements EventRepository {

    constructor(
        private readonly statements: EventStatements
    ) {}

    async append(
        events: readonly StoredEvent[]
    ): Promise<void> {

        for (const event of events) {

            await this.statements.insert.execute(
                this.toInsertParams(event)
            );

        }

    }

    async loadAggregate(
        aggregateId: string
    ): Promise<StoredEvent[]> {

        const rows =
            await this.statements
                .loadAggregate
                .query<any>([
                    aggregateId
                ]);

        return rows

    }

    async exists(
        eventId: string
    ): Promise<boolean> {

        return this.statements
            .exists
            .exists([
                eventId
            ]);

    }

    async loadSince(
        position: bigint
    ): Promise<StoredEvent[]> {

        const rows =
            await this.statements
                .loadSince
                .query<any>([
                    Number(position)
                ]);

        return rows

    }

    async loadById(
        id: string
    ): Promise<StoredEvent | null> {

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

    async delete(
        id: string
    ): Promise<void> {

        await this.statements
            .deleteEvent
            .execute([
                id
            ]);

    }

    private toInsertParams(
        event: StoredEvent
    ): unknown[] {

        return [

            event.event.id,

            event.event.aggregateId,

            event.event.aggregateType,

            event.event.aggregateVersion,

            event.event.expectedAggregateVersion,

            event.event.type,

            event.event.mode,

            event.event.actor.businessId,

            event.event.actor.branchId,

            JSON.stringify(event.event.payload),

            JSON.stringify(event.event.metadata),

            event.event.metadata.occuredAt

        ];

    }



}