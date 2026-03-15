import { addRecord } from "../../db/helpers";
import { TABLES } from "../../db/schema";
import { dispatchEvent } from "../../events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "../../events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { financeEventType } from "@/offline/events/eventGroups/financeEvent";
import { useAuthStore } from "@/store/useAuthStore";
import { FinanceStore } from "@/store/useFinanceStore";
import { generateLedgerEntries } from "@/offline/ledger/ledgerGenerator";
import { createEntity } from "@/offline/entities/entityFactory";


export async function createAssets(assetData: any) {
    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId= useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id
    const asset =createEntity({
      ...assetData,
      businessId,
      branchId
    })
  
 await addRecord(TABLES.ASSETS, asset);

 const  event = await createEvent(financeEventType.ASSET_ADDED, userId , businessId, branchId, asset, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)
    // add ledger entries
  await generateLedgerEntries(event)

  // Hydrate financeStore
    FinanceStore.getState().setAsset(asset)

  return asset
}