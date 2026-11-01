
import type {
  BackendEvent,
  DomainEvent,
} from "@business/shared-types";

import type {
  SQLiteStatementOperation,
} from "../../../../storage/statement/worker/WorkerProtocol";

import type {
  SQLiteEventRepository,
} from "../repositories/SQLiteEventRepository/eventStore";

import type {
  TransactionManager,
} from "../../../../storage/transaction/TransactionManager";

import {
  backendEventToDomainEvent,
} from "../../../../BizTru_Karnel/Transformers/BackendToDomainTransformer";

import type {
  ProjectionEventBus,
} from "@business/event-bus";

import type {
  SQLiteAggregateRepository,
} from "../repositories/SQLiteAggregateRepository/SQLiteAggregateRepository";

import type {
  SQLiteEventInboxRepository,
} from "../repositories/EventInboxRepository/SQLiteEventInboxRepository";


/**
 * The inbox stores global positions as decimal strings.
 *
 * Do not convert global positions to JavaScript numbers.
 * This preserves precision for large backend BIGINT positions.
 */
export interface TransformedInboxEvent {
  event: DomainEvent;
  globalPosition: string;
}

export interface ProcessPendingResult {
  /** Number of inbox records claimed for processing. */
  pulled: number;

  /** Number of new events persisted into the local event store. */
  persisted: number;

  /** Number of events already present in the local event store. */
  duplicates: number;

  /** Highest global position successfully processed. */
  lastPosition: string | null;
}


export class EventInboxProcessor {
  private readonly eventStore: SQLiteEventRepository;

  private readonly transaction: TransactionManager;

  private readonly inbox: SQLiteEventInboxRepository;

  private readonly aggregates: SQLiteAggregateRepository;

  private readonly projections: ProjectionEventBus;

  /**
   * Prevents overlapping execution inside this processor instance.
   *
   * The inbox repository must independently implement atomic
   * claiming because other workers or tabs may also process events.
   */
  private processing = false;

  constructor(
    eventStore: SQLiteEventRepository,
    transaction: TransactionManager,
    inbox: SQLiteEventInboxRepository,
    aggregates: SQLiteAggregateRepository,
    projections: ProjectionEventBus,
  ) {
    this.eventStore = eventStore;
    this.transaction = transaction;
    this.inbox = inbox;
    this.aggregates = aggregates;
    this.projections = projections;
  }

