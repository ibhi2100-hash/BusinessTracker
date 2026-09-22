// src/offline/sqlite/businessDatabase/sync/syncEngine.ts

import {
  BackendAcceptedEvent,
  BackendEventPayload,
  DomainEvent,
  Conflict,
  SyncEngineOptions,
  SyncPullResult,
  SyncPushResult,
  SyncRejected,
  SyncResult,
  SyncTransport,
} from "@business/shared-types";

import {
  PendingOutboxEvent,
  SQLiteOutboxRepository,
} from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";
import { SQLiteEventRepository } from "../repositories/SQLiteEventRepository/eventStore";
import { SQLiteSyncStateRepository } from "../repositories/SQLiteSyncRepository/SQLiteSyncRepository";
import { changeNotifier } from "../projections/changeNoifier";

export class SyncEngine {
  private readonly lockDurationMs: number;
  private readonly baseBackoffMs: number;
  private readonly pushBatchSize: number;
  private readonly pullBatchSize: number;

  constructor(
    private readonly outbox: SQLiteOutboxRepository,
    private readonly transport: SyncTransport,
    private readonly syncState: SQLiteSyncStateRepository,
    private readonly eventStore: SQLiteEventRepository,
    options: SyncEngineOptions = {}
  ) {
    this.lockDurationMs = options.lockDurationMs ?? 30_000;
    this.baseBackoffMs = options.baseBackoffMs ?? 1_000;
    this.pushBatchSize = options.pushBatchSize ?? 50;
    this.pullBatchSize = options.pullBatchSize ?? 100;
  }

