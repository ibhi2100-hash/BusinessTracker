import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";

const userId = useAuthStore.getState().user.id;
const db = getDb(userId)
export const projectionStoreMap = {
  product: db.products,
  inventory: db.inventory,
  business: db.businesses,
  branch: db.branches
};