  /**
   * Processes locally staged events from the SQLite inbox.
   *
   * Status lifecycle:
   *
   * PENDING -> PROCESSING -> DELETED
   *
   * On failure:
   *
   * PROCESSING -> PENDING
   *
   * No remote network request is performed here.
   * No synchronization cursor is read or advanced here.
   */
  async processPending(
    batchSize: number,
  ): Promise<ProcessPendingResult> {
    this.validateBatchSize(batchSize);

    if (this.processing) {
      throw new Error(
        "An event inbox batch is already being processed.",
      );
    }

    this.processing = true;

    /**
     * Keep a reference to the claimed batch so that we can
     * release its records if any processing step fails.
     */
    let claimedBatch: BackendEvent[] = [];

    try {
      // ==================================================
      // 1. CLAIM PENDING INBOX EVENTS
      // ==================================================

      /**
       * loadPending must atomically:
       *
       * - Recover stale PROCESSING records.
       * - Select PENDING records.
       * - Order them by globalPosition ASC.
       * - Change selected records to PROCESSING.
       * - Return the claimed records.
       *
       * It must not filter using a synchronization cursor.
       */
      claimedBatch = await this.inbox.loadPending(batchSize);

      if (claimedBatch.length === 0) {
        return {
          pulled: 0,
          persisted: 0,
          duplicates: 0,
          lastPosition: null,
        };
      }

      if (claimedBatch.length > batchSize) {
        throw new Error(
          "Inbox repository returned more events than the requested batch size.",
        );
      }

      console.log(
        "[EventInboxProcessor] Claimed events:",
        claimedBatch,
      );

      // ==================================================
      // 2. TRANSFORM BACKEND EVENTS
      // ==================================================

      const transformed: TransformedInboxEvent[] =
        claimedBatch.map((item) => {
          const position = this.validatePosition(
            String(item.globalPosition),
            `Global position for event ${item.id}`,
          );

          const result = backendEventToDomainEvent({
            ...item,
            globalPosition: position,
          } as Parameters<
            typeof backendEventToDomainEvent
          >[0]);

          if (!result.event) {
            throw new Error(
              `Event transformation returned no domain event: ${item.id}`,
            );
          }

          if (result.globalPosition !== position) {
            throw new Error(
              `Global position changed during transformation for event ${item.id}.`,
            );
          }

          return {
            event: result.event,
            globalPosition: position,
          };
        });

      // ==================================================
      // 3. VALIDATE CLAIMED BATCH
      // ==================================================

      this.validateBatchConsistency(transformed);

      console.table(
        transformed.map((item) => ({
          eventId: item.event.id,
          businessId: item.event.businessId,
          branchId: item.event.branchId,
          aggregateId: item.event.aggregateId,
          aggregateType: item.event.aggregateType,
          aggregateVersion: item.event.expectedAggregateVersion,
          globalPosition: item.globalPosition,
          type: item.event.type,
        })),
      );

      // ==================================================
      // 4. DEDUPLICATE EVENT IDS WITHIN THE BATCH
      // ==================================================

      const uniqueEvents = new Map<
        string,
        TransformedInboxEvent
      >();

      for (const item of transformed) {
        const previous = uniqueEvents.get(item.event.id);

        if (previous) {
          const samePosition =
            previous.globalPosition === item.globalPosition;

          const sameChecksum =
            previous.event.checksum === item.event.checksum;

          if (!samePosition || !sameChecksum) {
            throw new Error(
              `Conflicting copies of event ${item.event.id} were found in the inbox batch.`,
            );
          }

          /**
           * Identical copies of the same event ID are ignored
           * in the processing collection.
           */
          continue;
        }

        uniqueEvents.set(item.event.id, item);
      }

      // ==================================================
      // 5. CHECK EXISTING EVENTS
      // ==================================================

      /**
       * This check prevents inserting the same event twice.
       *
       * IMPORTANT:
       * eventStore.exists() only verifies event ID existence.
       * For full integrity, the repository should eventually
       * expose a checksum lookup so an existing event ID with
       * a different checksum can be rejected.
       */
      const existingIds = new Set<string>();

      for (const item of uniqueEvents.values()) {
        const exists = await this.eventStore.exists(
          item.event.id,
        );

        if (exists) {
          existingIds.add(item.event.id);
        }
      }

      const newItems = [
        ...uniqueEvents.values(),
      ].filter(
        (item) => !existingIds.has(item.event.id),
      );

      const newEvents: DomainEvent[] = newItems.map(
        (item) => item.event,
      );

      // ==================================================
      // 6. PREPARE ATOMIC TRANSACTION
      // ==================================================

      const operations: SQLiteStatementOperation[] = [];

      /**
       * A. Append new events to the local event store.
       */
      if (newEvents.length > 0) {
        operations.push(
          ...this.eventStore.appendOperations(newEvents),
        );

        /**
         * B. Update local aggregate versions using remote events.
         */
       operations.push(
        ...this.aggregates.remoteVersionOperations(newItems)
      );
              
      }

      /**
       * D. Delete all successfully handled inbox records.
       *
       * Delete both:
       * - Newly persisted events.
       * - Already persisted duplicate events.
       *
       * The deletion must be in the SAME transaction as the
       * event-store and projection operations.
       */
      const processedEventIds = claimedBatch.map(
        (item) => item.id,
      );

      operations.push(
        ...this.inbox.deleteOperations(processedEventIds),
      );

      // ==================================================
      // 7. COMMIT ATOMICALLY
      // ==================================================

      /**
       * Everything commits together or rolls back together:
       *
       * - Event store
       * - Aggregate versions
       * - Projections
       * - Inbox deletion
       *
       * The transaction manager must guarantee rollback if
       * any operation fails.
       */
      await this.transaction.run(operations);

      await this.projections.publishMany(newEvents);

      console.log(
        "[EventInboxProcessor] Successfully processed inbox batch.",
        {
          pulled: claimedBatch.length,
          persisted: newEvents.length,
          duplicates: existingIds.size,
        }
      );

      // ==================================================
      // 8. RETURN RESULT
      // ==================================================

      const lastPosition =
        transformed[transformed.length - 1]!.globalPosition;

      const result: ProcessPendingResult = {
        pulled: claimedBatch.length,
        persisted: newEvents.length,
        duplicates: existingIds.size,
        lastPosition,
      };

      console.log(
        "[EventInboxProcessor] Processing completed:",
        result,
      );

      return result;

    } catch (error) {
      // ==================================================
      // 9. RELEASE CLAIMED EVENTS ON FAILURE
      // ==================================================

      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        "[EventInboxProcessor] Processing failed:",
        error,
      );

      if (claimedBatch.length > 0) {
        const claimedIds = claimedBatch.map(
          (item) => item.id,
        );

        try {
          /**
           * recordBatchFailure must:
           *
           * - Increment attempts.
           * - Store lastError.
           * - Change PROCESSING back to PENDING.
           * - Set processingAt to NULL.
           *
           * It should only update records currently in PROCESSING.
           */
          await this.inbox.recordBatchFailure(
            claimedIds,
            errorMessage,
          );

        } catch (recoveryError) {
          console.error(
            "[EventInboxProcessor] Failed to release claimed events:",
            recoveryError,
          );

          /**
           * Stale PROCESSING recovery in the inbox repository
           * must eventually make these events claimable again.
           */
        }
      }

      throw error;

    } finally {
      this.processing = false;
    }
  }

  // ==================================================
  // VALIDATION HELPERS
  // ==================================================

  private validateBatchSize(
    batchSize: number,
  ): void {
    if (
      !Number.isSafeInteger(batchSize) ||
      batchSize < 1
    ) {
      throw new Error(
        "batchSize must be a positive safe integer.",
      );
    }
  }

  /**
   * Validates decimal positions without converting them
   * to JavaScript numbers.
   */
  private validatePosition(
    value: string,
    label: string,
  ): string {
    if (!/^\d+$/.test(value)) {
      throw new Error(
        `${label} must be a non-negative decimal integer. Received: ${value}`,
      );
    }

    return BigInt(value).toString();
  }

  /**
   * Validates consistency inside the claimed batch only.
   *
   * Notice that there is no comparison with the remote pull cursor.
   *
   * The inbox repository must return records ordered by
   * globalPosition ASC. This method detects violations.
   */
  private validateBatchConsistency(
    events: readonly TransformedInboxEvent[],
  ): void {
    if (events.length === 0) {
      return;
    }

    const businessId = events[0]!.event.businessId;

    let previousPosition: bigint | null = null;

    const positions = new Map<string, string>();

    for (const item of events) {
      const event = item.event;
      const position = BigInt(item.globalPosition);

      if (event.businessId !== businessId) {
        throw new Error(
          `Inbox batch contains multiple businesses. ` +
          `Expected ${businessId}, received ${event.businessId} ` +
          `for event ${event.id}.`,
        );
      }

      if (
        previousPosition !== null &&
        position <= previousPosition
      ) {
        throw new Error(
          `Global positions are not strictly increasing within the inbox batch. ` +
          `${position} follows ${previousPosition}. ` +
          `Event ID: ${event.id}.`,
        );
      }

      const positionKey = item.globalPosition;
      const existingEventId = positions.get(positionKey);

      if (existingEventId) {
        throw new Error(
          `Duplicate global position ${positionKey} found for events ` +
          `${existingEventId} and ${event.id}.`,
        );
      }

      positions.set(positionKey, event.id);

      previousPosition = position;
    }
  }
}
