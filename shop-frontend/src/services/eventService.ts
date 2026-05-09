import { createEvent } from "@/offline/core/events/eventFactory";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "../store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { nanoid } from "nanoid";
import { InventoryEventType } from "@/offline/core/events/eventGroups/inventoryEvents";
import { OpeninigEventType } from "@/offline/core/events/eventGroups/openingEvents";
import { useInventoryStore } from "../store/inventoryStore";

export const eventService = {
  async create(input: {
    type: string;
    aggregateId: string;
    aggregateType: string;
    payload: any;
    mode: "OPENING" | "LIVE";

    //optional Overrides
    businessId?: string | null
    branchId?: string | null
    
  }) {
    const user = useAuthStore.getState().user;
    if (!user?.id) throw new Error("Not authenticated");

    if (!input.aggregateId) {
  throw new Error("Missing aggregateId");
}
// Business Context 

const storedBusinessId =
  useBusinessStore.getState().business?.id ?? null;
const storeBranchId =
  useBranchStore.getState().activeBranchId ?? null;

// explicit overide wins
const businessId = 
  input.businessId !== undefined
    ? input.businessId
    : storedBusinessId;

const branchId = 
  input.branchId !== undefined
    ? input.branchId
    : storeBranchId

    const scope =
    !businessId
      ? "GLOBAL"
      : !branchId
      ? "BUSINESS"
      : "BRANCH";

    const event = await createEvent({
      ...input,
      scope,
      userId: user.id,
      businessId: businessId,
      branchId: branchId,
    });
    console.log("Event Before dispatched", event)
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
    const branchId = useBranchStore.getState().activeBranchId;
    if (!branchId) throw new Error("No active branch");

    // 1️⃣ PRODUCT EVENT
    await this.create({
      type: InventoryEventType.PRODUCT_CREATED,
      aggregateId: productId,
      aggregateType: "PRODUCT",

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

        aggregateId: `${productId}_${branchId}`, // separate aggregate for inventory
        aggregateType: "INVENTORY",
        mode: data.mode,
        payload: {
          id: nanoid(),
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
        aggregateId: input.productId,
        aggregateType: "PRODUCT",

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
        aggregateId: `${input.productId}_${useBranchStore.getState().activeBranchId}`,
        aggregateType: "INVENTORY",
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