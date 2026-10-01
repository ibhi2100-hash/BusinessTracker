export const INSERX_INTO_AGGREGATES = `
    INSERT INTO aggregates (
    id,
    aggregateId,
    aggregateType,
    localVersion,
    version,
    lastEventId,
    lastGlobalPosition,
    lastSnapshotVersion,
    isDeleted,
    updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(aggregateType, aggregateId)
DO UPDATE SET
    localVersion = aggregates.localVersion + 1,
    lastEventId = excluded.lastEventId,
    updatedAt = excluded.updatedAt;
`
export const GET_AGGREGATE = `
    SELECT *
    FROM aggregates
    WHERE aggregateType = ?
        AND aggregateId = ?
`

export const GET_VERSION = `
    SELECT
        localVersion,
        version
    FROM aggregates
    WHERE aggregateType = ?
        AND aggregateId = ?
`

export const GET_ALL_AGGREGATES = `
SELECT * FROM aggregates
`

export const UPSERT_AGGREGATE = `
    INSERT INTO aggregates (
        id,
        aggregateId,
        aggregateType,
        localVersion,
        version,
        lastEventId,
        lastGlobalPosition,
        lastSnapshotVersion,
        isDeleted,
        updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(aggregateType, aggregateId)
    DO UPDATE SET
        localVersion = excluded.localVersion,
        lastEventId = excluded.lastEventId,
        isDeleted = excluded.isDeleted,
        updatedAt = excluded.updatedAt
`;

export const ADVANCE_LOCAL_VERSION = `
    UPDATE aggregates
    SET
        localVersion = localVersion + 1,
        lastEventId = ?,
        updatedAt = ?
    WHERE
        aggregateType = ?
        AND aggregateId = ?
        AND localVersion = ?
`;