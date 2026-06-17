import { SyncRepository } from "../contracts/SyncRepository";
import { SyncApi } from "../contracts/syncApi";
import { RetryEngine } from "./RetryEngine";
import { ConflictResolver } from "./ConflictResolver";
export declare class SyncEngine {
    private repository;
    private api;
    private retryEngine;
    private conflictResolver;
    constructor(repository: SyncRepository, api: SyncApi, retryEngine: RetryEngine, conflictResolver: ConflictResolver);
    sync(): Promise<void>;
    private syncAggregate;
    private processSuccess;
    private processFailures;
    private processConflicts;
}
