import { getDb } from "./indexDB";

export async function addRecord(storeName: string, data: any) {
  if(!data?.id) {
    throw new Error(`${storeName} record is missing ID`);
  }
  if(typeof data === "function"){
    throw new Error("Cannot store funtion in indexDB")
  }
  const db = await getDb();
  if (!db) return;

  return db.put(storeName, data);
}

export async function getRecord(storeName: string, id: string) {
  const db = await getDb();
  if (!db) return null;

  return db.get(storeName, id);
}

export async function getAll(storeName: string) {
  const db = await getDb();
  if (!db) return [];

  return db.getAll(storeName);
}

export async function getByIndex(storeName: string, index: string, value: any) {
  const db = await getDb();
  if (!db) return [];

  return db.getAllFromIndex(storeName, index, value);
}