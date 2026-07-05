// SnapshotRepository.ts

import { Snapshot } from "@business/shared-types";

export interface SnapshotRepository {

  save(
    snapshot: Snapshot
  ): Promise<void>;

  saveMany(
    snapshots: Snapshot[]
  ): Promise<void>;

  getLatest(
    aggregateId: string,
    aggregateType: string
  ): Promise<Snapshot | null>;

  getVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ): Promise<Snapshot | null>;

  delete(
    aggregateId: string,
    aggregateType: string
  ): Promise<void>;

  exists(
    aggregateId: string,
    aggregateType: string,
    version: number
  ): Promise<boolean>;
}