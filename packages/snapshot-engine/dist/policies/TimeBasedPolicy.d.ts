import { SnapshotPolicy, SnapshotContext } from "../types/types";
export declare class TimeBasedPolicy implements SnapshotPolicy {
    private readonly intervalMs;
    constructor(intervalMs: number);
    shouldSnapshot(context: SnapshotContext): boolean;
}
