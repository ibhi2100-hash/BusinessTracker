
 // src/offline/sqlite/businessDatabase/sync/syncEngine.ts

import type {
  BackendAcceptedEvent,
  BackendEventPayload,
  DomainEvent,
  Conflict,
  SyncEngineOptions,
  SyncPullResult,
  SyncPushResult,
  SyncRejected,
  SyncResult,
} from "@business/shared-types";

import type {
  PendingOutboxEvent,
} from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";

import {
  SQLiteOutboxRepository,
} from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";

import {
  SQLiteEventRepository,
} from "../repositories/SQLiteEventRepository/eventStore";

import {
  SQLiteSyncStateRepository,
} from "../repositories/SQLiteSyncRepository/SQLiteSyncRepository";

import type { HttpSyncTransport } from "./SyncTransport";

const DEFAULT_LOCK_DURATION_MS = 30_000;
const DEFAULT_BASE_BACKOFF_MS = 1_000;
const DEFAULT_PUSH_BATCH_SIZE = 50;
const DEFAULT_PULL_BATCH_SIZE = 100;
const MAX_PULL_BATCH_SIZE = 500;
const MAX_PUSH_BATCH_SIZE = 500;
const MAX_BACKOFF_MS = 5 * 60 * 1_000;

type Cursor = number;

export class SyncEngine {
  private readonly lockDurationMs: number;
  private readonly baseBackoffMs: number;
  private readonly pushBatchSize: number;
  private readonly pullBatchSize: number;

  private readonly outbox: SQLiteOutboxRepository;
  private readonly transport: HttpSyncTransport;
  private readonly syncState: SQLiteSyncStateRepository;
  private readonly eventStore: SQLiteEventRepository;
  private readonly businessId: string;

  /**
   * Prevents overlapping sync cycles on this instance.
   * This is an in-memory guard, not a cross-tab or cross-process lock.
   */
  private activeSync: Promise<SyncResult> | null = null;

  constructor(
    outbox: SQLiteOutboxRepository,
    transport: HttpSyncTransport,
    syncState: SQLiteSyncStateRepository,
    eventStore: SQLiteEventRepository,
    options: SyncEngineOptions = {},
    businessId: string,
  ) {
    if (!businessId?.trim()) {
      throw new Error("SyncEngine requires a valid businessId.");
    }

    this.lockDurationMs =
      options.lockDurationMs ?? DEFAULT_LOCK_DURATION_MS;

    this.baseBackoffMs =
      options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;

    this.pushBatchSize =
      options.pushBatchSize ?? DEFAULT_PUSH_BATCH_SIZE;

    this.pullBatchSize =
      options.pullBatchSize ?? DEFAULT_PULL_BATCH_SIZE;

    this.validateConfiguration();

    this.outbox = outbox;
    this.transport = transport;
    this.syncState = syncState;
    this.eventStore = eventStore;
    this.businessId = businessId;
  }

  /**
   * Run one synchronization cycle.
   *
   * Concurrent calls on this instance share the same in-flight cycle.
   */
  sync(): Promise<SyncResult> {
    if (this.activeSync) {
      return this.activeSync;
    }

    const operation = this.runSync();
    this.activeSync = operation;

    void operation.finally(() => {
      if (this.activeSync === operation) {
        this.activeSync = null;
      }
    }).catch(() => {
      // The original operation remains responsible for its rejection.
      // This catch prevents an unhandled rejection from the finally chain.
    });

    return operation;
  }

