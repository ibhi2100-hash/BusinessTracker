export const SYNC_STATE_UPSERT = `
  INSERT INTO sync_state (
    id,
    status,
    pendingEvents,
    uploadedEvents,
    alreadyAcceptedEvents,
    pulledEvents,
    acceptedEvents,
    rejectedEvents,
    conflictEvents,
    deviceCursor,
    lastPulledGlobalPosition,
    lastSyncAt,
    lastSyncDurationMs,
    lastResult,
    error,
    updatedAt
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id)
  DO UPDATE SET
    status                   = excluded.status,
    pendingEvents            = excluded.pendingEvents,
    uploadedEvents           = excluded.uploadedEvents,
    alreadyAcceptedEvents    = excluded.alreadyAcceptedEvents,
    pulledEvents             = excluded.pulledEvents,
    acceptedEvents           = excluded.acceptedEvents,
    rejectedEvents           = excluded.rejectedEvents,
    conflictEvents           = excluded.conflictEvents,
    deviceCursor             = excluded.deviceCursor,
    lastPulledGlobalPosition = excluded.lastPulledGlobalPosition,
    lastSyncAt               = excluded.lastSyncAt,
    lastSyncDurationMs       = excluded.lastSyncDurationMs,
    lastResult               = excluded.lastResult,
    error                    = excluded.error,
    updatedAt                = excluded.updatedAt
`;

export const FIND = `
  SELECT *
  FROM sync_state
  WHERE id = 1
  LIMIT 1
`;

export const UPDATE_STATUS = `
  UPDATE sync_state
  SET
    status    = ?,
    updatedAt = ?
  WHERE id = 1
`;

export const UPDATE_AFTER_SYNC = `
  UPDATE sync_state
  SET
    status                   = ?,
    pendingEvents            = ?,
    uploadedEvents           = ?,
    alreadyAcceptedEvents    = ?,
    pulledEvents             = ?,
    acceptedEvents           = ?,
    rejectedEvents           = ?,
    conflictEvents           = ?,
    deviceCursor             = ?,
    lastPulledGlobalPosition = ?,
    lastSyncAt               = ?,
    lastSyncDurationMs       = ?,
    lastResult               = ?,
    error                    = ?,
    updatedAt                = ?
  WHERE id = 1
`;

export const INCREMENT_COUNTERS = `
  UPDATE sync_state
  SET
    pendingEvents         = pendingEvents         + ?,
    uploadedEvents        = uploadedEvents        + ?,
    alreadyAcceptedEvents = alreadyAcceptedEvents + ?,
    pulledEvents          = pulledEvents          + ?,
    acceptedEvents        = acceptedEvents        + ?,
    rejectedEvents        = rejectedEvents        + ?,
    conflictEvents        = conflictEvents        + ?,
    updatedAt             = ?
  WHERE id = 1
`;

export const RESET_COUNTERS = `
  UPDATE sync_state
  SET
    pendingEvents         = 0,
    uploadedEvents        = 0,
    alreadyAcceptedEvents = 0,
    pulledEvents          = 0,
    acceptedEvents        = 0,
    rejectedEvents        = 0,
    conflictEvents        = 0,
    updatedAt             = ?
  WHERE id = 1
`;

export const SET_DEVICE_CURSOR = `
  UPDATE sync_state
  SET
    deviceCursor = ?,
    updatedAt    = ?
  WHERE id = 1
`;

export const SET_ERROR = `
  UPDATE sync_state
  SET
    status    = 'ERROR',
    error     = ?,
    updatedAt = ?
  WHERE id = 1
`;

export const CLEAR_ERROR = `
  UPDATE sync_state
  SET
    error     = NULL,
    updatedAt = ?
  WHERE id = 1
`;