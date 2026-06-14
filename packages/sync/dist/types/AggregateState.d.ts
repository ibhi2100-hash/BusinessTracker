export interface AggregateState {
    id: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    lastEventId?: string;
    lastLogicClock?: number;
    lastGlobalPosition?: bigint;
    lastSnapshotVersion?: number;
    updatedAt: Date;
}
