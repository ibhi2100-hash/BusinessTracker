// sqlite/statements/events/sql.ts

export const INSERT_EVENT = `
INSERT INTO events (
    id,
    aggregateId,
    aggregateType,
    expectedAggregateVersion,
    type,
    payload,
    businessId,
    branchId,
    mode,
    actor,
    causationId,
    logicClock,
    createdAt,
    checksum
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const LOAD_AGGREGATE = `
SELECT *
FROM events
WHERE aggregateId = ?
ORDER BY aggregateVersion ASC
`;

export const LOAD_EVENT = `
SELECT *
FROM events
WHERE id = ?
LIMIT 1
`;

export const EXISTS = `
SELECT 1
FROM events
WHERE id = ?
LIMIT 1
`;

export const LOAD_SINCE = `
SELECT *
FROM events
WHERE globalPosition > ?
ORDER BY globalPosition ASC
`;

export const DELETE_EVENT = `
DELETE
FROM events
WHERE id = ?
`;

export const COUNT_EVENTS = `
SELECT COUNT(*) AS count
FROM events
`;

export const LAST_POSITION = `
SELECT MAX(globalPosition) AS position
FROM events
`;

export const LOAD_PROJECTION_EVENT = `
        SELECT *
        FROM events e
        LEFT JOIN event_resolution r

        ON e.id = r.eventId

        WHERE
        r.state IS NULL
        OR r.state='ACTIVE'
        `

export const LOADALL = `
    SELECT * FROM events
    `

export  const STREAM_EVENTS = 
`
    SELECT *
    FROM events
    WHERE logicClock > ?
        AND(? IS NULL OR logicClock <= ?)
        AND(? IS NULL OR createdAt <= ?)
    ORDER BY logicClock ASC
    LIMIT ?;
`