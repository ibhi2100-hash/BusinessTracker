import { getByIndex } from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";

export async function getLedgerEntries(
  branchId: string,
  start?: number,
  end?: number
) {
  const entries = await getByIndex(
    TABLES.LEDGER_ENTRIES,
    "by_branch",
    branchId
  );

  if (!start && !end) return entries;

  return entries.filter((e:any) => {
    if (start && e.timestamp < start) return false;
    if (end && e.timestamp > end) return false;
    return true;
  });
}