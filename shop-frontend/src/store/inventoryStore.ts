import { Product } from "@/types/types";
import { create } from "zustand";

export interface inventoryProduct extends Product {
  quantity: number;
}
interface InventoryState {
  productsById: Record<string, inventoryProduct>;

  setProducts: (products: inventoryProduct[]) => void;
  replaceProducts: (products: inventoryProduct[]) => void;

  upsertProduct: (product: inventoryProduct) => void;

  removeProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  productsById: {},

  // ⚡ bulk load (subscriber)
  setProducts: (products) =>
    set(() => {
      const map: Record<string, inventoryProduct> = {};
      for (const p of products) {
        map[p.id] = p;
      }
      return { productsById: map };
    }),
  // ⚡ bulk replace (e.g. after sync)
  replaceProducts: (products) =>
    set(() => {
      const map: Record<string, inventoryProduct> = {};
      for (const p of products) {
        map[p.id] = p;
      }
      return { productsById: map };
    }),

  // ⚡ single update (POS instant updates)
  upsertProduct: (product) =>
    set((state) => ({
      productsById: {
        ...state.productsById,
        [product.id]: product,
      },
    })),

  // ⚡ delete
  removeProduct: (id) =>
    set((state) => {
      const copy = { ...state.productsById };
      delete copy[id];
      return { productsById: copy };
    }),
}));