export const migration0001 = `
    CREATE TABLE IF NOT EXISTS device (

    id TEXT PRIMARY KEY,

    publickey TEXT,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;