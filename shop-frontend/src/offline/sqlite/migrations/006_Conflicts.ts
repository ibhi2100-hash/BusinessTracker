export const migration006 = `
CREATE TABLE IF NOT EXISTS conflicts (

    id TEXT PRIMARY KEY,

    aggregate_id TEXT NOT NULL,

    aggregate_type TEXT NOT NULL,

    local_version INTEGER NOT NULL,

    server_version INTEGER NOT NULL,

    resolution TEXT,

    payload TEXT,

    created_at TEXT NOT NULL,

    resolved_at TEXT
);
`;