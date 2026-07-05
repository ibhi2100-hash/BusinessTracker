export const migration0001 = `
    CREATE TABLE device (

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;