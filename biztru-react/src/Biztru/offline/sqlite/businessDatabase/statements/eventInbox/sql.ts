
export const INSERT_INBOX_EVENT = `
    INSERT INTO event_inbox (
        eventId,
        businessId,
        branchId,
        aggregateId,
        aggregateType,
        aggregateVersion,
        type,
        payload,
        mode,
        userId,
        deviceId,
        causationId,
        correlationId,
        globalPosition,
        logicClock,
        checksum,
        createdAt,
        receivedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(eventId) DO NOTHING;
`;


export const CLAIM_PENDING_INBOX_EVENTS = `
    UPDATE event_inbox
    SET
        status = 'PROCESSING',
        processingAt = ?
    WHERE eventId IN (
        SELECT eventId
        FROM event_inbox
        WHERE status = 'PENDING'
        ORDER BY globalPosition ASC
        LIMIT ?
    )
    AND status = 'PENDING'
    RETURNING *;
`;

export const DELETE_INBOX_EVENT = `
    DELETE FROM event_inbox
    WHERE eventId = ?;
`;


export const UPDATE_INBOX_FAILURE = `
    UPDATE event_inbox
    SET
        attempts = attempts + 1,
        lastError = ?,
        status = 'PENDING',
        processingAt = NULL
    WHERE eventId = ?;
`;


export const RECOVER_STALE_INBOX_EVENTS = `
    UPDATE event_inbox
    SET
        status = 'PENDING',
        processingAt = NULL
    WHERE status = 'PROCESSING'
      AND processingAt < ?;
`;

export const COUNT_PENDING_INBOX_EVENTS = `
    SELECT COUNT(*) AS count
    FROM event_inbox
    WHERE status = 'PENDING';
`;

export const COUNT_PROCESSING_INBOX_EVENTS = `
    SELECT COUNT(*) AS count
    FROM event_inbox
    WHERE status = 'PROCESSING';
`;


export const FIND_ALL_INBOX = `
    SELECT *
    FROM event_inbox
    ORDER BY globalPosition ASC;
`;
