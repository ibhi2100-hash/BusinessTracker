import { AppDB, getDb, runTx } from "../../db/index";
import { Table } from "dexie";

export abstract class BaseRepo {
  protected db: AppDB;

  constructor(userId: string) {
    const db = getDb(userId);
    if (!db) throw new Error("DB not available");
    this.db = db;
  }

  protected tx<T>(
    fn: () => Promise<T>,
    ...tables: Table<any, any>[]
  ): Promise<T> {
    if(tables.length === 0){
      return fn()
    }
    return runTx(this.db, fn, ...tables);
  }
}