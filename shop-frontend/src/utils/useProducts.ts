import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/src/db/index";

export function useProducts() {
  const db = getDb();

  return useLiveQuery(() => {
    if (!db) return [];
    return db.products.toArray();
  }, [db]);
}