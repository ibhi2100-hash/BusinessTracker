import { useBranchStore } from "@/store/useBranchStore";
import { getAll, getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function loadBranches(businessId: string) {

    const branches = await getByIndex(TABLES.BRANCHES, "businessId", businessId);
    const activeBranchId = branches[0]?.id;

    if(!branches) return ;

    useBranchStore.getState().setBranches(branches);
    useBranchStore.getState().setActiveBranch(activeBranchId)

    return branches;
}