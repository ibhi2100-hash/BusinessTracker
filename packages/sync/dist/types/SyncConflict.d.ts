import { AggregateState } from "./AggregateState";
import { ConflictType } from "./ConflictType";
export interface SyncConflict {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    type: ConflictType;
    message: string;
    clientLastGlobalPosition: bigint;
    localVersion: number;
    serverVersion: number;
    serverState?: AggregateState;
}
