import { createEvent } from "@/offline/core/events/eventFactory";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { nanoid } from "nanoid";
import { InventoryEventType } from "@/offline/core/events/eventGroups/inventoryEvents";
import { OpeninigEventType } from "@/offline/core/events/eventGroups/openingEvents";
import { useInventoryStore } from "../store/inventoryStore";

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
    console.log("Event Before Dispatched ", event)

    await dispatchEvent(event);
    return event;
  },

  // ✅ COMPOSITE COMMAND (this is what you need)
  async createProductWithOpeningStock(data: {
    name: string;
    price: number;
    costPrice: number;
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
        costPrice: data.costPrice,
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
          costPrice: data.costPrice, // normalized field
        },
      });
    }

    return productId;
  },

 async updateProductSmart(input: ProductUpdateInput) {
  const db = useInventoryStore.getState().productsById[input.productId];
  if (!db) throw new Error("Product not found");

  const events = [];

  // -----------------------------
  // 1. Detect PRODUCT changes
  // -----------------------------
  const productChanged =
    input.name !== undefined ||
    input.price !== undefined ||
    input.costPrice !== undefined;

  if (productChanged) {
    events.push(
      this.create({
        type: InventoryEventType.PRODUCT_UPDATED,
        mode: "LIVE",
        payload: {
          productId: input.productId,
          name: input.name ?? db.name,
          price: input.price ?? db.price,
          cost: input.costPrice ?? db.costPrice,
        },
      })
    );
  }

  // -----------------------------
  // 2. Detect INVENTORY changes
  // -----------------------------
  const stockChanged = input.quantity !== undefined;

  if (stockChanged) {
    events.push(
      this.create({
        type: InventoryEventType.INVENTORY_UPDATED,
        mode: "LIVE",
        payload: {
          productId: input.productId,
          quantityDelta: input.quantity!, // delta-based model
        },
      })
    );
  }

  // -----------------------------
  // 3. Execute atomically (sequential dispatch)
  // -----------------------------
  for (const e of events) {
    await e;
  }

  return true;
} 
};