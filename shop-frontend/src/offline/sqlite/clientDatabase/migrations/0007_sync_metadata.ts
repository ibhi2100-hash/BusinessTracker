export const migration0007 = `
    CREATE TABLE sync_metadata (

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;