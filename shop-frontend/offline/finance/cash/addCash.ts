import { dispatchEvent } from "../../events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "../../events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { financeEventType } from "@/offline/events/eventGroups/financeEvent";
import { useAuthStore } from "@/store/useAuthStore";

export async function addCash(cashData: any) {
    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId= useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id;
    console.log("USERID FROM STORE: ", userId)
   
 const  event = await createEvent(financeEventType.OPENING_CAPITAL, userId , businessId, branchId, cashData, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)

  return event
}