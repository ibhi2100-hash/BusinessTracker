import { addRecord, getByIndex } from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "@/offline/events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { financeEventType } from "@/offline/events/eventGroups/financeEvent";
import { useAuthStore } from "@/store/useAuthStore";
import { Asset, FinanceStore } from "@/store/useFinanceStore";
import { generateLedgerEntries } from "../../../shared/ledgerGenerator";
import { createEntity } from "@/offline/entities/entityFactory";

export const assetController  = {
    async createAssets(assetData: any) {
    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId= useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id
    
    const asset =createEntity({
      ...assetData,
      businessId,
      branchId
    })

    const  event = await createEvent(financeEventType.ASSET_ADDED, userId , businessId, branchId, asset, "pending")

    // 2️⃣ Dispatch event
    await dispatchEvent(event)
        // add ledger entries
    await generateLedgerEntries(event)

    // Hydrate financeStore
        FinanceStore.getState().setAsset(asset)

    return asset
    },
    async loadAssets() {
    // Implementation for hydrating the Zustand store
    const branchId = useBranchStore(s=> s.activeBranchId)
    const assets: Asset[] = await getByIndex(TABLES.ASSETS, "by_branch", branchId )
        if(assets) {
            FinanceStore.getState().setAsset(assets)
        }
        return;
    },

}