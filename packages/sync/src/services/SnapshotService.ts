import { SnapshotRepository } from "../contracts/SnapshotRepo";
import { AggregateState } from "../types/AggregateState";
export class SnapshotSyncService {

  constructor(
    private snapshots: SnapshotRepository
  ) {}

  async update(
    state: AggregateState
  ) {

    await this.snapshots.saveSnapshot(
      state
    );
  }

  async get(
    aggregateId: string,
    aggregateType: string
  ) {
    return this.snapshots.getSnapshot(
      aggregateId,
      aggregateType
    );
  }

  async invalidate(
    aggregateId: string,
    aggregateType: string
  ) {

    await this.snapshots.deleteSnapshot(
      aggregateId,
      aggregateType
    );
  }
}