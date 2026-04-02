import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function loadBranches(businessId: string) {
  const branches = await getByIndex(TABLES.BRANCHES, "businessId", businessId);

  if (!branches || branches.length === 0) return [];

  const store = useBranchStore.getState();
  store.setBranches(branches); // activeBranchId guaranteed here
  return branches;
}