  private async runSync(): Promise<SyncResult> {
    const startedAt = Date.now();

    let cursor: Cursor;

    try {
      await this.outbox.resetStaleInFlight(startedAt);

      // IMPORTANT:
      // SQLiteSyncStateRepository must scope this cursor to this.businessId.
      cursor = this.validateCursor(
        await this.syncState.getCursor(this.businessId),
      );
    } catch (error) {
      return this.transientResult(
        error,
        0,
        0,
      );
    }

    let pending: PendingOutboxEvent[];

    try {
      pending = await this.outbox.getPending(
        startedAt,
        this.pushBatchSize,
      );
    } catch (error) {
      return this.transientResult(error, 0, cursor);
    }

    let pushedAccepted: BackendAcceptedEvent[] = [];
    let pushedRejected: SyncRejected[] = [];
    let pushedConflicts: Conflict[] = [];

    // =========================================================
    // PHASE 1 — PUSH LOCAL EVENTS
    // =========================================================

    if (pending.length > 0) {
      const lockedAt = Date.now();

      try {
        await this.outbox.lockBatch(
          pending.map((item) => item.outboxId),
          lockedAt + this.lockDurationMs,
          lockedAt,
        );
      } catch (error) {
        return this.transientResult(
          error,
          pending.length,
          cursor,
        );
      }

      const payloads: BackendEventPayload[] = pending.map(
        (item) => this.toBackendPayload(item.event),
      );

      let pushResult: SyncPushResult;

      try {
        pushResult = await this.transport.push(payloads);
        this.validatePushResult(pushResult, pending);
      } catch (error) {
        const message = this.errorMessage(error);

        try {
          await this.scheduleRetries(
            pending,
            message,
            Date.now(),
          );

          await this.syncState.persistFailure({
            error: message,
            occurredAt: Date.now(),
          });
        } catch (persistenceError) {
          return this.transientResult(
            new Error(
              `${message}; additionally failed to persist retry state: ${
                this.errorMessage(persistenceError)
              }`,
            ),
            pending.length,
            cursor,
          );
        }

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

      try {
        await this.applyPushAcknowledgements(
          pending,
          pushResult,
          Date.now(),
        );

        const pendingAfterPush =
          await this.outbox.getPendingCount(Date.now());

        await this.syncState.persistPushResult({
          pushResult: {
            accepted: pushedAccepted,
            rejected: pushedRejected,
            conflicts: pushedConflicts,
          },
          pendingAfterPush,
          completedAt: Date.now(),
        });
      } catch (error) {
        /*
         * The server may already have accepted these events.
         * Do not blindly reject or delete them if local acknowledgement
         * persistence fails. A retry must be safe on the server.
         */
        return this.transientResult(
          new Error(
            `Push was sent, but local acknowledgement processing failed: ${
              this.errorMessage(error)
            }`,
          ),
          pending.length,
          cursor,
        );
      }
    }

    // =========================================================
    // PHASE 2 — PULL REMOTE EVENTS
    // =========================================================

    let pullResult: SyncPullResult;

    try {
      pullResult = await this.transport.pull(
        this.businessId,
        cursor.toString(),
        this.pullBatchSize,
      );

      this.validatePullResult(pullResult, cursor);
    } catch (error) {
      const message = this.errorMessage(error);

      try {
        await this.syncState.persistFailure({
          error: message,
          occurredAt: Date.now(),
        });
      } catch {
        // Preserve the original pull error in the returned result.
      }

      /*
       * A 409 indicating that the cursor is ahead of the server is not
       * an ordinary transient network failure. Preserve the cursor and
       * surface the diagnostic. Do not reset it automatically.
       *
       * If HttpSyncTransport exposes HTTP status separately, use that
       * status to return a dedicated resync-required result once your
       * shared SyncResult union supports one.
       */
      return {
        kind: "transient",
        error: message,
        attempted: pending.length,
        cursor,
      };
    }

    const nextCursor = this.validateCursor(pullResult.cursor);

    try {
      /*
       * Apply remote events before persisting the new cursor.
       * applyRemoteEvents must be idempotent.
       *
       * PRODUCTION REQUIREMENT:
       * Event application and cursor persistence should be committed in
       * the same SQLite transaction. Separate repository calls cannot
       * guarantee crash-safe checkpoint advancement.
       */
      if (pullResult.events.length > 0) {
        await this.eventStore.applyRemoteEvents(
          pullResult.events,
        );
      }

      await this.syncState.persistPullResult({
        pulled: pullResult.events.length,
        cursor: nextCursor,
        completedAt: Date.now(),
      });

      cursor = nextCursor;
    } catch (error) {
      return this.transientResult(
        new Error(
          `Failed to apply pulled events or persist the cursor: ${
            this.errorMessage(error)
          }`,
        ),
        pending.length,
        cursor,
      );
    }

    // =========================================================
    // PHASE 3 — REPORT RESULT
    // =========================================================

    const pushedCount =
      pushedAccepted.length +
      pushedRejected.length +
      pushedConflicts.length;

    if (pushedConflicts.length > 0) {
      return {
        kind: "conflict",
        pushed: pushedCount,
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
      nextCursor === this.validateCursor(
        await this.syncState.getCursor(this.businessId),
      ) &&
      !pullResult.hasMore
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
  // PUSH ACKNOWLEDGEMENTS
  // =========================================================

  private async applyPushAcknowledgements(
    pending: PendingOutboxEvent[],
    pushResult: SyncPushResult,
    now: number,
  ): Promise<void> {
    const pendingById = new Map(
      pending.map((item) => [item.event.id, item] as const),
    );

    for (const accepted of pushResult.accepted) {
      const row = pendingById.get(accepted.eventId);

      if (!row) {
        continue;
      }

      await this.outbox.markSynced(
        row.outboxId,
        now,
        accepted.globalPosition,
        accepted.aggregateVersion,
        now,
      );
    }

    for (const conflict of pushResult.conflicts) {
      const row = pendingById.get(conflict.eventId);

      if (!row) {
        continue;
      }

      await this.outbox.markConflict(
        row.outboxId,
        conflict.status,
      );
    }

    for (const rejected of pushResult.rejected) {
      const row = pendingById.get(rejected.eventId);

      if (!row) {
        continue;
      }

      await this.outbox.markRejected(
        row.outboxId,
        rejected.reason,
      );
    }
  }

  // =========================================================
  // CURSOR AND RESPONSE VALIDATION
  // =========================================================

  /**
   * This implementation retains the current number-based shared types.
   * It rejects unsafe integers rather than silently corrupting cursors.
   *
   * For full BigInt support, migrate SyncPullResult, SyncResult, the local
   * sync-state repository, and API response contracts to decimal strings.
   */
  private validateCursor(value: unknown): number {
    const parsed =
      typeof value === "number"
        ? value
        : typeof value === "string" && /^\d+$/.test(value)
          ? Number(value)
          : NaN;

    if (
      !Number.isSafeInteger(parsed) ||
      parsed < 0
    ) {
      throw new Error(
        `Invalid synchronization cursor: ${String(value)}`,
      );
    }

    return parsed;
  }

  private validatePullResult(
    result: SyncPullResult,
    currentCursor: number,
  ): void {
    if (!result || typeof result !== "object") {
      throw new Error("Invalid pull response.");
    }

    if (result.businessId !== this.businessId) {
      throw new Error(
        "Pull response businessId does not match the active business.",
      );
    }

    if (!Array.isArray(result.events)) {
      throw new Error("Pull response events must be an array.");
    }

    if (typeof result.hasMore !== "boolean") {
      throw new Error("Pull response hasMore must be a boolean.");
    }

    const returnedCursor = this.validateCursor(result.cursor);

    if (returnedCursor < currentCursor) {
      throw new Error(
        "Server returned a cursor older than the local cursor.",
      );
    }

    if (result.events.length > this.pullBatchSize) {
      throw new Error(
        "Server returned more events than the requested pull batch size.",
      );
    }

    if (result.events.length === 0 && result.hasMore) {
      throw new Error(
        "Invalid pull response: hasMore is true but no events were returned.",
      );
    }
  }

  private validatePushResult(
    result: SyncPushResult,
    pending: PendingOutboxEvent[],
  ): void {
    if (!result || typeof result !== "object") {
      throw new Error("Invalid push response.");
    }

    if (
      !Array.isArray(result.accepted) ||
      !Array.isArray(result.rejected) ||
      !Array.isArray(result.conflicts)
    ) {
      throw new Error("Push response contains invalid result arrays.");
    }

    const pendingIds = new Set(
      pending.map((item) => item.event.id),
    );

    const resultIds = [
      ...result.accepted.map((item) => item.eventId),
      ...result.rejected.map((item) => item.eventId),
      ...result.conflicts.map((item) => item.eventId),
    ];

    const seen = new Set<string>();

    for (const id of resultIds) {
      if (!pendingIds.has(id)) {
        throw new Error(
          `Push response contains an unknown event ID: ${id}`,
        );
      }

      if (seen.has(id)) {
        throw new Error(
          `Push response contains duplicate acknowledgements for event: ${id}`,
        );
      }

      seen.add(id);
    }
  }

  // =========================================================
  // PUBLIC HELPERS
  // =========================================================

  async getCurrentCursor(): Promise<number> {
    return this.validateCursor(
      await this.syncState.getCursor(this.businessId),
    );
  }

  // =========================================================
  // DOMAIN EVENT MAPPING
  // =========================================================

  private toBackendPayload(
    event: DomainEvent,
  ): BackendEventPayload {
    if (event.businessId !== this.businessId) {
      throw new Error(
        `Outbox event ${event.id} belongs to business ${
          event.businessId
        }, not active business ${this.businessId}.`,
      );
    }

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

  // =========================================================
  // RETRY HANDLING
  // =========================================================

  private async scheduleRetries(
    items: PendingOutboxEvent[],
    error: string,
    now: number,
  ): Promise<void> {
    for (const item of items) {
      const attempt = item.retryCount + 1;

      if (attempt >= item.maxAttempts) {
        await this.outbox.markRejected(
          item.outboxId,
          `max attempts exceeded: ${error}`,
        );

        continue;
      }

      const exponentialBackoff = Math.min(
        this.baseBackoffMs * Math.pow(2, attempt - 1),
        MAX_BACKOFF_MS,
      );

      const jitter = Math.floor(Math.random() * 500);

      await this.outbox.scheduleRetry(
        item.outboxId,
        now + exponentialBackoff + jitter,
        error,
      );
    }
  }

  // =========================================================
  // ERROR AND CONFIGURATION HELPERS
  // =========================================================

  private transientResult(
    error: unknown,
    attempted: number,
    cursor: number,
  ): SyncResult {
    return {
      kind: "transient",
      error: this.errorMessage(error),
      attempted,
      cursor,
    };
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error
      ? error.message
      : String(error);
  }

  private validateConfiguration(): void {
    if (
      !Number.isSafeInteger(this.lockDurationMs) ||
      this.lockDurationMs <= 0
    ) {
      throw new Error(
        "lockDurationMs must be a positive safe integer.",
      );
    }

    if (
      !Number.isSafeInteger(this.baseBackoffMs) ||
      this.baseBackoffMs <= 0
    ) {
      throw new Error(
        "baseBackoffMs must be a positive safe integer.",
      );
    }

    if (
      !Number.isSafeInteger(this.pushBatchSize) ||
      this.pushBatchSize < 1 ||
      this.pushBatchSize > MAX_PUSH_BATCH_SIZE
    ) {
      throw new Error(
        `pushBatchSize must be between 1 and ${MAX_PUSH_BATCH_SIZE}.`,
      );
    }

    if (
      !Number.isSafeInteger(this.pullBatchSize) ||
      this.pullBatchSize < 1 ||
      this.pullBatchSize > MAX_PULL_BATCH_SIZE
    ) {
      throw new Error(
        `pullBatchSize must be between 1 and ${MAX_PULL_BATCH_SIZE}.`,
      );
    }
  }
}
