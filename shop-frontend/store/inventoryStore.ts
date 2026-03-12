import { create } from "zustand";

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  sellingPrice: number;
  costPrice?: number;
  quantity: number;
  type?: string;
  stockMode?: "OPENING" | "PURCHASE";
  model?: string;
  imei?: string;
  condition?: string;
  brand: Brand;
  categoryId?: string;
  categoryName?: string;
  brandName?: string;
}

interface InventoryStore {
  categories: Category[];
  brands: Brand[];
  products: Product[];

  selectedCategoryId: string | null;
  selectedBrandId: string | null;

  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setProducts: (products: Product[]) => void;

  setSelectedCategoryId: (id: string | null) => void;
  setSelectedBrandId: (id: string | null) => void;

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;

  hydrate: (data: {
    categories?: Category[];
    brands?: Brand[];
    products?: Product[];
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