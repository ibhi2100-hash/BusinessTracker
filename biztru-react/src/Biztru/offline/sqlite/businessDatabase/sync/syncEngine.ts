
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
  SQLiteEventInboxRepository,
} from "../repositories/EventInboxRepository/SQLiteEventInboxRepository";
import { SQLiteSyncCursorRepository } from "../repositories/Cursor/CursorRepository";
import {
  SQLiteSyncStateRepository,
} from "../repositories/SQLiteSyncRepository/SQLiteSyncRepository";
import { EventInboxProcessor } from "../processors/EventInboxProcessors"; 
import type { HttpSyncTransport } from "./SyncTransport";

const DEFAULT_LOCK_DURATION_MS = 30_000;
const DEFAULT_BASE_BACKOFF_MS = 1_000;
const DEFAULT_PUSH_BATCH_SIZE = 50;
const DEFAULT_PULL_BATCH_SIZE = 100;
const MAX_PULL_BATCH_SIZE = 500;
const MAX_PUSH_BATCH_SIZE = 500;
const MAX_BACKOFF_MS = 5 * 60 * 1_000;

type Cursor = string;

export class SyncEngine {
  private readonly lockDurationMs: number;
  private readonly baseBackoffMs: number;
  private readonly pushBatchSize: number;
  private readonly pullBatchSize: number;

  private readonly outbox: SQLiteOutboxRepository;
  private readonly transport: HttpSyncTransport;
  private readonly syncState: SQLiteSyncStateRepository;
  private readonly syncCursor: SQLiteSyncCursorRepository;

  private readonly eventInbox: SQLiteEventInboxRepository;
  private readonly inboxProcessor: EventInboxProcessor;
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
    syncCursor: SQLiteSyncCursorRepository,
    eventInbox: SQLiteEventInboxRepository,
    eventInboxProcessor: EventInboxProcessor,
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
    this.syncCursor = syncCursor;
    this.eventInbox = eventInbox;
    this.inboxProcessor = eventInboxProcessor
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

      console.log("[SyncEngine] Business ID:", this.businessId);
      console.log("[SyncEngine] Reading persisted cursor...");

      cursor = await this.syncCursor.getCursor();

      console.log("[SyncEngine] Cursor before pull:", cursor);
      console.log("[SyncEngine] Cursor type:", typeof cursor);
    } catch (error) {
      console.error("[SyncEngine] Failed to read cursor:", error);

      return this.transientResult(error, 0, "0");
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

        /*
         * A push acknowledgement proves that our own event was accepted,
         * but it does not prove that every earlier server event is present
         * locally. Advance the pull checkpoint only across a contiguous
         * sequence of positions acknowledged for events already applied
         * locally. Any gap is left for the pull phase to fill.
         */
        await this.advanceCursorAcrossAcknowledgedEvents(
          pushResult.accepted,
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

     try {
      await this.inboxProcessor.processPending(
        this.pullBatchSize
      );
      
    } catch (error) {
      return this.transientResult(
        new Error(
          `Failed to process previously staged inbox events: ${
            this.errorMessage(error)
          }`,
        ),
        pending.length,
        cursor
      );
    }

    let pullResult: SyncPullResult;

    try {

      const persistedCursor =
        await this.syncCursor.getCursor();

    cursor = persistedCursor;

      pullResult = await this.transport.pull(
        this.businessId,
        cursor,
        this.pullBatchSize,
      );

      this.validatePullResult(pullResult);
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
    const cursorBeforePull = cursor;
    const nextCursor = pullResult.cursor;

    try {
      // 1. Persist the complete received batch in the inbox first.
      // EventInboxRepository.stage should deduplicate by eventId.
       
      if (pullResult.events.length > 0) {
        await this.eventInbox.stage(pullResult.events)
      }
      // 2. Advance the checkpoint only after staging has succeeded.
      // This must NOT be derived from push acknowledgements.
      await this.syncCursor.advanceCursor(nextCursor);

      await this.syncState.persistPullResult({
        pulled: pullResult.events.length,
        completedAt: Date.now(),
      });

      cursor = await this.syncCursor.getCursor();
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
    //STEP 3.
    //Process Event only after the batch has been staged.
    // 
    //Failed Events remain in the inbox for later retry

    try {
      await this.inboxProcessor.processPending(
          this.pullBatchSize,
      );

    } catch (error) {
      // The pull cursor may already be advanced because the
      // batch is safely staged. Do not roll it back.
      return this.transientResult(
        new Error(
          `Events were staged, but inbox processing failed: ${
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
      nextCursor ===  cursorBeforePull
       &&
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

  /**
   * Advance the pull cursor over contiguous global positions occupied by
   * events this device has just pushed and already applied locally.
   *
   * Example: cursor=689 and accepted positions=[690, 692] advances only
   * to 690. Position 691 must still be pulled before position 692 can be
   * safely skipped.
   *
   * This relies on the backend contract that globalPosition is a
   * monotonically increasing, gap-free business event-log position and
   * that accepted events are committed at the acknowledged position.
   * If that contract does not hold, do not advance the pull cursor from
   * push acknowledgements; use the pull response as the only checkpoint.
   */
  private async advanceCursorAcrossAcknowledgedEvents(
    acceptedEvents: BackendAcceptedEvent[],
  ): Promise<void> {
    if (acceptedEvents.length === 0) {
      return;
    }

    const persistedCursor = await this.syncCursor.getCursor();
    const currentPosition = Number(persistedCursor);

    // The current cursor contract is a decimal string backed by a safe
    // integer global position. Never guess or coerce an opaque cursor.
    if (
      !Number.isSafeInteger(currentPosition) ||
      currentPosition < 0
    ) {
      console.warn(
        "[SyncEngine] Skipping push-ack cursor advancement: " +
          "persisted cursor is not a non-negative safe integer.",
      );
      return;
    }

    const acknowledgedPositions = new Set<number>();

    for (const accepted of acceptedEvents) {
      const position = Number(accepted.globalPosition);

      if (
        Number.isSafeInteger(position) &&
        position > 0 &&
        position > currentPosition
      ) {
        acknowledgedPositions.add(position);
      }
    }

    let contiguousPosition = currentPosition;

    while (acknowledgedPositions.has(contiguousPosition + 1)) {
      contiguousPosition += 1;
    }

    if (contiguousPosition === currentPosition) {
      return;
    }

    await this.syncCursor.advanceCursor(String(contiguousPosition));

    // Read back the persisted value rather than assuming the write worked.
    // A higher value is valid if another sync context advanced it further.
    const verifiedCursor = await this.syncCursor.getCursor();
    const verifiedPosition = Number(verifiedCursor);

    if (
      !Number.isSafeInteger(verifiedPosition) ||
      verifiedPosition < contiguousPosition
    ) {
      throw new Error(
        `Failed to persist push-ack cursor checkpoint ${contiguousPosition}; ` +
          `repository returned ${verifiedCursor}.`,
      );
    }

    console.log(
      "[SyncEngine] Cursor advanced from push acknowledgements:",
      currentPosition,
      "->",
      verifiedPosition,
    );
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
  private validatePullResult(
    result: SyncPullResult,
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

  async getCurrentCursor(): Promise<string> {
    return await this.syncCursor.getCursor();
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
    cursor: string,
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
