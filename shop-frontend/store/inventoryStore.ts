import { create } from "zustand";
import { Category, Brand, InventoryItem } from "@/types/types";

interface InventoryStore {
  categories: Category[];
  brands: Brand[];
  products: InventoryItem[];

  selectedCategoryId: string | null;
  selectedBrandId: string | null;

  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setProducts: (products: InventoryItem[]) => void;

  setSelectedCategoryId: (id: string | null) => void;
  setSelectedBrandId: (id: string | null) => void;

  addProduct: (product: InventoryItem) => void;
  updateProduct: (product: InventoryItem) => void;
  removeProduct: (productId: string) => void;

  hydrate: (data: {
    categories?: Category[];
    brands?: Brand[];
    products?: InventoryItem[];
  }) => void;

  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  categories: [],
  brands: [],
  products: [],

  selectedCategoryId: null,
  selectedBrandId: null,

  setCategories: (categories) => set({ categories }),

  setBrands: (brands) => set({ brands }),

  setProducts: (products) => set({ products }),

  setSelectedCategoryId: (id) =>
    set((state) => ({
      selectedCategoryId: id,
      selectedBrandId: null,
      brands: [],     // clear brand list when category changes
      products: [],   // clear products when category changes
    })),

  setSelectedBrandId: (id) =>
    set({
      selectedBrandId: id,
      products: [],
    }),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === product.id ? product : p
      ),
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  hydrate: (data) =>
    set((state) => ({
      categories: data.categories ?? state.categories,
      brands: data.brands ?? state.brands,
      products: data.products ?? state.products,
    })),

  resetInventory: () =>
    set({
      categories: [],
      brands: [],
      products: [],
      selectedCategoryId: null,
      selectedBrandId: null,
    }),
}));