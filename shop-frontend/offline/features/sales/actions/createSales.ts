import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { createEvent } from "../core/events/eventFactory";
import { dispatchEvent } from "../core/events/eventDispatcher";
import { salesEventType } from "../core/events/eventGroups/salesEvent";
import { createEntity } from "../core/entities/entityFactory";

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
  


 const  event = await createEvent(salesEventType.SALE_ADDED, userId , businessId, branchId, sales, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)
}