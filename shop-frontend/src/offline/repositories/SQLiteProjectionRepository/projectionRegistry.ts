// ProjectionRegistry.ts

import { SQLiteBusinessRepository } from "./SQLiteBusinessRepository";
import { SQLiteBranchRepository } from "./SQLiteBranchRepository";
import { SQLiteProductRepository } from "./SQLiteProductRepository";
import { SQLiteInventoryRepository } from "./SQLiteInventoryRepository";

export const projectionRegistry = {
  business: new SQLiteBusinessRepository(),
  branch: new SQLiteBranchRepository(),
  product: new SQLiteProductRepository(),
  inventory: new SQLiteInventoryRepository(),
};