import { openDB } from "idb";

let dbPromise: any = null;

export const getSubscriptionDb = async () => {
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = openDB("subscriptionDb", 1, {
      upgrade(db) {
        db.createObjectStore("subscription");
      },
    });
  }

  return dbPromise;
};