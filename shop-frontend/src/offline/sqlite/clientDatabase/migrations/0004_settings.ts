export const migration0004 = `
    CREATE TABLE IF NOT EXISTS settings (

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;