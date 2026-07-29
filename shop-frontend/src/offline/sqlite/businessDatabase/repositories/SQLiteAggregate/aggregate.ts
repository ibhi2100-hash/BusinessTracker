// aggregate.ts

export interface AggregateRecord {

  id: string;

  aggregateId: string;

  aggregateType: string;

  version: number;

  lastEventId?: string;

  lastGlobalPosition?: bigint;

  lastSnapshotVersion?: number;

  updatedAt: number;
}