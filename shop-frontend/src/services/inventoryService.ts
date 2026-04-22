import { EventRepo } from "../repositories/eventRepo/eventRepo";
import { AppDB, getDb } from "../db";
import { useAuthStore } from "../store/useAuthStore";
export const InventoryService = {
  async addStock( payload: any) {
    const userId = useAuthStore.getState().user.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const db = getDb(userId);

    if (!db) {
      throw new Error("Database not initialized");
    }

    const repo = new EventRepo(userId);


    return repo.recordEvent(db, {
      event: {
        type: "STOCK_ADDED",
        businessId: payload.businessId,
        branchId: payload.branchId,
      },
      inventoryUpdates: [
        {
          productId: payload.productId,
          branchId: payload.branchId,
          quantity: payload.quantity,
        },
      ],
    });
  },
};