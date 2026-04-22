import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "@/offline/core/events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { createEntity } from "@/offline/core/entities/entityFactory";

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


    const  event = await createEvent(financeEventType.LIABILITY_ADDED, userId, businessId, branchId, liability, "pending")

    // 2️⃣ Dispatch event
    await dispatchEvent(event);
}