  async sync(): Promise<SyncResult> {
    const startedAt = Date.now();
    const now = startedAt;

    // 1. Recover stale locks
    await this.outbox.resetStaleInFlight(now);

    let cursor = await this.syncState.getCursor();

    // 2. Read pending
    const pending = await this.outbox.getPending(
      now,
      this.pushBatchSize
    );

    let pushedAccepted: BackendAcceptedEvent[] = [];
    let pushedRejected: SyncRejected[] = [];
    let pushedConflicts: Conflict[] = [];

    // =========================================================
    // PHASE 1 — PUSH
    // =========================================================
    if (pending.length > 0) {
      await this.outbox.lockBatch(
        pending.map((p) => p.outboxId),
        now + this.lockDurationMs,
        now
      );

      const payloads: BackendEventPayload[] = pending.map((p) =>
        this.toBackendPayload(p.event)
      );

      let pushResult: SyncPushResult;
      try {
        pushResult = await this.transport.push(payloads);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        await this.scheduleRetries(pending, message, now);
        await this.syncState.persistFailure({
          error: message,
          occurredAt: Date.now(),
        });
        return {
          kind: "transient",
          error: message,
          attempted: pending.length,
          cursor,
        };
      }

      pushedAccepted = pushResult.accepted;
      pushedRejected = pushResult.rejected;
      pushedConflicts = pushResult.conflicts;

      // Apply outbox acknowledgements
      await this.applyPushAcknowledgements(
        pending,
        pushResult,
        now
      );
      console.log("This is SyncResult after Sync Happen: ", pushResult )
      // ────────────────────────────────────────────────────
      // IMMEDIATE PERSISTENCE
      // Fires changeNotifier → UI updates NOW, before pull.
      // ────────────────────────────────────────────────────

     

      const pendingAfterPush =
        await this.outbox.getPendingCount(now);

      console.log("This are pending Event after this sync has happen: ", pendingAfterPush, "And this is Result: ", pushResult)

      await this.syncState.persistPushResult({
        pushResult: {
          accepted: pushedAccepted,
          rejected: pushedRejected,
          conflicts: pushedConflicts,
        },
        pendingAfterPush,
        completedAt: Date.now(),
      });

      
    }

    
    
    const state = await this.syncState.getState();

    console.log("And this is the PersistedState: ", state)
    // =========================================================
    // PHASE 2 — PULL
    // =========================================================
    let pullResult: SyncPullResult;
    try {
      pullResult = await this.transport.pull(
        cursor,
        this.pullBatchSize
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      await this.syncState.persistFailure({
        error: message,
        occurredAt: Date.now(),
      });
      return {
        kind: "transient",
        error: message,
        attempted: pending.length,
        cursor,
      };
    }

    if (pullResult.events.length > 0) {
      await this.eventStore.applyRemoteEvents(pullResult.events);
    }

    if (pullResult.cursor > cursor) {
      cursor = pullResult.cursor;
    }

    await this.syncState.persistPullResult({
      pulled: pullResult.events.length,
      cursor,
      completedAt: Date.now(),
    });

    // =========================================================
    // PHASE 3 — RESULT
    // =========================================================

    if (pushedConflicts.length > 0) {
      return {
        kind: "conflict",
        pushed:
          pushedAccepted.length +
          pushedRejected.length +
          pushedConflicts.length,
        accepted: pushedAccepted,
        rejected: pushedRejected,
        conflicts: pushedConflicts,
        pulled: pullResult.events.length,
        cursor,
        hasMore: pullResult.hasMore,
      };
    }

    if (pushedRejected.length > 0) {
      return {
        kind: "rejected",
        pushed: pushedAccepted.length + pushedRejected.length,
        accepted: pushedAccepted,
        rejected: pushedRejected,
        pulled: pullResult.events.length,
        cursor,
        hasMore: pullResult.hasMore,
      };
    }

    if (
      pending.length === 0 &&
      pullResult.events.length === 0 &&
      pullResult.cursor === cursor
    ) {
      return {
        kind: "idle",
        pushed: 0,
        accepted: [],
        rejected: [],
        pulled: 0,
        cursor,
      };
    }

    return {
      kind: "synced",
      pushed: pushedAccepted.length,
      accepted: pushedAccepted,
      rejected: pushedRejected,
      pulled: pullResult.events.length,
      cursor,
      hasMore: pullResult.hasMore,
    };
  }

  // =========================================================
  // PRIVATE
  // =========================================================

  /**
   * Apply the push response to the outbox:
   *  - accepted → markSynced
   *  - conflict → markConflict
   *  - rejected → markRejected
   *
   * Wrapped in changeNotifier.batch so all N outbox writes
   * produce exactly one notification.
   */
  private async applyPushAcknowledgements(
    pending: PendingOutboxEvent[],
    pushResult: SyncPushResult,
    now: number
  ): Promise<void> {
    

    await changeNotifier.subscribe(async () => {
      const pendingById = new Map(
        pending.map((p) => [p.event.id, p] as const)
      );

      for (const accepted of pushResult.accepted) {
        const row = pendingById.get(accepted.eventId);
        if (!row) continue;
        await this.outbox.markSynced(
          row.outboxId,
          now,
          accepted.globalPosition,
          accepted.aggregateVersion,
          now
        );
      }

      for (const conflict of pushResult.conflicts) {
        const row = pendingById.get(conflict.eventId);
        if (!row) continue;
        await this.outbox.markConflict(
          row.outboxId,
          conflict.status
        );
      }

      for (const rejected of pushResult.rejected) {
        const row = pendingById.get(rejected.eventId);
        if (!row) continue;
        await this.outbox.markRejected(
          row.outboxId,
          rejected.reason
        );
      }
    });
  }

  async getCurrentCursor(): Promise<number> {
    return this.syncState.getCursor();
  }

  private toBackendPayload(event: DomainEvent): BackendEventPayload {
    return {
      id: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      expectedAggregateVersion: event.expectedAggregateVersion,
      type: event.type,
      mode: event.mode,
      payload: event.payload,
      actor: event.actor,
      businessId: event.businessId,
      branchId: event.branchId,
      causationId: event.causationId,
      correlationId: event.correlationId,
      logicClock: event.logicClock,
      createdAt: event.createdAt,
      checksum: event.checksum,
    };
  }

  private async scheduleRetries(
    items: PendingOutboxEvent[],
    error: string,
    now: number
  ): Promise<void> {
    await changeNotifier.subscribe(async () => {
      for (const item of items) {
        const attempt = item.retryCount + 1;

        if (attempt >= item.maxAttempts) {
          await this.outbox.markRejected(
            item.outboxId,
            `max attempts exceeded: ${error}`
          );
          continue;
        }

        const backoff =
          this.baseBackoffMs * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 500);

        await this.outbox.scheduleRetry(
          item.outboxId,
          now + backoff + jitter,
          error
        );
      }
    });
  }
}