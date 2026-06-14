import { BaseEvent } from "@business/shared-types";

import { SyncRepository } from "../contracts/SyncRepository";
import { ConflictResolver } from "../contracts/ConflictResolver";

import { groupEventsByAggregate } from "../helpers/groupEventsByAggregate";

import { FailureService } from "./FailureService";
import { AggregateSyncService } from "./AggragateSyncService";

export class SyncService {

  constructor(
    private repository:
      SyncRepository,

    private aggregateSync:
      AggregateSyncService,

    private failureService:
      FailureService,

    private conflictResolver:
      ConflictResolver
  ) {}

  async execute() {

    const pending =
      await this.repository
        .getPendingEvents();

    if (!pending.length) {
      return;
    }

    const grouped =
      groupEventsByAggregate(
        pending
      );

    for (const group of grouped) {

      await this.syncGroup(
        group
      );
    }
  }

  private async syncGroup(
    events: BaseEvent[]
  ) {

    try {

      for (const event of events) {

        await this.repository
          .markSyncing(
            event.id
          );
      }

      const result =
        await this.aggregateSync
          .syncAggregate(
            events
          );

      await this.processResult(
        events,
        result
      );

    } catch (error: any) {

      for (const event of events) {

        await this.failureService
          .failEvent(
            event,
            error?.message ??
            "SYNC_FAILED"
          );
      }
    }
  }

  private async processResult(
    events: BaseEvent[],
    result: any
  ) {

    const {
      success = [],
      failed = [],
      conflicts = [],
      serverState
    } = result;

    // SUCCESS

    for (const item of success) {

      await this.repository
        .markSynced(
          item.eventId,
          item.aggregateVersion,
          item.globalPosition
        );
    }

    // FAILED

    for (const item of failed) {

      const event =
        events.find(
          e =>
            e.id ===
            item.eventId
        );

      if (!event) {
        continue;
      }

      await this.failureService
        .failEvent(
          event,
          item.error
        );
    }

    // SERVER STATE

    if (serverState) {

      await this.repository
        .saveAggregateState(
          serverState
        );
    }

    // CONFLICTS

    for (const conflict of conflicts) {

      await this.conflictResolver
        .resolve(
          conflict
        );
    }
  }
}