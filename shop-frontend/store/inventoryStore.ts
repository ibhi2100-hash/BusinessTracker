// stores/inventoryStore.ts
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
  categoryId?: string;    // optional, useful for filtering
  categoryName?: string;  // for new categories
  brandName?: string;     // for new brands
}

interface InventoryStore {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  selectedCategory?: Category;
  selectedBrand?: Brand;
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setProducts: (products: Product[]) => void;
  setSelectedCategory: (category?: Category) => void;
  setSelectedBrand: (brand?: Brand) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  categories: [],
  brands: [],
  products: [],
  selectedCategory: undefined,
  selectedBrand: undefined,

  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setProducts: (products) => set({ products }),

  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, selectedBrand: undefined }),

  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),

  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  resetInventory: () =>
    set({
      categories: [],
      brands: [],
      products: [],
      selectedCategory: undefined,
      selectedBrand: undefined,
    }),
}));
