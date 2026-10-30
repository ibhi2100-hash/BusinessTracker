import { create } from "zustand";

/** A cart line is identified independently from its product.
 * The same product can appear on multiple lines at different negotiated prices.
 */
export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
}

export interface NewCartItem extends Omit<CartItem, "lineId"> {
  lineId?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      // Merge only when product, actual unit price, and cost basis all match.
      const existing = state.items.find(
        (line) =>
          line.productId === item.productId &&
          line.price === item.price &&
          line.costPrice === item.costPrice,
      );

      if (existing) {
        return {
          items: state.items.map((line) =>
            line.lineId === existing.lineId
              ? { ...line, quantity: line.quantity + item.quantity }
              : line,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          { ...item, lineId: item.lineId ?? crypto.randomUUID() },
        ],
      };
    }),

  removeItem: (lineId) =>
    set((state) => ({
      items: state.items.filter((line) => line.lineId !== lineId),
    })),

  updateQty: (lineId, qty) =>
    set((state) => ({
      items: state.items.map((line) =>
        line.lineId === lineId ? { ...line, quantity: qty } : line,
      ),
    })),

  clear: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
