import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "@/offline/core/events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { useAuthStore } from "@/store/useAuthStore";

export async function addCash(cashData: any) {
    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId= useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id;
   
 const  event = await createEvent(financeEventType.OPENING_CAPITAL, userId , businessId, branchId, cashData, "pending")
 
 await dispatchEvent(event);

}