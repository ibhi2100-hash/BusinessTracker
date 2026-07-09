export const migration0003 = `
    CREATE TABLE IF NOT EXISTS sessions (

    id TEXT PRIMARY KEY,

    accessToken  TEXT,

    refreshToken  TEXT,

    expiresAt INTEGER,

    userId  TEXT,

    createdAt INTEGER NOT NULL

);
`;