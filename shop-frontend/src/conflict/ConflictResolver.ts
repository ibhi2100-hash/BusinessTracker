import { SyncApi } from "@business/sync";
import { MergeStrategy } from "../strategies/MergerStrategy";
import { SyncConflict, ConflictResolution } from "@business/sync";
import { BaseEvent } from "@business/shared-types";
import { ResolutionType } from "@business/sync";

export class AppConflictResolver {

  constructor(
    private api: SyncApi,
    private strategies: Map<string, MergeStrategy>
  ) {}

  async resolve(
    conflict: SyncConflict,
    pending: BaseEvent[]
  ): Promise<ConflictResolution> {

    const strategy =
      this.strategies.get(conflict.aggregateType);

    if (!strategy) {

      return {
        type: ResolutionType.MANUAL,
        events: [],
        reason: "No merge strategy registered"
      };
    }

    // 1. load authoritative server state
    const serverState =
      await this.api.getAggregateState(
        conflict.aggregateId,
        conflict.aggregateType
      );

    if (!serverState) {

      return {
        type: ResolutionType.REJECTED,
        events: [],
        reason: "Aggregate no longer exists"
      };
    }

    // 2. load server event history for rebase
    const serverEvents =
      await this.api.getEventsSince(
        serverState.lastGlobalPosition
      );

    // 3. delegate decision to strategy
    return strategy.resolve(
      conflict,
      serverEvents,
      pending
    );
  }
}