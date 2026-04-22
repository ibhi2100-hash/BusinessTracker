import { AppDB } from "../../db/index";

export const InventoryRepo = {
  async getByProduct(
    db: AppDB,
    productId: string,
    branchId: string
  ) {
    return db.inventory
      .where("[productId+branchId]")
      .equals([productId, branchId])
      .first();
  },

  async getByBranch(db: AppDB, businessId: string, branchId: string) {
    return db.inventory
      .where("branchId")
      .equals(branchId)
      .toArray();
  },
};