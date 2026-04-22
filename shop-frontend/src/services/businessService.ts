import { getDb } from "../db";
import { BusinessRepo } from "../repositories/businessRepo/businessRepo";
import { useAuthStore } from "../store/useAuthStore";

export const BusinessService = {
  async createBusiness(businessData: any, branchData: any) {
    const user = useAuthStore.getState().user;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    if (!businessData?.name) {
      throw new Error("Business name is required");
    }

    const db = getDb(user.id);

    if (!db) {
      throw new Error("Database not initialized");
    }

    const repo = new BusinessRepo(user.id);

    const result = await repo.createBusiness(
      {
        ...businessData,
        userId: user.id,
      },
      branchData
    );

    return result;
  },

  async getBusinessData() {
    const user = useAuthStore.getState().user;
    if (!user?.id) throw new Error("User not authenticated");

    const db = getDb(user.id);
    if (!db) throw new Error("DB not available");

    const repo = new BusinessRepo(user.id);

    return repo.getBusinessData();
  },
};