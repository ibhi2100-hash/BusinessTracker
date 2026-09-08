export const INSERT_INTO_OUTBOX = `
  INSERT INTO outbox (
    id, eventId, status, retryCount, maxAttempts,
    nextRetryAt, lockedUntil, lastError, createdAt, syncedAt,
    globalPosition, aggregateVersion, server_commit_time
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const GET_PENDING = `
  SELECT

    -- =========================
    -- OUTBOX FIELDS
    -- =========================

    o.id
      AS outboxId,

    o.eventId
      AS eventId,

    o.status
      AS status,

    o.retryCount
      AS retryCount,

    o.maxAttempts
      AS maxAttempts,

    o.nextRetryAt
      AS nextRetryAt,

    o.lockedUntil
      AS lockedUntil,

    o.lastError
      AS lastError,

    o.createdAt
      AS outboxCreatedAt,

    o.syncedAt
      AS syncedAt,

    o.globalPosition
      AS globalPosition,

    o.aggregateVersion
      AS outboxAggregateVersion,

    o.server_commit_time
      AS server_commit_time,


    -- =========================
    -- EVENT FIELDS
    -- =========================

    e.id
      AS id,

    e.aggregateId
      AS aggregateId,

    e.aggregateType
      AS aggregateType,

    e.expectedAggregateVersion
      AS expectedAggregateVersion,

    e.type
      AS type,

    e.mode
      AS mode,

    e.businessId
      AS businessId,

    e.branchId
      AS branchId,

    e.payload
      AS payload,

    e.actor
      AS actor,

    e.causationId
      AS causationId,

    e.correlationId
      AS correlationId,

    e.logicClock
      AS logicClock,

    e.createdAt
      AS eventCreatedAt,

    e.checksum
      AS checksum

  FROM outbox o

  INNER JOIN events e
    ON e.id = o.eventId

  WHERE o.status = 'PENDING'

    AND (
      o.nextRetryAt IS NULL
      OR o.nextRetryAt <= ?
    )

    AND (
      o.lockedUntil IS NULL
      OR o.lockedUntil <= ?
    )

  ORDER BY o.createdAt ASC

  LIMIT ?
`;
export const MARK_SYNCED = `
  UPDATE outbox
  SET
    status = 'SYNCED',
    syncedAt = ?,
    globalPosition = ?,
    aggregateVersion = ?,
    server_commit_time = ?,
    lockedUntil = NULL,
    lastError = NULL
  WHERE id = ?
`;

export const MARK_CONFLICT = `
  UPDATE outbox
  SET
    status = 'CONFLICT',
    lastError = ?,
    lockedUntil = NULL
  WHERE id = ?
`;

export const MARK_REJECTED = `
  UPDATE outbox
  SET
    status = 'REJECTED',
    lastError = ?,
    lockedUntil = NULL
  WHERE id = ?
`;

export const SCHEDULE_RETRY = `
  UPDATE outbox
  SET
    status = 'PENDING',
    retryCount = retryCount + 1,
    nextRetryAt = ?,
    lastError = ?,
    lockedUntil = NULL
  WHERE id = ?
`;

export const RESET_IN_FLIGHT = `
  UPDATE outbox
  SET status = 'PENDING', lockedUntil = NULL
  WHERE status = 'IN_FLIGHT' AND lockedUntil <= ?
`;

export const GET_PENDING_COUNT = `
  SELECT COUNT(*) AS count
  FROM outbox
  WHERE status = 'PENDING'
    AND (
      nextRetryAt IS NULL
      OR nextRetryAt <= ?
    )
    AND (
      lockedUntil IS NULL
      OR lockedUntil <= ?
    )
`;