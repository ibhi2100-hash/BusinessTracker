import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { addRecord } from "../db/helpers";
import { createEvent } from "../events/eventFactory";
import { dispatchEvent } from "../events/eventDispatcher";
import { generateLedgerEntries } from "../ledger/ledgerGenerator";
import { TABLES } from "../db/schema";
import { salesEventType } from "../events/eventGroups/salesEvent";
import { useSalesStore } from "@/store/SalesStore";

export async function createSales(salesData: any) {
    const business = useBusinessStore(s=> s.business);
    const businessId = business.id;
    const activeBranchId = useBranchStore(s=> s.activeBranchId);
    const userId = useAuthStore(s=> s.user.id)

    const sales = {
        id: crypto.randomUUID(),
        ...salesData,
        businessId,
        activeBranchId,
        updatedAt: Date.now()
    }
  
 await addRecord(TABLES.SALES, sales);

 const  event = await createEvent(salesEventType.SALE_ADDED, userId , businessId, activeBranchId, sales, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)

  // add ledger entries
  await generateLedgerEntries(event)

  // Hydrate financeStore
  useSalesStore.getState().addSale(sales)

  return business
}