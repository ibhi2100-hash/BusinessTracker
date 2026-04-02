import { useAuthStore } from "@/store/useAuthStore";
import { getDb } from "./indexDB";

// -------------------------------------
// 🔐 INTERNAL: Resolve user-scoped DB
// -------------------------------------
async function getUserDb() {
  const user = useAuthStore.getState().user;

  if (!user?.id) {
    throw new Error("IndexedDB access denied: no authenticated user");
  }

  const db = await getDb(user.id);

  if (!db) {
    throw new Error("IndexedDB not initialized");
  }

  return db;
}

// -------------------------------------
// 🧱 VALIDATION HELPERS
// -------------------------------------
function assertValidId(id: string, storeName: string) {
  if (!id || typeof id !== "string") {
    throw new Error(`${storeName}: invalid or missing id`);
  }
}

function assertSerializable(data: any) {
  if (typeof data === "function") {
    throw new Error("Cannot store function in IndexedDB");
  }
}

// -------------------------------------
// ➕ CREATE / UPDATE
// -------------------------------------
export async function addRecord<T extends { id: string }>(
  storeName: string,
  data: T
): Promise<T> {
  assertValidId(data?.id, storeName);
  assertSerializable(data);

  const db = await getUserDb();

  await db.put(storeName, data);

  return data;
}

// -------------------------------------
// 🔍 GET SINGLE
// -------------------------------------
export async function getRecord<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  assertValidId(id, storeName);

  const db = await getUserDb();

  const result = await db.get(storeName, id);

  return result ?? null;
}

// -------------------------------------
// 📦 GET ALL (⚠️ use sparingly)
// -------------------------------------
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await getUserDb();

  return db.getAll(storeName);
}

// -------------------------------------
// 📊 GET BY INDEX (PREFERRED)
// -------------------------------------
export async function getByIndex<T>(
  storeName: string,
  index: string,
  value: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  if (!index) {
    throw new Error(`${storeName}: index is required`);
  }

  const db = await getUserDb();

  return db.getAllFromIndex(storeName, index, value);
}

// -------------------------------------
// ❌ DELETE
// -------------------------------------
export async function deleteRecord(
  storeName: string,
  id: string
): Promise<void> {
  assertValidId(id, storeName);

  const db = await getUserDb();

  await db.delete(storeName, id);
}