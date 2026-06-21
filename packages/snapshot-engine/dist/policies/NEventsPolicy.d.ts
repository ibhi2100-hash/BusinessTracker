import { SnapshotPolicy, SnapshotContext } from "../types/types";
export declare class EveryNEventsPolicy implements SnapshotPolicy {
    private readonly threshold;
    constructor(threshold: number);
    shouldSnapshot(context: SnapshotContext): boolean;
}
