import { BaseEvent } from "@business/shared-types";
export interface SyncConflict {
    aggregateId: string;
    aggregateType: string;
    serverVersion: number;
    snapshot?: any;
    serverEvents: BaseEvent[];
}
