import { TABLES } from "../db/schema";
import { getAll, getRecord } from "../db/helpers";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";

export async function loadBusiness() {
    const businesses = await getAll(TABLES.BUSINESS);
    const business = businesses[0] || null

    if(!business) return;
    useBusinessStore.getState().setBusiness(business);

    const branches = await getAll(TABLES.BRANCHES);

    if(!branches) return ;

    useBranchStore.getState().setBranches(branches)

    return business
}