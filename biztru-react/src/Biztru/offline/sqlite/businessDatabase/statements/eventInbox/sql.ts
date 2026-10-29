
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

export const EXISTS_INBOX_EVENT = `
    SELECT 1
    FROM event_inbox
    WHERE eventId = ?
    LIMIT 1;
`;

export const LOAD_PENDING_INBOX_EVENTS = `
    SELECT *
    FROM event_inbox
    ORDER BY globalPosition ASC
    LIMIT ?;
`;

export const DELETE_INBOX_EVENT = `
    DELETE FROM event_inbox
    WHERE eventId = ?;
`;

export const UPDATE_INBOX_FAILURE = `
    UPDATE event_inbox
    SET attempts = attempts + 1,
        lastError = ?
    WHERE eventId = ?;
`;

export const COUNT_INBOX_EVENTS = `
    SELECT COUNT(*) AS count
    FROM event_inbox;
`;
