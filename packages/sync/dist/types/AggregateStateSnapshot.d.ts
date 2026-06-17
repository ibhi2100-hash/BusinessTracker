export interface AggregateStateSnapshot {
    aggregateId: string;
    aggregateType: string;
    version: number;
    lastEventId?: string;
    lastLogicClock?: number;
    lastGlobalPosition?: bigint;
    lastSnapshotVersion?: number;
}
