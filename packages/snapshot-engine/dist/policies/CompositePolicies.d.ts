import { SnapshotPolicy, SnapshotContext } from "../types/types";
export declare class CompositeSnapshotPolicy implements SnapshotPolicy {
    private readonly policies;
    constructor(policies: SnapshotPolicy[]);
    shouldSnapshot(context: SnapshotContext): boolean;
}
