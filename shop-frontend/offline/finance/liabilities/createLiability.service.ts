import { addRecord } from "../../db/helpers";
import { TABLES } from "../../db/schema";
import { dispatchEvent } from "../../events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "../../events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { financeEventType } from "@/offline/events/eventGroups/financeEvent";
import { FinanceStore } from "@/store/useFinanceStore";
import { generateLedgerEntries } from "@/offline/ledger/ledgerGenerator";
import { createEntity } from "@/offline/entities/entityFactory";

export async function createLiability(liabilityData: any) {

    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId = useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id;
    const liability = createEntity({
      ...liabilityData,
      businessId,
      branchId
    })

    // 1️⃣ Save to IndexedDB
    await addRecord(TABLES.LIABILITIES, liability)
    

    const  event = await createEvent(financeEventType.LIABILITY_ADDED, userId, businessId, branchId, liability, "pending")

    // 2️⃣ Dispatch event
    await dispatchEvent(event)
      // add ledger entries
    await generateLedgerEntries(event)

    // 3️⃣ Update Zustand store
    
    FinanceStore.getState().setLiability(liability);

  return business
}