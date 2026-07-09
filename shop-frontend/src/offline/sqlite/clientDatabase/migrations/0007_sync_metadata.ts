export const migration0007 = `
    CREATE TABLE IF NOT EXISTS sync_metadata (

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;