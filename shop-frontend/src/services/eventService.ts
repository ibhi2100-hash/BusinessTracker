import { createEvent } from "@/offline/core/events/eventFactory";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";

export const eventService = {
  async create(input: {
    type: string;
    payload: any;
    mode: "OPENING" | "LIVE";
  }) {
    const user = useAuthStore.getState().user;
    const businessId = useBusinessStore.getState().business?.id;
    const branchId = useBranchStore.getState().activeBranchId;

    if (!user?.id) throw new Error("Not authenticated");
    if (!businessId) throw new Error("Missing business");
    if (!branchId) throw new Error("Missing branch");

    const event = createEvent({
      ...input,
      userId: user.id,
      businessId,
      branchId,
    });

    console.log("[EVENT CREATED]", event);

    await dispatchEvent(event);

    return event;
  },
};