export const migration003 = `
CREATE TABLE IF NOT EXISTS pending_events (

    id TEXT PRIMARY KEY,

    event_id TEXT NOT NULL,

    aggregate_id TEXT NOT NULL,

    aggregate_type TEXT NOT NULL,

    version INTEGER NOT NULL,

    event_type TEXT NOT NULL,

    payload TEXT NOT NULL,

    status TEXT NOT NULL,

    retry_count INTEGER DEFAULT 0,

    next_retry_at TEXT,

    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_status
ON pending_events(status);

CREATE INDEX IF NOT EXISTS idx_pending_retry
ON pending_events(next_retry_at);
`;