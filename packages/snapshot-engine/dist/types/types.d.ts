export interface SnapshotContext {
    aggregateId: string;
    aggregateType: string;
    version: number;
    eventCountSinceSnapshot: number;
    lastSnapshotAt: Date | null;
    now: Date;
}
export interface SnapshotPolicy {
    shouldSnapshot(context: SnapshotContext): boolean;
}
