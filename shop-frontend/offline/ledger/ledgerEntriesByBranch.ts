import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function getBranchLedger(branchId:string){

  return await getByIndex(
    TABLES.LEDGER_ENTRIES,
    "by_branch",
    branchId
  )
}