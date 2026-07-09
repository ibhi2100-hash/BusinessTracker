export const migration0005 = `
    CREATE TABLE IF NOT EXISTS known_nodes(

    id TEXT PRIMARY KEY,

    businessId  TEXT,

    createdAt INTEGER NOT NULL

);
`;