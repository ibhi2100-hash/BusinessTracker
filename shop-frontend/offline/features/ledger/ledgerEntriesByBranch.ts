import { getByIndex } from "../core/db/helpers";
import { TABLES } from "../../core/db/schema";

export async function getBranchLedger(branchId:string){

  return await getByIndex(
    TABLES.LEDGER_ENTRIES,
    "by_branch",
    branchId
  )
}