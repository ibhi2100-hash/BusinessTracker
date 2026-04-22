// ~/offline/utils/indexedDbUtils.ts

let dbConnection: IDBDatabase | null = null;

export async function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("inventory")) {
        db.createObjectStore("inventory", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      dbConnection = request.result;
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

// Close any active connection
export function closeDBConnection() {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
    console.log("IndexedDB connection closed");
  }
}

// Delete database safely
export async function clearIndexedDB(dbName: string) {
  closeDBConnection(); // ensure connection is closed before deleting

  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
      console.log(`IndexedDB "${dbName}" cleared`);
      resolve();
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      console.warn("IndexedDB deletion blocked — another connection still open?");
  });
}
function openIndexedDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("inventory")) {
        db.createObjectStore("inventory", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function populateUserData(db: IDBDatabase, data: any) {
  const tx = db.transaction(["inventory", "sales"], "readwrite");
  const invStore = tx.objectStore("inventory");
  const salesStore = tx.objectStore("sales");

  data.inventory?.forEach((item: any) => invStore.put(item));
  data.sales?.forEach((sale: any) => salesStore.put(sale));

  return tx.complete;
}