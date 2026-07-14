// SQLiteEventRepository.ts

import { StoredEvent } from "@business/shared-types";
import { EventRepository } from "./contracts";
import { EventStatements } from "../../sqlite/PreparedStatement/StatementRegistry/events/EventStatements";

export class SQLiteEventRepository 
implements EventRepository{

  constructor(
    private readonly statements:
    EventStatements
  ){}

  async append(events: readonly StoredEvent[]): Promise<void> {
    for(const event of events){
      await this.statements.insert.execute([
        event.event.id,
        event.event.aggregateId,
        event.event.aggregateType,
        event.event.aggregateVersion,
        event.event.expectedAggregateVersion,
        event.event.type,
        event.event.mode,
        event.event.actor,
        event.event.metadata,
        JSON.stringify(event.event.payload),
        event.event.metadata.occurredAt,
        
      

      ])
    }
  }


async loadAggregate(
    aggregateId: string
): Promise<StoredEvent[]> {

    const rows =
        await this
            .statements
            .loadAggregate
            .query<any>([
                aggregateId
            ]);

    return rows.map(this.toStoredEvent);

}
  
async exists(
    eventId: string
): Promise<boolean> {

    return this
        .statements
        .exists
        .exists([
            eventId
        ]);

}
async loadSince(
    position: bigint
): Promise<StoredEvent[]> {

    const rows =
        await this
            .statements
            .loadSince
            .query<any>([
                Number(position)
            ]);

    return rows.map(this.toStoredEvent);

}

async loadById(
    id: string
): Promise<StoredEvent | null> {

    const row =
        await this
            .statements
            .loadById
            .scalar<any>([
                id
            ]);

    if (!row) {

        return null;

    }

    return this.toStoredEvent(row);

}

private toInsertParams(
    event: StoredEvent
): unknown[] {

    return [

        event.id,

        event.aggregateId,

        event.aggregateType,

        event.aggregateVersion,

        event.expectedAggregateVersion,

        event.type,

        event.businessId,

        event.branchId,

        JSON.stringify(event.payload),

        JSON.stringify(event.metadata),

        event.createdAt

    ];

}
private toStoredEvent(
    row: any
): StoredEvent {

    return {

        ...row,

        payload:
            JSON.parse(row.payload),

        metadata:
            JSON.parse(row.metadata)

    };

}











}