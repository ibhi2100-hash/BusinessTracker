import { SQLiteDB } from "./SQLiteDB";

let db: SQLiteDB | null = null;

export function getDB() {
  if (!db) {
    db = new SQLiteDB();
  }

  return db;
}