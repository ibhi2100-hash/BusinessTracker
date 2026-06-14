import { BaseEvent } from "@business/shared-types";
import { SnapshotRepo } from "../contracts/SnapshotRepo";
import { SnapshotRegistry } from "../contracts/SnapshotRegistry";
export class SnapshotEngine {
  constructor(
    private repo: SnapshotRepo,
    private registry: SnapshotRegistry
  ) {}

  async process(event: BaseEvent) {

    const reducer =
      this.registry.get(event.aggregateType);

    if (!reducer) return;

    const snapshotKey =
      this.buildSnapshotKey(event);

    const snapshot =
      await this.repo.get(snapshotKey);

    const currentState =
      snapshot?.state ??
      reducer.initialState();

    const nextState =
      reducer.reduce(currentState, event);

    const nextVersion =
      event.aggregateVersion ?? 0;

    const nextEventCount =
      (snapshot?.eventCount ?? 0) + 1;

    await this.repo.save({
      id: snapshotKey,
      snapshotKey,
      snapshotType: event.aggregateType,
      scope: event.scope,

      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,

      businessId: event.businessId ?? undefined,
      branchId: event.branchId ?? undefined,

      state: nextState,

      version: nextVersion,
      eventCount: nextEventCount,

      lastGlobalPosition: event.globalPosition ?? 0n,

      updatedAt: Date.now(),
      createdAt: snapshot?.createdAt ?? Date.now()
    });
  }

  private buildSnapshotKey(event: BaseEvent): string {
    return `${event.scope}:${event.aggregateType}:${event.aggregateId}`;
  }
}