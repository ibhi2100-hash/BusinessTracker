import { dispatchEvent } from "../events/eventDispatcher";
import { createEvent } from "../events/eventFactory";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { BusinessEventTypes } from "../events/eventGroups/businessEvents";
import { useAuthStore } from "@/store/useAuthStore";

export async function activateMyBusiness() {
  const business = useBusinessStore.getState().business;
  const activeBranchId = useBranchStore.getState().activeBranchId;
  const user = useAuthStore.getState().user;

  if (!business || !user?.id || !activeBranchId) {
    throw new Error("Missing required activation context");
  }

  // 1️⃣ Create event
  const event = await createEvent(
    BusinessEventTypes.BUSINESS_ACTIVATION,
    user.id,
    business.id,
    activeBranchId,
    {},
    "pending"
  );

  // 2️⃣ Dispatch event (reducers handle DB update)
  await dispatchEvent(event);

  // 3️⃣ Optimistic UI update
  useBusinessStore.getState().setBusiness({
    ...business,
    isOnboarding: false,
    onboardingCompleted: true,
    status: "ACTIVE",
  });
}