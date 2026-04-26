// inventoryStore.ts

import { Product, ProductStockMode } from "@/types/types";
import { create } from "zustand";



interface InventoryState {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
}));