export const migration0005 = `
    CREATE TABLE known_nodes(

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`;