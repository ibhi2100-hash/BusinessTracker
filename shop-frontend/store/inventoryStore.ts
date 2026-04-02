import { create } from "zustand";
import { Category, Brand, InventoryItem } from "@/types/types";

interface InventoryStore {
  // DATA (read मॉडल)
  categories: Category[];
  brands: Brand[];
  products: InventoryItem[];

  // UI STATE
  selectedCategoryId: string | null;
  selectedBrandId: string | null;

  // HYDRATION (from DB)
  hydrate: (data: {
    categories?: Category[];
    brands?: Brand[];
    products?: InventoryItem[];
  }) => void;

  // SETTERS (controlled updates from controllers / subscriptions)
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setProducts: (products: InventoryItem[]) => void;

  // UI FILTER STATE
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedBrandId: (id: string | null) => void;

  // RESET
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  categories: [],
  brands: [],
  products: [],

  selectedCategoryId: null,
  selectedBrandId: null,

  // 🔥 HYDRATION (atomic merge)
  hydrate: (data) =>
    set((state) => ({
      categories: data.categories ?? state.categories,
      brands: data.brands ?? state.brands,
      products: data.products ?? state.products,
    })),

  // 🔥 PURE SETTERS (DB → UI sync only)
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setProducts: (products) => set({ products }),

  // UI-only logic (valid)
  setSelectedCategoryId: (id) =>
    set({
      selectedCategoryId: id,
      selectedBrandId: null, }),

  setSelectedBrandId: (id) =>
    set({
      selectedBrandId: id,
      products: [],
    }),

  resetInventory: () =>
    set({
      categories: [],
      brands: [],
      products: [],
      selectedCategoryId: null,
      selectedBrandId: null,
    }),
}));