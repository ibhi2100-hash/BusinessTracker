import { createEvent } from "@/offline/core/events/eventFactory";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";

export const eventService = {
  async create(input: {
    type: string;
    payload: any;
    businessId: string;
    branchId: string;
    userId: string;
  }) {
    const event = createEvent(input);

    // 🔥 ONLY RESPONSIBILITY
    await dispatchEvent(event);

    return event;
  }
};