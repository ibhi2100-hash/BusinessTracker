import { SyncRepository } from "../contracts/SyncRepository";
import { ConflictResolver } from "../contracts/ConflictResolver";
import { FailureService } from "./FailureService";
import { AggregateSyncService } from "./AggragateSyncService";
export declare class SyncService {
    private repository;
    private aggregateSync;
    private failureService;
    private conflictResolver;
    constructor(repository: SyncRepository, aggregateSync: AggregateSyncService, failureService: FailureService, conflictResolver: ConflictResolver);
    execute(): Promise<void>;
    private syncGroup;
    private processResult;
}
