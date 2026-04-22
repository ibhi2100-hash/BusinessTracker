import { create } from "zustand";
import { dispatchEvent } from "@/offline/core/events/eventDispatcher";

// ---------------------------
// TYPES
// ---------------------------
type Product = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    cost: number;
    category: string;
};

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

type Sale = {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    timestamp: number;
};

type Inventory = {
    available: Record<string, number>;
    reserved: Record<string, number>;
    sold: Record<string, number>;
};

// ---------------------------
// STORE STATE (PROJECTION)
// ---------------------------
type StoreState = {
    products: Record<string, Product>;
    cart: Record<string, CartItem>;
    sales: Sale[];
    inventory: Inventory;

    // ---------------------------
    // DERIVED
    // ---------------------------
    getProducts: () => Product[];
    getCartItems: () => CartItem[];

    // ---------------------------
    // UI ACTIONS (EVENT TRIGGERS)
    // ---------------------------
    addToCart: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    checkout: () => void;

    // ---------------------------
    // INTERNAL (REDUCERS ONLY)
    // ---------------------------
    _setProducts: (products: Record<string, Product>) => void;
    _upsertProduct: (product: Product) => void;

    _setInventory: (inventory: Inventory) => void;
    _applyInventoryDelta: (
        productId: string,
        delta: Partial<{ available: number; reserved: number; sold: number }>
    ) => void;

    _addSale: (sale: Sale) => void;
};

// ---------------------------
// STORE
// ---------------------------
export const useStore = create<StoreState>((set, get) => ({

    // ---------------------------
    // STATE
    // ---------------------------
    products: {},
    cart: {},
    sales: [],

    inventory: {
        available: {},
        reserved: {},
        sold: {}
    },

    // ---------------------------
    // DERIVED
    // ---------------------------
    getProducts: () => Object.values(get().products),
    getCartItems: () => Object.values(get().cart),

    // ---------------------------
    // CART (EVENT-DRIVEN + SAFE)
    // ---------------------------
    addToCart: (productId) => {
        const state = get();

        const available = state.inventory.available[productId] ?? 0;
        const reserved = state.inventory.reserved[productId] ?? 0;

        // 🚨 HARD GUARD (critical)
        if (available - reserved <= 0) return;

        const product = state.products[productId];
        if (!product) return;

        // 1. optimistic UI
        set((state) => ({
            cart: {
                ...state.cart,
                [productId]: {
                    productId,
                    name: product.name,
                    price: product.price,
                    quantity: (state.cart[productId]?.quantity ?? 0) + 1
                }
            }
        }));

        // 2. event (source of truth)
        dispatchEvent({
            id: crypto.randomUUID(),
            type: "STOCK_RESERVED",
            timestamp: Date.now(),
            payload: { productId, quantity: 1 }
        });
    },

    removeFromCart: (productId) => {
        const item = get().cart[productId];
        if (!item) return;

        dispatchEvent({
            id: crypto.randomUUID(),
            type: "STOCK_RELEASED",
            timestamp: Date.now(),
            payload: {
                productId,
                quantity: item.quantity
            }
        });

        set((state) => {
            const next = { ...state.cart };
            delete next[productId];
            return { cart: next };
        });
    },

    clearCart: () => {
        const items = Object.values(get().cart);

        for (const item of items) {
            dispatchEvent({
                id: crypto.randomUUID(),
                type: "STOCK_RELEASED",
                timestamp: Date.now(),
                payload: {
                    productId: item.productId,
                    quantity: item.quantity
                }
            });
        }

        set({ cart: {} });
    },

    checkout: () => {
        const items = Object.values(get().cart);
        if (!items.length) return;

        const now = Date.now();

        for (const item of items) {
            dispatchEvent({
                id: crypto.randomUUID(),
                type: "STOCK_SOLD",
                timestamp: now,
                payload: {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }
            });
        }

        // optimistic clear
        set({ cart: {} });
    },

    // ---------------------------
    // INTERNAL (REDUCERS ONLY)
    // ---------------------------
    _setProducts: (products) => set({ products }),

    _upsertProduct: (product) =>
        set((state) => ({
            products: {
                ...state.products,
                [product.id]: product
            }
        })),

    _setInventory: (inventory) => set({ inventory }),

    _applyInventoryDelta: (productId, delta) =>
        set((state) => {
            const nextAvailable =
                (state.inventory.available[productId] ?? 0) + (delta.available ?? 0);

            const nextReserved =
                (state.inventory.reserved[productId] ?? 0) + (delta.reserved ?? 0);

            const nextSold =
                (state.inventory.sold[productId] ?? 0) + (delta.sold ?? 0);

            return {
                inventory: {
                    available: {
                        ...state.inventory.available,
                        [productId]: Math.max(0, nextAvailable)
                    },
                    reserved: {
                        ...state.inventory.reserved,
                        [productId]: Math.max(0, nextReserved)
                    },
                    sold: {
                        ...state.inventory.sold,
                        [productId]: Math.max(0, nextSold)
                    }
                }
            };
        }),

    _addSale: (sale) =>
        set((state) => ({
            sales: [...state.sales, sale]
        }))
}));