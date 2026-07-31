import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration011: Migration = {
  version: 11,
  name: "Checkpoint",

  async up(q){
    await q.execute(
        `
  CREATE TABLE checkpoints (
    id TEXT PRIMARY KEY,
    globalPosition INTEGER NOT NULL
  );

  `
    )
  }
}