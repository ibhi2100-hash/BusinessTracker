export const migration0008 = `
    CREATE TABLE IF NOT EXISTS active_branch(

    id TEXT PRIMARY KEY,
    branchId    TEXT

);
`;