import { SnapshotRepository } from "../contracts/SnapshotRepo";
import { AggregateState } from "../types/AggregateState";
export declare class SnapshotSyncService {
    private snapshots;
    constructor(snapshots: SnapshotRepository);
    update(state: AggregateState): Promise<void>;
    get(aggregateId: string, aggregateType: string): Promise<AggregateState | null>;
    invalidate(aggregateId: string, aggregateType: string): Promise<void>;
}
