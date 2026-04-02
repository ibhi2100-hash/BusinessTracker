import { getByIndex } from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";

export async function getCashBalance(branchId: string) {
  const entries = await getByIndex(
    TABLES.LEDGER_ENTRIES,
    "by_branch",
    branchId
  );
  const balance = entries
    .filter((e: any) => e.account === "cash")
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  return { entries, balance}
}