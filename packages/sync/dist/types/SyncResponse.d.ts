import { AggregateState } from "./AggregateState";
import { SyncConflict } from "./SyncConflict";
export interface SyncResponse {
    success: {
        eventId: string;
        aggregateVersion: number;
        globalPosition?: bigint;
    }[];
    failed: {
        eventId: string;
        error: string;
    }[];
    conflicts: SyncConflict[];
    serverState?: AggregateState;
}
