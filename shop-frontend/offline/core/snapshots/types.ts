export interface AggregateSnapshot {

  id: string;

  aggregateId: string;

  aggregateType: string;

  version: number;

  state: any;

  lastEventId?: string;

  updatedAt: number;
}