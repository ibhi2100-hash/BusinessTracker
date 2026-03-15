import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../../db/helpers";
import { TABLES } from "../../db/schema";
import { FinanceStore } from "@/store/useFinanceStore";

export async function hydrateLiabilityZustandStore() {
  // Implementation for hydrating the Zustand store
  const branchId = useBranchStore(s=> s.activeBranchId)
  const liabilities = await getByIndex(TABLES.LIABILITIES, "by_branch", branchId )
    if(liabilities) {
        FinanceStore.getState().setLiability(liabilities)
    }

    return;
}