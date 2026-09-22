export const ACTIVITY_INSERT = `
    INSERT INTO sync_activities (
        activityId,
        type,
        status,
        message,
        eventId,
        aggregateType,
        aggregateId,
        sequenceNumber,
        createdAt,
        metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(activityId)
    DO NOTHING
`;

export const FIND_BY_ID = `
  SELECT * FROM sync_activities WHERE id = ?
`;

export const FIND_BY_ACTIVITY_ID = `
  SELECT * FROM sync_activities WHERE activityId = ?
`;

export const FIND_RECENT = `
  SELECT * FROM sync_activities
  ORDER BY createdAt DESC
  LIMIT ?
`;

export const FIND_BY_TYPE = `
  SELECT * FROM sync_activities
  WHERE type = ?
  ORDER BY createdAt DESC
  LIMIT ?
`;

export const FIND_BY_STATUS = `
  SELECT * FROM sync_activities
  WHERE status = ?
  ORDER BY createdAt DESC
  LIMIT ?
`;

export const FIND_BY_EVENT = `
  SELECT * FROM sync_activities
  WHERE eventId = ?
  ORDER BY createdAt ASC
`;

export const FIND_BY_AGGREGATE = `
  SELECT * FROM sync_activities
  WHERE aggregateType = ?
    AND aggregateId = ?
  ORDER BY createdAt DESC
`;

export const FIND_BY_TYPE_AND_RANGE = `
  SELECT * FROM sync_activities
  WHERE type = ?
    AND createdAt >= ?
    AND createdAt <= ?
  ORDER BY createdAt DESC
`;

export const FIND_IN_RANGE = `
  SELECT * FROM sync_activities
  WHERE createdAt >= ?
    AND createdAt <= ?
  ORDER BY createdAt DESC
`;

export const FIND_ERRORS = `
  SELECT * FROM sync_activities
  WHERE status = 'ERROR'
  ORDER BY createdAt DESC
  LIMIT ?
`;

export const COUNT_BY_TYPE = `
  SELECT COUNT(*) as count
  FROM sync_activities
  WHERE type = ?
`;

export const DELETE_OLDER_THAN = `
  DELETE FROM sync_activities
  WHERE createdAt < ?
`;

export const DELETE_BY_ID = `
  DELETE FROM sync_activities WHERE id = ?
`;