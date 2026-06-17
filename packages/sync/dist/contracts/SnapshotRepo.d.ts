import { AggregateState } from "../types/AggregateState";
export interface SnapshotRepository {
    saveSnapshot(state: AggregateState): Promise<void>;
    getSnapshot(aggregateId: string, aggregateType: string): Promise<AggregateState | null>;
    deleteSnapshot(aggregateId: string, aggregateType: string): Promise<void>;
}
