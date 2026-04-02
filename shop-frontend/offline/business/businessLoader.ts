import { TABLES } from "../db/schema";
import { getAll } from "../db/helpers";
import { useBusinessStore } from "@/store/businessStore";

export async function loadBusiness() {
  const businesses = await getAll(TABLES.BUSINESS);

  if (!businesses.length) return null;

  const business = businesses[0];

  if (!business) return null;
  const current = useBusinessStore.getState().business;

if (current) {
  return current; // ✅ don't override already hydrated state
}
  useBusinessStore.getState().setBusiness(business);

  return business;
}