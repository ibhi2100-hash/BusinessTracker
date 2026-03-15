import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";

export const setupStatusCalculation = async ()=> {
    const branchId = useBranchStore(s=> s.activeBranchId);
  const openingCash = await getByIndex(TABLES.LEDGER_ENTRIES, "by_branch", branchId);
  const openingCashCount = openingCash.length();

  const inventory = await getByIndex(TABLES.PRODUCTS, "by_branch", branchId );
  const inventoryCount = inventory.length();

  const asset = await getByIndex(TABLES.ASSETS, "by_branch", branchId );
  const assetCount = asset.length();

  const liabilities = await getByIndex(TABLES.LIABILITIES, "by_branch", branchId );
  const liabilitesCount = asset.length();

  const steps = {
    openingCash: openingCashCount > 0,
    inventory: inventoryCount > 0,
    assets: assetCount > 0,
    liabilities: liabilitesCount > 0,
  };

  const completed = Object.values(steps).filter(Boolean).length;
  const percentage = Math.round((completed / 4) *100);

  return {
    steps,
    percentage,
    canActivate: percentage === 100
  }
}