import { TABLES } from "../db/schema";
import { getAll } from "../db/helpers";
import { useBusinessStore } from "@/store/businessStore";

export async function loadBusiness() {
  const store = useBusinessStore.getState();

  // ✅ prevent override if already hydrated
  if (store.business) {
    return store.business;
  }

  const businesses = await getAll(TABLES.BUSINESS);

  if (!businesses.length) return null;

  // assuming single-tenant per user
  const business = businesses[0];

  store.setBusiness(business);

  return business;
}