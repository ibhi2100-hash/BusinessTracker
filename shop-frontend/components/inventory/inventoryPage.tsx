"use client";

import { useEffect, useMemo, useState } from "react";
import { useInventoryStore } from "@/src/store/inventoryStore";
import { inventoryProduct } from "@/src/store/inventoryStore";
import ProductCard from "./productCard";
import ProductSheet from "./ProductSheet";
import CartBar from "@/components/inventory/CartBar";
import { toast } from "sonner";
import {
  startInventorySubscriber,
  stopInventorySubscriber,
} from "@/offline/subscribers/inventorySubscriber";

import {
  Search,
  Plus,
  Package,
  LayoutGrid,
} from "lucide-react";
import { useCartStore } from "@/src/store/useCartStore";
import { eventService } from "@/src/services/eventService";
import { OpeningEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";
import { AggregateType } from "@/offline/domain/aggregate";
import SellCard from "./SalesCard";
import { GlassButton } from "../ui/GlassButton";

interface InventoryPageProps {
  context: "sell" | "admin";
  mode: "OPENING" | "LIVE";
}

export default function InventoryPage({
  context,
  mode,
}: InventoryPageProps) {
  const productsMap = useInventoryStore((s) => s.productsById);

  const products = useMemo(() => {
    return Object.values(productsMap);
  }, [productsMap]);

  // -----------------------------
  // UI STATE
  // -----------------------------
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] =
    useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] =
    useState<inventoryProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<string>("All");

  // -----------------------------
  // SUBSCRIBER
  // -----------------------------
  useEffect(() => {
    startInventorySubscriber();
    return () => stopInventorySubscriber();
  }, []);

  // -----------------------------
  // 📦 CATEGORIES
  // -----------------------------
  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category || "Uncategorized")
    );
    return ["All", ...Array.from(set)];
  }, [products]);

  // -----------------------------
  // 🔍 FILTER
  // -----------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        activeCategory === "All" ||
        (p.category || "Uncategorized") === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);
  

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const openCreate = () => {
    setSheetMode("create");
    setSelectedProduct(null);
    setSheetOpen(true);
  };

  const openEdit = (product: inventoryProduct) => {
    setSheetMode("edit");
    setSelectedProduct(product);
    setSheetOpen(true);
  };

 const handleDelete = async (productId: string) => {
  try {
    await eventService.create({
      aggregateType: AggregateType.PRODUCT,
      aggregateId: productId,
      type: mode === "OPENING" ? OpeningEventType.OPENING_INVENTORY_DELETED : InventoryEventType.PRODUCT_DELETED,
      mode,
      payload: { productId },
    });

    toast.success("Removed");
  } catch {
    toast.error("Delete failed");
  }
};
const handleCheckout = async () => {
  const cart = useCartStore.getState().items;
  if (!cart.length) return;

  try {
    setLoading(true);

    for (const item of cart) {
      await eventService.create({
        aggregateType: AggregateType.SALE,
        aggregateId: item.productId,
        type: "SALE_ADDED",
        mode: "LIVE",
        payload: {
          productId: item.productId,
          quantity: item.quantity,
          amount: item.price * item.quantity,
          costPrice: item.costPrice * item.quantity,
        },
      });
    }

    toast.success("Sale completed");
    useCartStore.getState().clear();
  } catch {
    toast.error("Checkout failed");
  } finally {
    setLoading(false);
  }
};
const handleSell = async (productId: string, quantity: number) => {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  await eventService.create({
    aggregateType: AggregateType.SALE,
    aggregateId: productId,
    type: salesEventType.SALE_ADDED,
    mode,
    payload: {
      productId,
      quantity,
      amount: product.price * quantity,
      costPrice: product.costPrice* quantity,
    },
  });

  toast.success("Sale recorded");
};

  const handleSubmit = async (data: {
  name: string;
  price: number;
  cost: number;
  quantity: number;
}) => {
  try {
    setLoading(true);

       if (sheetMode === "create") {
        await eventService.createProductWithOpeningStock({
          name: data.name,
          price: data.price,
          costPrice: data.cost,
          quantity: data.quantity,
          mode
        })
        toast.success("Product created");
      }

      if (sheetMode === "edit" && selectedProduct) {
        await eventService.updateProductSmart({
          productId: selectedProduct.id,
          name: data.name,
          price: data.price,
          costPrice: data.cost,
          quantity: data.quantity,
        })

        toast.success("Product updated");
      }

    setSheetOpen(false);
  } catch (e) {
    console.error(e);
    toast.error("Operation failed");
  } finally {
    setLoading(false);
  }
};

  function openQuantityModal(product: inventoryProduct): void {
    throw new Error("Function not implemented.");
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div >
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b">
        <div className="px-4 pt-4 pb-3 space-y-3">
          {/* TITLE */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              {context === "sell"
                ? "Quick Sell"
                : "Inventory"}
            </h1>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-10 pr-4 py-3
                rounded-2xl
                border border-gray-200
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-green-500
              "
            />
          </div>

          {/* CATEGORIES */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  flex items-center gap-1
                  px-4 py-2 rounded-full text-sm
                  transition-all
                  ${
                    activeCategory === cat
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white border text-gray-700"
                  }
                `}
              >
                <Package className="w-3 h-3" />
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= GRID ================= */}
          {/* ================= GRID ================= */}
      <div className="px-3 pt-3 pb-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No products found
          </div>
        ) : (
          <div
            className="
              grid 
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-3
              sm:gap-4
            "
          >
            {filteredProducts.map((product) =>
            context === "sell" ? (
              <SellCard
                key={product.id}
                product={product}
                onSell={handleSell}
                onOpenQuantityModal={openQuantityModal}
              />
            ) : (
              <ProductCard
                key={product.id}
                product={product}
                context={context}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
      {/* ================= CART ================= */}
      <CartBar onCheckout={handleCheckout} />

      {/* ================= FAB ================= */}
      {context === "admin" && (
        <GlassButton
          onClick={openCreate}
          className="fixed right-4 bottom-[90px]"
        >
          <Plus className="w-6 h-6" />
        </GlassButton>
      )}

      {/* ================= SHEET ================= */}
      <ProductSheet
        open={sheetOpen}
        mode={sheetMode}
        initialData={selectedProduct}
        loading={loading}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}