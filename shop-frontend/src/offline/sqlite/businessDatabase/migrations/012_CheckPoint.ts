export const migration012 = `
CREATE TABLE checkpoints (
  id TEXT PRIMARY KEY,
  globalPosition INTEGER NOT NULL
);

`;