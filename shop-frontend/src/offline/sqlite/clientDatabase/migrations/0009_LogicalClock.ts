export const migration0009 = `
    CREATE TABLE IF NOT EXISTS logic_clock(

    id TEXT PRIMARY KEY,

    currentClock INTEGER NOT NULL DEFAULT 0

);
`;