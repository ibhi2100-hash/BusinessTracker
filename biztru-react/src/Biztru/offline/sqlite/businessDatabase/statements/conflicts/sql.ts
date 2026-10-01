export const CONFLICT_INSERT = `
  INSERT INTO conflicts (
    eventId,
    aggregateId,
    aggregateType,
    localVersion,
    serverVersion,
    status,
    payload,
    createdAt,
    resolvedAt,
    updatedAt
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const CONFLICT_UPSERT = `
    INSERT INTO conflicts (
        eventId,
        aggregateId,
        aggregateType,
        localVersion,
        serverVersion,
        status,
        payload,
        createdAt,
        resolvedAt,
        updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(eventId)
    DO UPDATE SET
        aggregateId = excluded.aggregateId,
        aggregateType = excluded.aggregateType,
        localVersion = excluded.localVersion,
        serverVersion = excluded.serverVersion,
        status = excluded.status,
        payload = excluded.payload,
        resolvedAt = excluded.resolvedAt,
        updatedAt = excluded.updatedAt
`;

export const FIND_BY_ID = `
  SELECT *
  FROM conflicts
  WHERE id = ?
`;

export const FIND_BY_AGGREGATE = `
  SELECT *
  FROM conflicts
  WHERE aggregateType = ?
    AND aggregateId   = ?
  ORDER BY createdAt DESC
`;

export const FIND_BY_STATUS = `
  SELECT *
  FROM conflicts
  WHERE status = ?
  ORDER BY createdAt ASC
`;

/** Pending conflicts, oldest first – the ones that need to be resolved */
export const FIND_PENDING = `
  SELECT *
  FROM conflicts
  WHERE status = 'PENDING'
  ORDER BY createdAt ASC
`;

export const FIND_PENDING_BY_AGGREGATE = `
  SELECT *
  FROM conflicts
  WHERE status       = 'PENDING'
    AND aggregateType = ?
    AND aggregateId   = ?
  ORDER BY createdAt ASC
`;

export const RESOLVE = `
  UPDATE conflicts
  SET
    status     = ?,
    resolvedAt = ?,
    updatedAt  = ?
  WHERE id = ?
`;

export const UPDATE_STATUS = `
  UPDATE conflicts
  SET
    status    = ?,
    updatedAt = ?
  WHERE id = ?
`;

export const DELETE_BY_ID = `
  DELETE FROM conflicts
  WHERE id = ?
`;

export const DELETE_BY_AGGREGATE = `
  DELETE FROM conflicts
  WHERE aggregateType = ?
    AND aggregateId   = ?
`;

export const COUNT_BY_STATUS = `
  SELECT COUNT(*) as count
  FROM conflicts
  WHERE status = ?
`;

export const GET_PENDING_CONFLICTS  = `
    SELECT *
    FROM conflicts
    WHERE status = 'PENDING'
    ORDER BY createdAt DESC;
`

