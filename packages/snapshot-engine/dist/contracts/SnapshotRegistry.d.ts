import { SnapshotReducer } from "./SnapshotReducer";
export declare class SnapshotRegistry {
    private reducers;
    register(reducer: SnapshotReducer): void;
    get(aggregateType: string): SnapshotReducer | undefined;
}
