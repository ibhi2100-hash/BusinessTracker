import { create } from "zustand";
import { Category, Brand, InventoryItem } from "@/types/types";

interface InventoryStore {
  // -----------------------------
  // DATA (SOURCE OF TRUTH)
  // -----------------------------
  categories: Category[];
  brands: Brand[];
  products: InventoryItem[];

  // -----------------------------
  // UI STATE
  // -----------------------------
  selectedCategoryId: string | null;
  selectedBrandId: string | null;

  // -----------------------------
  // HYDRATION (ONLY ON INIT)
  // -----------------------------
  hydrate: (data: {
    categories?: Category[];
    brands?: Brand[];
    products?: InventoryItem[];
  }) => void;

  // -----------------------------
  // MUTATIONS (EVENT-DRIVEN)
  // -----------------------------
  addProduct: (product: InventoryItem) => void;
  updateProduct: (product: InventoryItem) => void;

  // -----------------------------
  // SYNC SETTERS (DB → STATE)
  // -----------------------------
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setProducts: (products: InventoryItem[]) => void;

  // -----------------------------
  // UI FILTER STATE
  // -----------------------------
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedBrandId: (id: string | null) => void;

  // -----------------------------
  // RESET
  // -----------------------------
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  // -----------------------------
  // INITIAL STATE
  // -----------------------------
  categories: [],
  brands: [],
  products: [],

  selectedCategoryId: null,
  selectedBrandId: null,

  // -----------------------------
  // HYDRATION (SAFE MERGE)
  // ⚠️ Use ONLY on app load
  // -----------------------------
  hydrate: (data) =>
    set((state) => ({
      categories: data.categories ?? state.categories,
      brands: data.brands ?? state.brands,
      products: data.products ?? state.products,
    })),

  // -----------------------------
  // MUTATIONS (OPTIMISTIC + SAFE)
  // -----------------------------
  addProduct: (product) =>
    set((state) => {
      const exists = state.products.some((p) => p.id === product.id);
      if (exists) return state;

      return {
        products: [product, ...state.products],
      };
    }),

  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === product.id ? product : p
      ),
    })),

  // -----------------------------
  // DB SYNC (MERGE, NOT REPLACE)
  // -----------------------------
  setProducts: (incoming) =>
    set((state) => {
      const map = new Map(state.products.map((p) => [p.id, p]));

      for (const p of incoming) {
        map.set(p.id, p);
      }

      return {
        products: Array.from(map.values()),
      };
    }),

  setCategories: (incoming) =>
    set((state) => {
      const map = new Map(state.categories.map((c) => [c.id, c]));

      for (const c of incoming) {
        map.set(c.id, c);
      }

      return {
        categories: Array.from(map.values()),
      };
    }),

  setBrands: (incoming) =>
    set((state) => {
      const map = new Map(state.brands.map((b) => [b.id, b]));

      for (const b of incoming) {
        map.set(b.id, b);
      }

      return {
        brands: Array.from(map.values()),
      };
    }),

  // -----------------------------
  // UI STATE
  // -----------------------------
  setSelectedCategoryId: (id) =>
    set({
      selectedCategoryId: id,
      selectedBrandId: null, // reset downstream filter
    }),

  setSelectedBrandId: (id) =>
    set({
      selectedBrandId: id,
    }),

  // -----------------------------
  // RESET
  // -----------------------------
  resetInventory: () =>
    set({
      categories: [],
      brands: [],
      products: [],
      selectedCategoryId: null,
      selectedBrandId: null,
    }),
}));