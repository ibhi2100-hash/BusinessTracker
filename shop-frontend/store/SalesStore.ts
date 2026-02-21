// stores/salesStore.ts
import { create } from "zustand";

// Sale Item interface
export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Payment interface
export interface Payment {
  type: string; // e.g., "CASH", "CARD"
  amount: number;
}

// Sale interface
export interface Sale {
  id: string;
  businessId: string;
  totalAmount: number;
  items: SaleItem[];
  payments: Payment[];
  createdAt: string;
}

// Sales Store interface
interface SalesStore {
  sales: Sale[];
  addSale: (sale: Sale) => void;
  setSales: (sales: Sale[]) => void;
  resetSales: () => void;
  updateSale: (sale: Sale) => void;
  removeSale: (saleId: string) => void;
}

// Zustand store
export const useSalesStore = create<SalesStore>((set) => ({
  sales: [],

  // Add a new sale
  addSale: (sale) =>
    set((state) => ({
      sales: [...state.sales, sale],
    })),

  // Replace all sales (useful for fetching from backend)
  setSales: (sales) => set({ sales }),

  // Reset sales
  resetSales: () => set({ sales: [] }),

  // Update existing sale
  updateSale: (sale) =>
    set((state) => ({
      sales: state.sales.map((s) => (s.id === sale.id ? sale : s)),
    })),

  // Remove a sale
  removeSale: (saleId) =>
    set((state) => ({
      sales: state.sales.filter((s) => s.id !== saleId),
    })),
}));