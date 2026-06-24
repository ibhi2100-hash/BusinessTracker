// src/database/sqlite/SQLiteDB.ts

type WorkerMessage = {
  id: string;
  type: string;
  payload?: any;
};

export class SQLiteDB {
  private worker: Worker;
  private pending = new Map<string, any>();

  constructor() {
    this.worker = new Worker(
      new URL("../worker/worker.ts", import.meta.url)
    );

    this.worker.onmessage = (event) => {
      const { id, result, error } = event.data;

      const resolver = this.pending.get(id);
      if (!resolver) return;

      this.pending.delete(id);

      if (error) resolver.reject(error);
      else resolver.resolve(result);
    };
  }

  async init() {
    return this.send("INIT");
  }

  async query<T = Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
    return this.send("RUN", { sql, params }) as Promise<T[]>;
  }

  private send<T>(
  type: string,
  payload?: any
): Promise<T> {
  const id = crypto.randomUUID();

  return new Promise<T>((resolve, reject) => {
    this.pending.set(id, {
      resolve,
      reject,
    });

    this.worker.postMessage({
      id,
      type,
      payload,
    });
  });
}
}