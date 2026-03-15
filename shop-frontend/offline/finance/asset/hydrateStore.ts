import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../../db/helpers";
import { TABLES } from "../../db/schema";
import { FinanceStore } from "@/store/useFinanceStore";

export async function hydrateAssetZustandStore() {
  // Implementation for hydrating the Zustand store
  const branchId = useBranchStore(s=> s.activeBranchId)
  const assets = await getByIndex(TABLES.ASSETS, "by_branch", branchId )
    if(assets) {
        FinanceStore.getState().setAsset(assets)
    }
    return;
}