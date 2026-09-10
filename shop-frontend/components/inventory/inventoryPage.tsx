"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Package,
  LayoutGrid,
  ShoppingCart,
  Minus,
  X,
  Trash2,
  CreditCard,
} from "lucide-react";

import ProductCard from "./cards/ProductCard";
import ProductSheet from "./dialogs/ProductSheet";
import AdjustStockSheet from "./dialogs/AdjustStockSheet";
import ReceiveStockSheet from "./dialogs/ReceivedStockSheet";
import TransferStockSheet from "./dialogs/TransferStockSheet";
import ProductHistorySheet from "./dialogs/ProductHistorySheet";
import ProductDetailsSheet from "./dialogs/ProductsManagement";

import { useCartStore } from "@/src/store/useCartStore";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import {
  OpeningEventType,
  InventoryEventType,
  salesEventType,
} from "@business/shared-types";
import { AggregateType } from "@/offline/domain/aggregate";

import SellCard from "./cards/SellCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassCard } from "../ui/GlassCard";
import { GlassInput } from "../ui/GlassInput";
import { GlassSheet } from "../ui/GlassSheet";
import { GlassIcon } from "../ui/GlassIcon";
import { useBranchStore } from "@/src/store/useBranchStore";
import { inventoryKey } from "@/src/utils/keygenerator";
import { useRouter } from "next/navigation";
import { useLiveProducts } from "@/hooks/useLiveProducts";
import { useBusinessContext } from "@/src/context/BusinessContext";
import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";
import { cn } from "@/lib/utils";

interface InventoryPageProps {
  context: "sell" | "admin";
  mode: "OPENING" | "LIVE";
}

interface ProductHistoryItem {
  id: string;
  title: string;
  date: string;
  quantity?: number;
  amount?: number;
  description?: string;
}

