import { BaseEvent } from "@business/shared-types";
export interface SyncRequest {
    aggregateId: string;
    aggregateType: string;
    baseVersion: number;
    events: BaseEvent[];
}
