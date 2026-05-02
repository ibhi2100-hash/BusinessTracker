import { createEvent } from "@/offline/core/events/eventFactory";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { nanoid } from "nanoid";
import { InventoryEventType } from "@/offline/core/events/eventGroups/inventoryEvents";
import { OpeninigEventType } from "@/offline/core/events/eventGroups/openingEvents";

export const eventService = {
  async create(input: {
    type: string;
    payload: any;
    mode: "OPENING" | "LIVE";
  }) {
    const user = useAuthStore.getState().user;
    if (!user?.id) throw new Error("Not authenticated");

    let businessId = useBusinessStore.getState().business?.id;
    let branchId = useBranchStore.getState().activeBranchId;

    if (input.type === "BUSINESS_CREATED") {
      businessId = undefined;
      branchId = undefined;
    }

    const event = createEvent({
      ...input,
      userId: user.id,
      businessId: businessId ?? null,
      branchId: branchId ?? null,
    });

    await dispatchEvent(event);
    return event;
  },

  // ✅ COMPOSITE COMMAND (this is what you need)
  async createProductWithOpeningStock(data: {
    name: string;
    price: number;
    cost: number;
    quantity: number;
    mode: "OPENING" | "LIVE";
  }) {
    const productId = nanoid();

    // 1️⃣ PRODUCT EVENT
    await this.create({
      type: InventoryEventType.PRODUCT_CREATED,
      mode: data.mode,
      payload: {
        id: productId,
        name: data.name,
        price: data.price,
        cost: data.cost,
      },
    });

    // 2️⃣ INVENTORY EVENT (only if needed)
    if (data.quantity > 0) {
      await this.create({
        type: OpeninigEventType.OPENING_INVENTORY_CREATED,
        mode: data.mode,
        payload: {
          productId,
          quantity: data.quantity,
          costPrice: data.cost, // normalized field
        },
      });
    }

    return productId;
  },
};