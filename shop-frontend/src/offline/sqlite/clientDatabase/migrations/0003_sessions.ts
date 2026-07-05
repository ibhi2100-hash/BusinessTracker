export const migration0003 = `
    CREATE TABLE sessions (

    id TEXT PRIMARY KEY,

    accessToken  TEXT,

    refreshToken  TEXT,

    createdAt INTEGER NOT NULL

);
`;