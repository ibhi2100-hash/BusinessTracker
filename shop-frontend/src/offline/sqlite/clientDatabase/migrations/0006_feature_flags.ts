export const migration0006 = `
    CREATE TABLE IF NOT EXISTS feature_flags(

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;