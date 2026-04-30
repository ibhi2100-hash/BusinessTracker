import { Product } from "@/types/types";
import { create } from "zustand";

interface InventoryState {
  productsById: Record<string, Product>;

  setProducts: (products: Product[]) => void;

  upsertProduct: (product: Product) => void;

  removeProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  productsById: {},

  // ⚡ bulk load (subscriber)
  setProducts: (products) =>
    set(() => {
      const map: Record<string, Product> = {};
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