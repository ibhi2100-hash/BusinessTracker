import { DB_NAME } from "./schema";

let dbConnection: IDBDatabase | null = null;

export async function getDb() {
  if (dbConnection) return dbConnection; // reuse existing connection

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "eventId" });
      }
      // add other stores if needed
    };

    request.onsuccess = () => {
      dbConnection = request.result;
      resolve(dbConnection);
    };

    request.onerror = () => reject(request.error);
  });
}

// Close the active DB connection
export function closeDbConnection() {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
    console.log("Sync DB connection closed");
  }
}