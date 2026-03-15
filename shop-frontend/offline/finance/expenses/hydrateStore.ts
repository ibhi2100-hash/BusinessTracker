import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../../db/helpers";
import { TABLES } from "../../db/schema";
import { FinanceStore } from "@/store/useFinanceStore";

export async function hydrateExpenseZustandStore() {
  // Implementation for hydrating the Zustand store
  const branchId = useBranchStore(s=> s.activeBranchId)
  const expenses = await getByIndex(TABLES.EXPENSES, "by_branch", branchId )
    if(expenses) {
        FinanceStore.getState().setExpense(expenses)
    }
    return
}