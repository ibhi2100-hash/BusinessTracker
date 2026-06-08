import { SnapshotReducer } from "@business/snapshot-engine";
export declare class SnapshotReducerRegistry {
    private reducers;
    register(reducer: SnapshotReducer): void;
    get(aggregateType: string): SnapshotReducer | undefined;
    getAll(): SnapshotReducer<any>[];
}
