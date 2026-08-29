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
    o.id            AS outboxId,
    o.eventId,
    o.status,
    o.retryCount,
    o.maxAttempts,
    o.nextRetryAt,
    o.lockedUntil,
    o.lastError,
    o.createdAt,
    o.syncedAt,
    o.globalPosition,
    o.aggregateVersion,
    o.server_commit_time,
    e.*
  FROM outbox o
  JOIN events e ON e.id = o.eventId
  WHERE o.status = 'PENDING'
    AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= ?)
    AND (o.lockedUntil IS NULL OR o.lockedUntil <= ?)
  ORDER BY o.createdAt ASC
  LIMIT ?
`;

export const LOCK_BATCH = `
  UPDATE outbox
  SET lockedUntil = ?, status = 'IN_FLIGHT'
  WHERE id IN (/* placeholders */)
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