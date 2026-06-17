import { BaseEvent } from "@business/shared-types";
import { SyncApi } from "../contracts/syncApi";
import { MergeStrategy } from "../strategies/MergeStrategy";
import { SyncConflict } from "../types/SyncConflict";
import { ConflictResolution } from "../contracts/ConflictResolution";
export declare class ConflictResolver {
    private api;
    private strategies;
    constructor(api: SyncApi, strategies: Map<string, MergeStrategy>);
    resolve(conflict: SyncConflict, pending: BaseEvent[]): Promise<ConflictResolution>;
}
