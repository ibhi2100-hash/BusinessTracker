// Snapshot.ts

export interface Snapshot<T = any> {

  id: string;

  aggregateId: string;

  aggregateType: string;

  version: number;

  lastGlobalPosition?: bigint;

  state: T;

  createdAt: number;
}