import { getSubscriptionDb } from "./subscriptionDb";

export const saveSubscription = async (data: any) => {
  const db = await getSubscriptionDb();
  if (!db) return;

  await db.put("subscription", data, "current");
};

export const getSubscriptionCache = async () => {
  const db = await getSubscriptionDb();
  if (!db) return null;

  return db.get("subscription", "current");
};