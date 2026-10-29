import type {
  BackendEvent,
  DomainEvent,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from
  "../../storage/statement/worker/WorkerProtocol";

import type { SQLiteEventRepository } from
  "../../offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";

import type { TransactionManager } from
  "../../storage/transaction/TransactionManager";

import {
  backendEventToDomainEvent,
} from "./BackendEventTransformer";


/**
 * Keep global positions as decimal strings.
 * SQLite INTEGER and JavaScript number are not safe for
 * arbitrarily large backend BIGINT positions.
 */
export interface PulledEvent {
  event: BackendEvent;
  globalPosition: string;
}

export interface PullBatch {
  events: PulledEvent[];
  hasMore: boolean;
}

export interface EventPullClient {
  pullAfter(
    cursor: string,
    limit: number,
  ): Promise<PullBatch>;
}

export interface EventCursorRepository {
  getCursor(): Promise<string>;

  /**
   * Returns an SQL operation. Must not execute it independently.
   */
  advanceCursorOperation(
    position: string,
  ): SQLiteStatementOperation;
}

export interface RemoteAggregateVersionRepository {
  /**
   * Produces operations for updating local aggregate versions
   * from the remote events. Must not execute them independently.
   */
  remoteVersionOperations(
    events: readonly DomainEvent[],
  ): SQLiteStatementOperation[];
}

export interface EventProjectionPlanner {
  /**
   * Calculates projection writes without committing them.
   */
  operationsForEvents(
    events: readonly DomainEvent[],
  ): Promise<SQLiteStatementOperation[]>;

  /**
   * Runs only after the transaction has committed.
   */
  notifyCommitted(events: readonly DomainEvent[]): void;
}

export interface EventInboxProcessorDependencies {
  eventStore: SQLiteEventRepository;
  transaction: TransactionManager;
  pullClient: EventPullClient;
  cursor: EventCursorRepository;
  aggregates: RemoteAggregateVersionRepository;
  projections: EventProjectionPlanner;
}

export interface ProcessPendingResult {
  pulled: number;
  persisted: number;
  duplicates: number;
  lastPosition: string;
  hasMore: boolean;
}

export class EventInboxProcessor {
  private readonly eventStore: SQLiteEventRepository;
  private readonly transaction: TransactionManager;
  private readonly pullClient: EventPullClient;
  private readonly cursor: EventCursorRepository;
  private readonly aggregates: RemoteAggregateVersionRepository;
  private readonly projections: EventProjectionPlanner;

  private processing = false;

  constructor(
    dependencies: EventInboxProcessorDependencies,
  ) {
    this.eventStore = dependencies.eventStore;
    this.transaction = dependencies.transaction;
    this.pullClient = dependencies.pullClient;
    this.cursor = dependencies.cursor;
    this.aggregates = dependencies.aggregates;
    this.projections = dependencies.projections;
  }

  async processPending(
    pullBatchSize: number,
  ): Promise<ProcessPendingResult> {
    if (
      !Number.isSafeInteger(pullBatchSize) ||
      pullBatchSize < 1
    ) {
      throw new Error(
        "pullBatchSize must be a positive safe integer.",
      );
    }

    if (this.processing) {
      throw new Error(
        "An event pull batch is already being processed.",
      );
    }

    this.processing = true;

    try {
      // 1. Read the last committed synchronization checkpoint.
      const cursorBefore = await this.cursor.getCursor();

      this.validatePosition(cursorBefore, "Stored cursor");

      // 2. Pull events strictly after the checkpoint.
      // No SQLite transaction is held during network I/O.
      const batch = await this.pullClient.pullAfter(
        cursorBefore,
        pullBatchSize,
      );

      if (batch.events.length === 0) {
        return {
          pulled: 0,
          persisted: 0,
          duplicates: 0,
          lastPosition: cursorBefore,
          hasMore: batch.hasMore,
        };
      }

      if (batch.events.length > pullBatchSize) {
        throw new Error(
          "Backend returned more events than the requested batch size.",
        );
      }

      // 3. Validate ordering and transform the complete batch
      // before preparing any database writes.
      const transformed = batch.events.map((item) => {
        const position = this.validatePosition(
          item.globalPosition,
          "Event globalPosition",
        );

        const result = backendEventToDomainEvent({
          ...item.event,
          globalPosition: position,
        } as Parameters<
          typeof backendEventToDomainEvent
        >[0]);

        if (
          result.event.businessId !==
          batch.events[0]?.event.businessId
        ) {
          throw new Error(
            "Pulled batch contains events from different businesses.",
          );
        }

        if (result.globalPosition !== position) {
          throw new Error(
            "Transformed global position does not match the source.",
          );
        }

        return result;
      });

      let previousPosition = BigInt(cursorBefore);

      for (const item of transformed) {
        const position = BigInt(item.globalPosition);

        if (position <= previousPosition) {
          throw new Error(
            `Global positions must increase strictly: ` +
            `${position} follows ${previousPosition}.`,
          );
        }

        previousPosition = position;
      }

      // 4. Find already-persisted event IDs.
      // These are safe to skip only if event persistence,
      // projection writes, and cursor advancement were previously
      // committed atomically.
      const uniqueEvents = new Map<
        string,
        (typeof transformed)[number]
      >();

      for (const item of transformed) {
        const previous = uniqueEvents.get(item.event.id);

        if (
          previous &&
          (
            previous.globalPosition !== item.globalPosition ||
            previous.event.checksum !== item.event.checksum
          )
        ) {
          throw new Error(
            `Conflicting copies of event ${item.event.id} in the batch.`,
          );
        }

        uniqueEvents.set(item.event.id, item);
      }

      const existingIds = new Set<string>();

      for (const item of uniqueEvents.values()) {
        if (await this.eventStore.exists(item.event.id)) {
          existingIds.add(item.event.id);
        }
      }

      const newItems = [...uniqueEvents.values()].filter(
        (item) => !existingIds.has(item.event.id),
      );

      const newEvents = newItems.map(
        (item) => item.event,
      );

      const finalPosition =
        transformed[transformed.length - 1]!.globalPosition;

      // 5. Prepare the full transaction.
      // No repository below may commit these operations separately.
      const operations: SQLiteStatementOperation[] = [];

      if (newEvents.length > 0) {
        operations.push(
          ...this.eventStore.appendOperations(newEvents),
        );

        operations.push(
          ...this.aggregates.remoteVersionOperations(
            newEvents,
          ),
        );

        operations.push(
          ...await this.projections.operationsForEvents(
            newEvents,
          ),
        );
      }

      // Advance even when every event was already committed.
      // This handles replayed pages safely under the atomicity
      // guarantee described above.
      operations.push(
        this.cursor.advanceCursorOperation(finalPosition),
      );

      // 6. One atomic SQLite transaction:
      // event store + aggregate versions + projections + cursor.
      await this.transaction.run(operations);

      // 7. Notify consumers only after successful commit.
      if (newEvents.length > 0) {
        this.projections.notifyCommitted(newEvents);
      }

      return {
        pulled: batch.events.length,
        persisted: newEvents.length,
        duplicates: existingIds.size,
        lastPosition: finalPosition,
        hasMore: batch.hasMore,
      };
    } finally {
      this.processing = false;
    }
  }

  private validatePosition(
    value: string,
    label: string,
  ): string {
    if (!/^\d+$/.test(value)) {
      throw new Error(
        `${label} must be a non-negative decimal integer.`,
      );
    }

    return BigInt(value).toString();
  }
}