export default function InventoryPage({
  context,
  mode,
}: InventoryPageProps) {
  const app = useApplication();
  const router = useRouter();

  const {
    businessId,
    branchId,
    setBranchId,
    loading: ctxLoading,
  } = useBusinessContext();

  const { data, loading } = useLiveProducts(branchId);
  const products = data;

  const branches = useBranchStore((s) => s.branches);

  /*
   * -----------------------------
   * UI STATE
   * -----------------------------
   */

  const [selectedProduct, setSelectedProduct] =
    useState<LiveProduct | null>(null);

  const [loader, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [history, setHistory] = useState<ProductHistoryItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  type ActiveSheet =
    | null
    | "create"
    | "manage"
    | "edit"
    | "receive"
    | "adjust"
    | "transfer"
    | "history";

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  /*
   * -----------------------------
   * CART
   * -----------------------------
   */

  const cartItems = useCartStore((state) => state.items);
  const cartStore = useCartStore();

  const cartQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /*
   * -----------------------------
   * CATEGORIES
   * -----------------------------
   */

  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category || "Uncategorized")
    );
    return ["All", ...Array.from(set)];
  }, [products]);

  /*
   * -----------------------------
   * FILTER
   * -----------------------------
   */

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

  /*
   * -----------------------------
   * PRODUCT ACTIONS
   * -----------------------------
   */

  const openCreate = () => {
    setActiveSheet("create");
    setSelectedProduct(null);
  };

  const openEdit = (product: LiveProduct) => {
    setActiveSheet("edit");
    setSelectedProduct(product);
  };

  const openManage = (product: LiveProduct) => {
    setActiveSheet("manage");
    setSelectedProduct(product);
  };

  const handleDelete = async (productId: string) => {
    try {
      await app.product.delete({
        aggregateType: AggregateType.PRODUCT,
        aggregateId: productId,
        type:
          mode === "OPENING"
            ? OpeningEventType.OPENING_INVENTORY_DELETED
            : InventoryEventType.PRODUCT_DELETED,
        mode,
        payload: { productId },
      });
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /*
   * -----------------------------
   * ADD TO CART
   * -----------------------------
   */

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = cartItems.find((item) => item.productId === productId);
    const currentQuantity = existing?.quantity ?? 0;

    if (currentQuantity + quantity > product.quantity) {
      toast.error(`Only ${product.quantity} available`);
      return;
    }

    cartStore.addItem({
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      costPrice: product.costPrice,
    });

    setCartOpen(true);
  };

  /*
   * -----------------------------
   * CHANGE CART QUANTITY
   * -----------------------------
   */

  const handleChangeCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      cartStore.removeItem(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} available`);
      return;
    }

    cartStore.updateQty(productId, quantity);
  };

  /*
   * -----------------------------
   * QUICK SELL
   * -----------------------------
   */

  const handleQuickSell = async (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity > product.quantity) {
      toast.error("Insufficient stock");
      return;
    }

    try {
      setLoading(true);

      await app.sales.createSale({
        aggregateType: AggregateType.SALE,
        aggregateId: productId,
        type: salesEventType.SALE_ADDED,
        mode,
        payload: {
          productId,
          quantity,
          amount: product.price * quantity,
          costPrice: product.costPrice * quantity,
          unitCostPrice: product.costPrice,
          unitPrice: product.price
        },
      });

      toast.success("Sale completed");
    } catch (error) {
      console.error(error);
      toast.error("Sale failed");
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------
   * CHECKOUT CART
   * -----------------------------
   */

  const handleCheckout = async () => {
    if (!cartItems.length) return;

    try {
      setLoading(true);

      for (const item of cartItems) {
        await app.sales.createSale({
          aggregateType: AggregateType.SALE,
          aggregateId: item.productId,
          type: salesEventType.SALE_ADDED,
          mode: "LIVE",
          payload: {
            productId: item.productId,
            quantity: item.quantity,
            amount: item.price * item.quantity,
            costPrice: item.costPrice * item.quantity,
          },
        });
      }

      cartStore.clear();
      setCartOpen(false);
      toast.success("Sale completed");
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------
   * INVENTORY ACTIONS
   * -----------------------------
   */

  const handleReceiveStock = async (
    quantity: number,
    costPrice?: number,
    note?: string
  ) => {
    
    const key = inventoryKey(selectedProduct.id, branchId)
    await app.inventory.receiveStock({
      aggregateId: key,
      mode,
      payload: {
        productId: selectedProduct.id,
        quantity,
        costPrice,
        note,
      },
    });

    toast.success("Stock received");
    setActiveSheet(null);
  };

  const handleAdjustStock = async (
    direction: "increase" | "decrease",
    quantity: number,
    reason: string
  ) => {
    if (!selectedProduct || !branchId) return;

    const key = inventoryKey(selectedProduct.id, branchId);

    await app.inventory.adjust({
      aggregateId: key,
      mode,
      payload: {
        productId: selectedProduct.id,
        costPrice: selectedProduct.costPrice,
        direction,
        quantity,
        reason,
      },
    });

    toast.success("Inventory adjusted");
    setActiveSheet(null);
  };

  const handleTransferStock = async (
    targetBranchId: string,
    quantity: number,
    note?: string
  ) => {
    if (!selectedProduct || !branchId) return;

    const key = inventoryKey(selectedProduct.id, branchId);

    await app.inventory.transfer({
      aggregateId: key,
      mode,
      payload: {
        productId: selectedProduct.id,
        targetBranchId,
        quantity,
        note,
      },
    });

    toast.success("Stock transferred");
    setActiveSheet(null);
  };

  /*
   * -----------------------------
   * CREATE / EDIT PRODUCT
   * -----------------------------
   */

  const handleSubmit = async (data: {
    name: string;
    price: number;
    cost: number;
    quantity: number;
  }) => {
    try {
      setLoading(true);

      const productId = crypto.randomUUID();
      const inventoryId = inventoryKey(productId, branchId);

      console.log("This is inventoryId to be used: ", inventoryId)

      if (activeSheet === "create") {
        await app.product.create({
          id: productId,
          name: data.name,
          price: data.price,
          costPrice: data.cost,
          mode,
        });

        await app.inventory.createStock({
          id: inventoryId,
          productId,
          quantity: data.quantity,
          costPrice: data.cost,
          mode,
        });

        toast.success("Product created");
      }

      setActiveSheet(null);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------
   * UI
   * -----------------------------
   */

  return (
    <div className="min-h-screen pb-32 bg-neutral-950 text-white">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-4">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <LayoutGrid className="w-4 h-4" />
              </GlassIcon>
              {context === "sell" ? "Quick Sell" : "Inventory"}
            </h1>

            <div className="flex items-center gap-2">
              {/* Cart icon – only in sell mode */}
              {context === "sell" && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  <ShoppingCart className="w-5 h-5" />

                  {cartQuantity > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1 text-[10px] font-bold text-white">
                      {cartQuantity > 99 ? "99+" : cartQuantity}
                    </span>
                  )}
                </button>
              )}

              <GlassButton variant="secondary" onClick={() => router.replace("/projection")}>
                Projections
              </GlassButton>
            </div>
          </div>

          {/* Search */}
          <GlassInput
            icon={<Search className="w-4 h-4" />}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap border",
                  activeCategory === cat
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                    : "bg-white/[0.04] text-gray-400 border-white/10 hover:bg-white/[0.08] hover:text-gray-200"
                )}
              >
                <Package className="w-3.5 h-3.5" />
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PRODUCT GRID ================= */}
      <div className="px-3 pt-4 pb-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <GlassIcon size="lg" variant="primary">
              <Package className="w-6 h-6" />
            </GlassIcon>
            <p className="mt-4 text-sm">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) =>
              context === "sell" ? (
                <SellCard
                  key={product.id}
                  product={product}
                  cartQuantity={
                    cartItems.find((item) => item.productId === product.id)
                      ?.quantity ?? 0
                  }
                  disabled={loader}
                  onAddToCart={handleAddToCart}
                  onChangeCartQuantity={handleChangeCartQuantity}
                  onQuickSell={handleQuickSell}
                />
              ) : (
                <ProductCard
                  key={product.id}
                  product={product}
                  context={context}
                  onManage={openManage}
                  onDelete={handleDelete}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ================= MOBILE CART BAR ================= */}
      {context === "sell" && cartItems.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-50">
          <GlassCard
            variant="elevated"
            className="overflow-hidden border-white/15"
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-full px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition"
            >
              <GlassIcon size="sm" variant="primary">
                <ShoppingCart className="w-4 h-4" />
              </GlassIcon>

              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-white">
                  {cartQuantity} {cartQuantity === 1 ? "item" : "items"}
                </div>
                <div className="text-xs text-gray-400">Tap to view cart</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-teal-300">
                  ₦{cartTotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500">Checkout →</div>
              </div>
            </button>
          </GlassCard>
        </div>
      )}

      {/* ================= CART SHEET ================= */}
      {context === "sell" && (
        <GlassSheet
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          title="Current Sale"
          subtitle={`${cartQuantity} ${
            cartQuantity === 1 ? "item" : "items"
          } · ${cartItems.length} products`}
          size="lg"
          loading={loader}
          footer={
            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm px-1">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-200">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-emerald-400">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              <GlassButton
                variant="success"
                disabled={loader || !cartItems.length}
                onClick={handleCheckout}
                className="w-full h-12"
                icon={<CreditCard className="w-5 h-5" />}
              >
                {loader
                  ? "Processing..."
                  : `Checkout · ₦${cartTotal.toLocaleString()}`}
              </GlassButton>

              <button
                type="button"
                onClick={() => cartStore.clear()}
                className="w-full text-xs text-red-400/80 hover:text-red-400 py-1 transition"
              >
                Clear cart
              </button>
            </div>
          }
        >
          <div className="space-y-2.5">
            {cartItems.map((item) => (
              <GlassCard
                key={item.productId}
                variant="default"
                className="p-3.5 border-white/10"
              >
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ₦{item.price.toLocaleString()} each
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => cartStore.removeItem(item.productId)}
                    className="text-gray-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3.5">
                  {/* Quantity controls */}
                  <div className="flex items-center rounded-xl border border-white/10 overflow-hidden bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() =>
                        handleChangeCartQuantity(
                          item.productId,
                          item.quantity - 1
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/5 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-10 text-center text-sm font-bold text-white">
                      {item.quantity}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleChangeCartQuantity(
                          item.productId,
                          item.quantity + 1
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/5 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="font-bold text-sm text-teal-300">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassSheet>
      )}

      {/* ================= ADMIN FAB ================= */}
      {context === "admin" && (
        <GlassButton
          onClick={openCreate}
          className="fixed right-4 bottom-[90px] !p-0 w-14 h-14 rounded-2xl shadow-lg shadow-teal-500/20"
          icon={<Plus className="w-6 h-6" />}
        />
      )}

      {/* ================= PRODUCT SHEET ================= */}
      <ProductSheet
        open={activeSheet === "create" || activeSheet === "edit"}
        mode={activeSheet === "create" ? "create" : "edit"}
        initialData={selectedProduct}
        loading={loading}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleSubmit}
      />

      {/* ================= MANAGEMENT ================= */}
      <ProductDetailsSheet
        open={activeSheet === "manage"}
        onclose={() => setActiveSheet(null)}
        product={selectedProduct}
        onEditDetails={() => {
          if (!selectedProduct) return;
          setActiveSheet("edit");
        }}
        onReceiveStock={() => setActiveSheet("receive")}
        onAdjustStock={() => setActiveSheet("adjust")}
        onTransferStock={() => setActiveSheet("transfer")}
        onViewHistory={() => setActiveSheet("history")}
      />

      {/* ================= RECEIVE ================= */}
      <ReceiveStockSheet
        open={activeSheet === "receive"}
        product={selectedProduct}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleReceiveStock}
      />

      {/* ================= ADJUST ================= */}
      <AdjustStockSheet
        open={activeSheet === "adjust"}
        product={selectedProduct}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleAdjustStock}
      />

      {/* ================= TRANSFER ================= */}
      <TransferStockSheet
        open={activeSheet === "transfer"}
        product={selectedProduct}
        branches={branches}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleTransferStock}
      />

      {/* ================= HISTORY ================= */}
      <ProductHistorySheet
        open={activeSheet === "history"}
        product={selectedProduct}
        history={history}
        onClose={() => setActiveSheet(null)}
      />
    </div>
  );
}