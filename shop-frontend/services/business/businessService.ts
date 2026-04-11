import { dispatchEvent } from "../../offline/events/eventDispatcher";
import { BusinessEventTypes } from "../../offline/events/eventGroups/businessEvents";
import { createEvent } from "../../offline/events/eventFactory";
import { createEntity } from "../../offline/entities/entityFactory";
import { Business } from "@/types/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { getByIndex } from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";


export const businessService = {
    async createBusiness(input: any, branchData: any) {
    const userId =  useAuthStore.getState().user.id
    const store = useBusinessStore.getState(); 

    if (!userId) {
        throw new Error("No active session");
    }
    const businessData = {
    ...input,
    userId,
    onboardingStep: 1,
    isOnboarding: true,
    onboardingCompleted: false,
    status: "ONBOARDING"
    
    }

    // 1️⃣ Create entities
    const business = createEntity(businessData);
    const branch = createEntity({
        ...branchData,
        businessId: business.id,
    });

    // 2️⃣ Create event (single source of truth)
    const event = await createEvent(
        BusinessEventTypes.BUSINESS_CREATED,
        userId,
        business.id,
        branch.id,
        { business, branch },
        "pending"
    );

    // 3️⃣ Dispatch event (writes to DB via reducer)
    await dispatchEvent(event);

    // 4️⃣ Update local store (optimistic UI)
    store.setBusiness(business);
    useBranchStore.getState().setBranches([branch]);
    useBranchStore.getState().setActiveBranch(branch.id);
    return business;
    },

    async  activateMyBusiness() {
        const user = useAuthStore.getState().user;
        const business: Business = (await getByIndex(TABLES.BUSINESS, "by_user", user.id))[0] as Business;
        const activeBranchId = useBranchStore.getState().activeBranchId;
        
        const updatedBusinessData = {
            ...business,
            activatedAt: Date.now(),
            onboardingStep: 4,
            isOnboarding: false,
            onboardingCompleted: true,
            status: "ACTIVE"
        }

        if (!business || !user?.id || !activeBranchId) {
            throw new Error("Missing required activation context");
        }

        // 1️⃣ Create event
        const event = await createEvent(
            BusinessEventTypes.BUSINESS_ACTIVATION,
            user.id,
            business.id,
            activeBranchId,
            updatedBusinessData,
            "pending"
        );

        // 2️⃣ Dispatch event (reducers handle DB update)
        await dispatchEvent(event);

    },

    async loadBusiness() {
        const store = useBusinessStore.getState();
        const userId = useAuthStore.getState().user.id

        // ✅ prevent override if already hydrated
        if (store.business) {
            return store.business;
        }

        const business = await getByIndex(TABLES.BUSINESS, "by_user", userId);

        if (!business.length) return null;

        // assuming single-tenant per user
        const businessForUser = business[0] as Business;

        store.setBusiness(businessForUser
        );

        return business;
        }
}