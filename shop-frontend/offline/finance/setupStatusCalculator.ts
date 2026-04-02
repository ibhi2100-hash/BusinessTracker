import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";
import { useBusinessStore } from "@/store/businessStore";


export const setupStatusCalculation = async () => {
  const businessId = useBusinessStore.getState().business.id
  const branchId = useBranchStore.getState().activeBranchId;

  // --- Opening Cash: sum all capital injections for this branch ---
  const ledgerEntries = await getByIndex(TABLES.LEDGER_ENTRIES, "by_branch", branchId);
  const openingCash = ledgerEntries.filter(entry => entry.account === "CASH")
  const hasOpeningCash = openingCash.length !== 0;

  // --- Inventory: check if any products exist with quantity > 0 ---
  const inventory = await getByIndex(TABLES.PRODUCTS, "by_business_branch", [ businessId, branchId]);
  const hasInventory = inventory.some(p => p.quantity > 0);

  // --- Assets: check if any assets exist ---
  const assets = await getByIndex(TABLES.ASSETS, "by_business_branch", branchId);
  const hasAssets = assets.length > 0;

  // --- Liabilities: check if any liabilities exist ---
  const liabilities = await getByIndex(TABLES.LIABILITIES, "by_business_branch", branchId);
  const hasLiabilities = liabilities.length > 0;

  // --- Steps ---
  const steps = {
    openingCash: hasOpeningCash,
    inventory: hasInventory,
    assets: hasAssets,
    liabilities: hasLiabilities,
  };

  const completed = Object.values(steps).filter(Boolean).length;
  const percentage = Math.round((completed / 4) * 100);

  return {
    steps,
    percentage,
    canActivate: percentage === 100
  };
};