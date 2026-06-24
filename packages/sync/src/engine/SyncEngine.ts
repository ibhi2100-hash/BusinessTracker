import { SyncRepository } from "../contracts/SyncRepository";
import { SyncApi } from "../contracts/syncApi";

import { RetryEngine } from "./RetryEngine";
import { ConflictResolver } from "./ConflictResolver";
import { BaseEvent } from "@business/shared-types";

import { groupByAggregate } from "../helpers/groupEventsByAggregate";

import { ResolutionType } from "../contracts/ConflictResolution";
import { SyncConflict } from "../types/SyncConflict";
import { SyncFailure } from "../types/SyncFailure";
import { SyncSuccess } from "../types/SyncSuccess";

export class SyncEngine {

  constructor(
    private repository: SyncRepository,
    private api: SyncApi,
    private retryEngine: RetryEngine,
    private conflictResolver: ConflictResolver
  ) {}

  async sync(): Promise<void> {

    const pending =
      await this.repository.getPendingEvents();

    if (pending.length === 0) return;

    const groups =
      groupByAggregate(pending);
      console.log("This are the grouped Event by aggregate: ", groups)

    for (const group of groups) {

      const baseState =
        await this.repository.getAggregateState(
          group.aggregateId,
          group.aggregateType
        );

      const baseVersion =
        baseState.version ?? 0;

      await this.syncAggregate(
        group.aggregateId,
        group.aggregateType,
        baseVersion,
        group.events
      );
    }
  }

  private async syncAggregate(
    aggregateId: string,
    aggregateType: string,
    baseVersion: number,
    events: BaseEvent[]
  ): Promise<void> {

    await this.repository.markSyncingBatch(
      events.map(e => e.id)
    );

    const result =
      await this.api.syncAggregate(
        aggregateId,
        aggregateType,
        baseVersion,
        events
      );

    await this.processSuccess(result.success);
    await this.processFailures(events, result.failed);
    await this.processConflicts(events, result.conflicts);
  }
private async processSuccess(
    success: SyncSuccess[]
): Promise<void> {

    for (const item of success) {

        await this.repository.markSynced(

            item.eventId,
            item.aggregateVersion,
            item.globalPosition

        );

    }

  }

  private async processFailures(

    events: BaseEvent[],

    failures: SyncFailure[]

): Promise<void> {

    for (const failure of failures) {

        const event =
            events.find(

                e =>
                e.id === failure.eventId

            );

        if (!event)
            continue;

        if (failure.retryable) {

            await this.retryEngine.schedule(

                event,

                failure.message

            );

        }
        else {

            await this.repository.markDead(

                event.id,

                failure.message

            );

        }

    }

  }

  private async processConflicts(
  events: BaseEvent[],
  conflicts: SyncConflict[]
): Promise<void> {

  for (const conflict of conflicts) {

    const localEvents =
      events.filter(
        e => e.aggregateId === conflict.aggregateId
      );

    const resolution =
      await this.conflictResolver.resolve(
        conflict,
        localEvents
      );

    if (resolution.type === ResolutionType.RESOLVED) {

      const baseState =
        await this.repository.getAggregateState(
          conflict.aggregateId,
          conflict.aggregateType
        );

      const retry =
        await this.api.syncAggregate(
          conflict.aggregateId,
          conflict.aggregateType,
          baseState.version,
          resolution.events
        );

      await this.processSuccess(retry.success);
      await this.processFailures(resolution.events, retry.failed);
    }

    else {
      await this.repository.saveConflict(
        conflict,
        resolution
      );
    }
  }
}
}