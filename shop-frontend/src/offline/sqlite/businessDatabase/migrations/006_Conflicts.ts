export const migration006 = `
CREATE TABLE IF NOT EXISTS conflicts (

    id TEXT PRIMARY KEY,

    aggregateId TEXT NOT NULL,

    aggregateType TEXT NOT NULL,

    localVersion INTEGER NOT NULL,

    serverVersion INTEGER NOT NULL,

    resolution TEXT,

    payload TEXT,

    createdAt TEXT NOT NULL,

    resolvedAt TEXT
);
`