import { DomainEvent } from "@business/shared-types";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { OutboxStatments } from "../../statements/outbox/outboxStatements";

export type OutboxStatus =
  | "PENDING"
  | "IN_FLIGHT"
  | "SYNCED"
  | "CONFLICT"
  | "REJECTED";

export interface PendingOutboxEvent {

    outboxId: string;

    retryCount: number;

    maxAttempts: number;

    event: DomainEvent;
}
export interface OutboxRow {

  // =========================
  // OUTBOX
  // =========================

  outboxId: string;

  eventId: string;

  status: OutboxStatus;

  retryCount: number;

  maxAttempts: number;

  nextRetryAt: number | null;

  lockedUntil: number | null;

  lastError: string | null;

  outboxCreatedAt: number;

  syncedAt: number | null;

  globalPosition: number | null;

  outboxAggregateVersion: number | null;

  server_commit_time: number | null;


  // =========================
  // EVENT
  // =========================

  id: string;

  aggregateId: string;

  aggregateType: string;

  expectedAggregateVersion: number;

  type: string;

  mode: "OPENING" | "LIVE";

  businessId: string | null;

  branchId: string | null;

  payload: string;

  actor: string;

  causationId: string;

  correlationId: string | null;

  logicClock: number;

  eventCreatedAt: number;

  checksum: string | null;
}

export interface NewOutboxEntry {
  id: string;
  eventId: string;
  createdAt: number;
  status?: OutboxStatus;
  retryCount?: number;
  maxAttempts?: number;
  nextRetryAt?: number | null;
  lockedUntil?: number | null;
  lastError?: string | null;
  syncedAt?: number | null;
  globalPosition?: number | null;
  aggregateVersion?: number | null;
  server_commit_time?: number | null;
}

export class SQLiteOutboxRepository {

  constructor(
    private readonly statements: OutboxStatments,
    private readonly queryRunner: QueryRunner
  ) {}

  async insert(data: NewOutboxEntry): Promise<void> {
    await this.statements.insert.execute(
      OutboxMapper.toInsert(data)
    );
  }

 async getPending(
    now: number,
    limit = 100
): Promise<PendingOutboxEvent[]> {

    const rows =
        await this.statements.pendingEvents.query<OutboxRow>([
            now,
            now,
            limit,
        ]);

    return rows.map(row => ({
        outboxId:
            row.outboxId,

        retryCount:
            row.retryCount,

        maxAttempts:
            row.maxAttempts,

        event:
            OutboxMapper.toDomainEvent(row),
    }));
}

  async lockBatch(
    ids: string[],
    lockedUntil: number,
    now: number
  ): Promise<void> {

    if (ids.length === 0) {
      return;
    }

    const placeholders =
      ids.map(() => "?").join(", ");

    const sql = `
      UPDATE outbox
      SET
        lockedUntil = ?,
        status = 'IN_FLIGHT'
      WHERE id IN (${placeholders})
      AND status = 'PENDING'
      AND (
        lockedUntil IS NULL
        OR lockedUntil <= ?
      )
    `;

    await this.queryRunner.execute(
      sql,
      [
        lockedUntil,
        ...ids,
        now
      ]
    );
  }

  async markSynced(
    outboxId: string,
    syncedAt: number,
    globalPosition: number,
    aggregateVersion: number,
    serverCommitTime: number
  ): Promise<void> {

    await this.statements.markSynced.execute([
      syncedAt,
      globalPosition,
      aggregateVersion,
      serverCommitTime,
      outboxId
    ]);
  }

  async markConflict(
    outboxId: string,
    error: string
  ): Promise<void> {

    await this.statements.markConflict.execute([
      error,
      outboxId
    ]);
  }

  async markRejected(
    outboxId: string,
    error: string
  ): Promise<void> {

    await this.statements.markRejected.execute([
      error,
      outboxId
    ]);
  }

  async scheduleRetry(
    outboxId: string,
    nextRetryAt: number,
    error: string
  ): Promise<void> {

    await this.statements.scheduleRetry.execute([
      nextRetryAt,
      error,
      outboxId
    ]);
  }

  async resetStaleInFlight(
    now: number
  ): Promise<void> {

    await this.statements.resetInFlight.execute([
      now
    ]);
  }
}

class OutboxMapper {

  static toInsert(
    data: NewOutboxEntry
  ): unknown[] {

    return [
      data.id,
      data.eventId,
      data.status ?? "PENDING",
      data.retryCount ?? 0,
      data.maxAttempts ?? 10,
      data.nextRetryAt ?? null,
      data.lockedUntil ?? null,
      data.lastError ?? null,
      data.createdAt,
      data.syncedAt ?? null,
      data.globalPosition ?? null,
      data.aggregateVersion ?? null,
      data.server_commit_time ?? null,
    ];
  }

  static toDomainEvent(
    row: OutboxRow
  ): DomainEvent {

    const payload = JSON.parse(row.payload);

    const actor = JSON.parse(row.actor);

    return {

      // =========================
      // EVENT IDENTITY
      // =========================

      id: row.id,

      aggregateId:
        row.aggregateId,

      aggregateType:
        row.aggregateType,

      expectedAggregateVersion:
        row.expectedAggregateVersion,


      // =========================
      // EVENT SEMANTICS
      // =========================

      type:
        row.type,

      mode:
        row.mode,

      payload,

      
      // =========================
      // SCOPE
      // =========================

      businessId:
        row.businessId,

      branchId:
        row.branchId,


      // =========================
      // ACTOR
      // =========================

      actor,


      // =========================
      // CAUSALITY
      // =========================

      causationId:
        row.causationId,

      correlationId:
        row.correlationId ?? undefined,


      // =========================
      // ORDERING
      // =========================

      logicClock:
        row.logicClock,


      // =========================
      // TIME
      // =========================

      createdAt:
        row.eventCreatedAt,


      // =========================
      // INTEGRITY
      // =========================

      checksum:
        row.checksum
    };
  }
}