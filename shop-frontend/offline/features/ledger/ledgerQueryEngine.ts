import { TABLES } from "@/offline/core/db/schema";

export async function getLedgerEntries(
  branchId: string,
  start?: number,
  end?: number
) {
  const entries = []
  if (!start && !end) return entries;

  return entries.filter((e:any) => {
    if (start && e.timestamp < start) return false;
    if (end && e.timestamp > end) return false;
    return true;
  });
}