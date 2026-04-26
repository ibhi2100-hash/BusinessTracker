import { EventRepo } from "../repositories/eventRepo/eventRepo";
import { getDb } from "../db";
import { nanoid } from "nanoid";

import { useAuthStore } from "../store/useAuthStore";
import { useBusinessStore } from "../store/businessStore";
import { useBranchStore } from "../store/useBranchStore";

// ---------------------------
// TYPES
// ---------------------------

type Mode = "OPENING" | "LIVE";

interface CreateProductPayload {
  name: string;
  price: number;
  cost: number;
  quantity: number;
  mode: Mode;
}

interface AddStockPayload {
  productId: string;
  quantity: number;
  mode: Mode;
}

interface SellPayload {
  productId: string;
  quantity: number;
}

// ---------------------------
// SERVICE
// ---------------------------

export class InventoryService {
   // ✅ lazy repo (created per call)
  private getRepo() {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error("User not authenticated");
    return new EventRepo(userId);
  }
  // ---------------------------
  // 🔐 CONTEXT
  // ---------------------------
  private getContext() {
    const userId = useAuthStore.getState().user?.id;
    const businessId = useBusinessStore.getState().business?.id;
    const branchId = useBranchStore.getState().activeBranchId;

    if (!userId) throw new Error("User not authenticated");
    if (!businessId) throw new Error("Business not set");
    if (!branchId) throw new Error("Branch not selected");

    const db = getDb(userId);
    if (!db) throw new Error("Database not initialized");

    return { db, businessId, branchId };
  }

  // ---------------------------
  // 🆕 CREATE PRODUCT + OPENING STOCK
  // ---------------------------
  async createProductWithStock(payload: CreateProductPayload) {
    const { db, businessId, branchId } = this.getContext();
    const repo = this.getRepo();

    // ---------- Validation ----------
    if (!payload.name.trim()) {
      throw new Error("Product name is required");
    }

    if (payload.price <= 0) {
      throw new Error("Selling price must be greater than 0");
    }

    if (payload.quantity <= 0) {
      throw new Error("Opening quantity must be greater than 0");
    }

    // ---------- Prevent duplicates ----------
    const existing = await db.products
      .where("[businessId+name]")
      .equals([businessId, payload.name])
      .first();

    if (existing) {
      throw new Error("Product with this name already exists");
    }

    const productId = nanoid();
    const now = Date.now();

    // ---------- 1. CREATE PRODUCT (catalog write) ----------
    await db.products.add({
      id: productId,
      name: payload.name,
      quantity: payload.quantity,
      stockMode: payload.mode,
      price: payload.price,
      cost: payload.cost,
      businessId,
      isActive: true,
      isDeleted: false,
      branchId,
      createdAt: now,
    });

    // ---------- 2. RECORD EVENT (inventory projection) ----------
    await repo.recordEvent({
      mode: payload.mode,
      event: {
        type: "OPENING_STOCK_SET", // 🔥 correct semantic event
        businessId,
        branchId,
        deviceId: "local-device", // replace later with real device id
      },
      inventoryUpdates: [
        {
          productId,
          branchId,
          quantity: payload.quantity,
        },
      ],
    });

    return productId;
  }

  // ---------------------------
  // ➕ ADD STOCK
  // ---------------------------
  async addStock(payload: AddStockPayload) {
    const { db, businessId, branchId } = this.getContext();
    const repo = this.getRepo();

    if (!payload.productId) {
      throw new Error("Product ID is required");
    }

    if (payload.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // ---------- Ensure product exists ----------
    const product = await db.products.get(payload.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    return repo.recordEvent({
      mode: payload.mode,
      event: {
        type: "STOCK_ADDED",
        businessId,
        branchId,
        deviceId: "local-device",
      },
      inventoryUpdates: [
        {
          productId: payload.productId,
          branchId,
          quantity: payload.quantity,
        },
      ],
    });
  }
  
  // ---------------------------
  //      UPDATE PRODUCTS
  // ---------------------------
  async updateProduct(productId: string, updates: {
  name?: string;
  price?: number;
  cost?: number;
}) {
  const { db, businessId } = this.getContext();
  const repo = this.getRepo();

  const product = await db.products.get(productId);
  if (!product) throw new Error("Product not found");

  await db.products.update(productId, {
    ...updates,
    updatedAt: Date.now(),
  });

  // optional: emit event for sync
  await repo.recordEvent({
    mode: "LIVE",
    event: {
      type: "PRODUCT_UPDATED",
      businessId,
      branchId: product.branchId,
    },
  });

  return productId;
}

  // ---------------------------
  //  🗑️ DELETE PRODUCT
  // ---------------------------
async deleteProduct(productId: string) {
  const { db, businessId } = this.getContext();
  const repo = this.getRepo();

  const product = await db.products.get(productId);
  if (!product) throw new Error("Product not found");

  // 🔥 soft delete
  await db.products.update(productId, {
    isDeleted: true,
    deletedAt: Date.now(),
  });

  await repo.recordEvent({
    mode: "LIVE",
    event: {
      type: "PRODUCT_DELETED",
      businessId,
      branchId: product.branchId,
    },
  });

  return productId;
}
  // ---------------------------
  // ➖ SELL PRODUCT
  // ---------------------------
  async sell(payload: SellPayload) {
    const { db, businessId, branchId } = this.getContext();
    const repo = this.getRepo();

    if (!payload.productId) {
      throw new Error("Product ID is required");
    }

    if (payload.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // ---------- Ensure product exists ----------
    const product = await db.products.get(payload.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // ---------- Check stock ----------
    const existing = await db.inventory
      .where("[productId+branchId]")
      .equals([payload.productId, branchId])
      .first();

    if (!existing || existing.quantity < payload.quantity) {
      throw new Error("Insufficient stock");
    }

    return repo.recordEvent({
      mode: "LIVE",
      event: {
        type: "PRODUCT_SOLD",
        businessId,
        branchId,
        deviceId: "local-device",
      },
      inventoryUpdates: [
        {
          productId: payload.productId,
          branchId,
          quantity: -payload.quantity, // 🔥 deduction
        },
      ],
    });
  }
}