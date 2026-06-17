import { SyncRepository } from "../contracts/SyncRepository";
import { BaseEvent } from "@business/shared-types";
import { SyncResult } from "../types/SyncResult";
export declare class AggregateSyncService {
    private repository;
    constructor(repository: SyncRepository);
    syncAggregate(events: BaseEvent[]): Promise<SyncResult>;
}
