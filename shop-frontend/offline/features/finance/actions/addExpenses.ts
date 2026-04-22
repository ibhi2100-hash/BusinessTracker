import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { createEvent } from "@/offline/core/events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { useAuthStore } from "@/store/useAuthStore";
import { createEntity } from "@/offline/core/entities/entityFactory";


export async function createExpenses(expenseData: any) {
    const business = useBusinessStore.getState().business;
    const businessId = business.id;
    const branchId = useBranchStore.getState().activeBranchId;
    const userId = useAuthStore.getState().user.id
    const expense = createEntity({
      ...expenseData,
      businessId,
      branchId
    })

 const  event = await createEvent(financeEventType.EXPENSES_ADDED, userId , businessId, branchId, expense, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)
}