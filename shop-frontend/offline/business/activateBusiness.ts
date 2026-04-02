import { TABLES } from "../db/schema";
import { dispatchEvent } from "../events/eventDispatcher";
import { createEvent } from "../events/eventFactory";
import { getDb } from "../db/indexDB";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { BusinessEventTypes } from "../events/eventGroups/businessEvents";
import { useAuthStore } from "@/store/useAuthStore";


export async function activateMyBusiness() {
    const db = await getDb()
    const business = useBusinessStore.getState().business;
    if(!business) return;
    const businessId = useBusinessStore.getState().business.id;

    const activeBranchId = useBranchStore.getState().activeBranchId        
    const userId = useAuthStore.getState().user.id;
    const event = createEvent(BusinessEventTypes.BUSINESS_ACTIVATION, userId, businessId, activeBranchId, {}, "pending");
    
    dispatchEvent(event)
    await db.put(TABLES.BUSINESS, {
        ...business,
        isOnboarding: false,
        onboardingCompleted: true,
        status: "ACTIVE"
    })
}