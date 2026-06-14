import { SyncRepository } from "../contracts/SyncRepository";
import { SyncTransport } from "../contracts/SyncTransport";
export declare class AggregateSyncService {
    private repository;
    private transport;
    constructor(repository: SyncRepository, transport: SyncTransport);
    syncAggregate(events: any[]): Promise<import("..").SyncResponse>;
}
