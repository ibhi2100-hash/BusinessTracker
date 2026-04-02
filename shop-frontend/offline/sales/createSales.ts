import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { addRecord } from "../db/helpers";
import { createEvent } from "../events/eventFactory";
import { dispatchEvent } from "../events/eventDispatcher";
import { generateLedgerEntries } from "../../../shared/ledgerGenerator";
import { TABLES } from "../db/schema";
import { salesEventType } from "../events/eventGroups/salesEvent";
import { useSalesStore } from "@/store/SalesStore";
import { createEntity } from "../entities/entityFactory";

export async function createSales(salesData: any) {
    const business = useBusinessStore.getState().business;
    const branchId = useBranchStore.getState().activeBranchId;
    const user = useAuthStore.getState().user
     // 🔴 HARD GUARDS
  if (!business) {
    throw new Error("Business not initialized");
  }

  if (!branchId) {
    throw new Error("Branch not selected");
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  const businessId = business.id;
  const userId = user.id;

    const sales = createEntity({
        ...salesData,
        businessId,
        branchId
    })
  
 await addRecord(TABLES.SALES, sales);

 const  event = await createEvent(salesEventType.SALE_ADDED, userId , businessId, branchId, sales, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)

  // add ledger entries
  const ledger = await generateLedgerEntries(event)

  // Hydrate financeStore
  useSalesStore.getState().addSale(sales)

  return business
}