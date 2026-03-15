import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";
import { useSalesStore } from "@/store/SalesStore";

export async function hydrateSalesZustandStore() {
  // Implementation for hydrating the Zustand store
  const branchId = useBranchStore(s=> s.activeBranchId)
  const Sales = await getByIndex(TABLES.SALES, "by_branch", branchId )
    if(Sales) {
        useSalesStore.getState().addSale(Sales)
    }

    return;
}