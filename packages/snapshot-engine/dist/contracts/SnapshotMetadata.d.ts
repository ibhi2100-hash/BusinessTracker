export interface SnapshotMetadata {
    aggregateId: string;
    aggregateType: string;
    currentVersion: number;
    snapshotVersion: number;
    lastSnapshotAt: Date | null;
    eventCountSinceSnapshot: number;
}
