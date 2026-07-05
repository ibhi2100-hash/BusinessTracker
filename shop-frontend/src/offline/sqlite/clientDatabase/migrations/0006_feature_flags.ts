export const migration0006 = `
    CREATE TABLE feature_flags(

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;