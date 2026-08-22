export const INSERT_INTO_OUTBOX = `
    INSERT INTO outbox (
        id,
        eventId,
        status,
        retryCount,
        maxAttempts,
        nextRetryAt,
        lockedUntil,
        lastError,
        createdAt,
        syncedAt,
        globalPosition,
        aggregateVersion,
        server_commit_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const GET_PENDING = `
    SELECT e.*, o.*
    FROM outbox o
    JOIN events e ON e.id = o.eventId
    WHERE o.status = 'PENDING' AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= ?)
    LIMIT 100;
`