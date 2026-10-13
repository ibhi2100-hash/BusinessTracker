import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Search,
  Plus,
  Upload,
  Package,
  LayoutGrid,
  ShoppingCart,
  Minus,
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
import ProductImportSheet from "./dialogs/ProductImportSheet";

import { useCartStore } from "../../Biztru/store/useCartStore";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";

import {
  salesEventType,
} from "@business/shared-types";

import type { ValidatedProductImportRow } from "@business/shared-types";
import SellCard from "./cards/SellCard";

import { GlassButton } from "../ui/GlassButton";
import { GlassCard } from "../ui/GlassCard";
import { GlassInput } from "../ui/GlassInput";
import { GlassSheet } from "../ui/GlassSheet";
import { GlassIcon } from "../ui/GlassIcon";

import { useBranchStore } from "../../Biztru/store/useBranchStore";
import { inventoryKey } from "../../Biztru/utils/keygenerator";
import { useLiveProducts } from "../../hooks/useLiveProducts";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import type {
  LiveProduct,
} from "../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

import { cn } from "../../lib/utils";

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

interface ProductImportResult {
  totalOperations: number;
  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;
}

export default function InventoryPage({
  context,
  mode,
}: InventoryPageProps) {
  const app = useApplication();

  const { branchId } = useBusinessContext();

  const { data, loading } = useLiveProducts(branchId);

  const products = data ?? [];

  const branches = useBranchStore(
    (state) => state.branches,
  );

  /*
   * -----------------------------
   * UI STATE
   * -----------------------------
   */

  const [selectedProduct, setSelectedProduct] =
    useState<LiveProduct | null>(null);

  const [loader, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<string>("All");

  const [history] =
    useState<ProductHistoryItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  const [productImportOpen, setProductImportOpen] =
    useState(false);

  type ActiveSheet =
    | null
    | "create"
    | "manage"
    | "edit"
    | "receive"
    | "adjust"
    | "transfer"
    | "history";

  const [activeSheet, setActiveSheet] =
    useState<ActiveSheet>(null);

  /*
   * -----------------------------
   * CART
   * -----------------------------
   */

  const cartItems = useCartStore(
    (state) => state.items,
  );

  const cartStore = useCartStore();

  const cartQuantity = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0,
    );
  }, [cartItems]);

  /*
   * -----------------------------
   * CATEGORIES
   * -----------------------------
   */

  const categories = useMemo(() => {
    const categorySet = new Set(
      products.map(
        (product) =>
          product.category || "Uncategorized",
      ),
    );

    return [
      "All",
      ...Array.from(categorySet),
    ];
  }, [products]);

  /*
   * -----------------------------
   * FILTER
   * -----------------------------
   */

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchCategory =
        activeCategory === "All" ||
        (product.category ||
          "Uncategorized") ===
          activeCategory;

      return matchSearch && matchCategory;
    });
  }, [
    products,
    search,
    activeCategory,
  ]);

  /*
   * -----------------------------
   * PRODUCT ACTIONS
   * -----------------------------
   */

  const openCreate = useCallback(() => {
    setActiveSheet("create");
    setSelectedProduct(null);
  }, []);

  const openManage = useCallback(
    (product: LiveProduct) => {
      setActiveSheet("manage");
      setSelectedProduct(product);
    },
    [],
  );

  const handleDelete = useCallback(
    async (productId: string) => {
      console.log(
        `Product : ${productId} is being deleted`,
      );
    },
    [],
  );

  /*
   * -----------------------------
   * ADD TO CART
   * -----------------------------
   */

  const handleAddToCart = useCallback(
    (
      productId: string,
      quantity: number,
    ) => {
      const product = products.find(
        (item) => item.id === productId,
      );

      if (!product) {
        return;
      }

      const existing = cartItems.find(
        (item) =>
          item.productId === productId,
      );

      const currentQuantity =
        existing?.quantity ?? 0;

      if (
        currentQuantity + quantity >
        product.quantity
      ) {
        toast.error(
          `Only ${product.quantity} available`,
        );
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
    },
    [
      products,
      cartItems,
      cartStore,
    ],
  );

  /*
   * -----------------------------
   * CHANGE CART QUANTITY
   * -----------------------------
   */

  const handleChangeCartQuantity =
    useCallback(
      (
        productId: string,
        quantity: number,
      ) => {
        if (quantity <= 0) {
          cartStore.removeItem(productId);
          return;
        }

        const product = products.find(
          (item) =>
            item.id === productId,
        );

        if (!product) {
          return;
        }

        if (quantity > product.quantity) {
          toast.error(
            `Only ${product.quantity} available`,
          );
          return;
        }

        cartStore.updateQty(
          productId,
          quantity,
        );
      },
      [products, cartStore],
    );

  /*
   * -----------------------------
   * QUICK SELL
   * -----------------------------
   */

  const handleQuickSell = useCallback(
    async (
      productId: string,
      quantity: number,
    ) => {
      const product = products.find(
        (item) =>
          item.id === productId,
      );

      if (!product) {
        return;
      }

      if (quantity > product.quantity) {
        toast.error(
          "Insufficient stock",
        );
        return;
      }

      try {
        setLoading(true);

        await app.sales.createSale({
          type: salesEventType.SALE_ADDED,
          mode,
          payload: {
            productId,
            productName: product.name,
            quantity,
            amount:
              product.price * quantity,
            costPrice:
              product.costPrice * quantity,
            unitCostPrice:
              product.costPrice,
            unitPrice:
              product.price,
          },
        });

        toast.success(
          "Sale completed",
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Sale failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      products,
      app.sales,
      mode,
    ],
  );

  /*
   * -----------------------------
   * CHECKOUT CART
   * -----------------------------
   */

  const handleCheckout = useCallback(
    async () => {
      if (!cartItems.length) {
        return;
      }

      try {
        setLoading(true);

        for (const item of cartItems) {
          await app.sales.createSale({
            type: salesEventType.SALE_ADDED,
            mode: "LIVE",
            payload: {
              productId:
                item.productId,
              productName:
                item.name,
              quantity:
                item.quantity,
              amount:
                item.price *
                item.quantity,
              costPrice:
                item.costPrice *
                item.quantity,
            },
          });
        }

        cartStore.clear();
        setCartOpen(false);

        toast.success(
          "Sale completed",
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Checkout failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      cartItems,
      app.sales,
      cartStore,
    ],
  );

  /*
   * -----------------------------
   * INVENTORY ACTIONS
   * -----------------------------
   */

  const handleReceiveStock =
    useCallback(
      async (
        quantity: number,
        costPrice: number,
        note?: string,
      ) => {
        if (!selectedProduct) {
          throw new Error(
            "Product now is null",
          );
        }

        const key = inventoryKey(
          selectedProduct.id,
          branchId,
        );

        await app.inventory.receiveStock({
          aggregateId: key,
          mode,
          payload: {
            productId:
              selectedProduct.id,
            quantity,
            costPrice,
            note,
          },
        });

        toast.success(
          "Stock received",
        );

        setActiveSheet(null);
      },
      [
        selectedProduct,
        branchId,
        app.inventory,
        mode,
      ],
    );

  const handleAdjustStock =
    useCallback(
      async (
        direction:
          | "increase"
          | "decrease",
        quantity: number,
        reason: string,
      ) => {
        if (
          !selectedProduct ||
          !branchId
        ) {
          return;
        }

        const key = inventoryKey(
          selectedProduct.id,
          branchId,
        );

        await app.inventory.adjust({
          aggregateId: key,
          mode,
          payload: {
            productId:
              selectedProduct.id,
            costPrice:
              selectedProduct.costPrice,
            direction,
            quantity,
            reason,
          },
        });

        toast.success(
          "Inventory adjusted",
        );

        setActiveSheet(null);
      },
      [
        selectedProduct,
        branchId,
        app.inventory,
        mode,
      ],
    );

  const handleTransferStock =
    useCallback(
      async (
        targetBranchId: string,
        quantity: number,
        note?: string,
      ) => {
        if (
          !selectedProduct ||
          !branchId
        ) {
          return;
        }

        const key = inventoryKey(
          selectedProduct.id,
          branchId,
        );

        await app.inventory.transfer({
          aggregateId: key,
          mode,
          payload: {
            productId:
              selectedProduct.id,
            targetBranchId,
            quantity,
            note,
          },
        });

        toast.success(
          "Stock transferred",
        );

        setActiveSheet(null);
      },
      [
        selectedProduct,
        branchId,
        app.inventory,
        mode,
      ],
    );

  /*
   * -----------------------------
   * CREATE / EDIT PRODUCT
   * -----------------------------
   */

  const handleSubmit = useCallback(
    async (data: {
      name: string;
      price: number;
      cost: number;
      quantity: number;
    }) => {
      try {
        setLoading(true);

        const productId =
          crypto.randomUUID();

        const inventoryId =
          inventoryKey(
            productId,
            branchId,
          );

        if (
          activeSheet === "create"
        ) {
          await app.product.create({
            id: productId,
            name: data.name,
            price: data.price,
            costPrice: data.cost,
            description: null,
            sku: null,
            barcode: null,
            reorderLevel: null,
            imageUrl: null,
            category: null,
            mode,
          });

          await app.inventory.createStock({
            id: inventoryId,
            productId,
            quantity: data.quantity,
            costPrice: data.cost,
            mode,
          });

          toast.success(
            "Product created",
          );
        }

        setActiveSheet(null);
      } catch (error) {
        console.error(error);

        toast.error(
          "Operation failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      activeSheet,
      app.product,
      app.inventory,
      branchId,
      mode,
    ],
  );

  /*
   * -----------------------------
   * PRODUCT IMPORT
   * -----------------------------
   *
   * This is deliberately kept as an
   * application boundary.
   *
   * The import sheet prepares and validates
   * the catalogue. The actual command/event
   * execution should be provided by the
   * ProductImportService rather than making
   * the UI directly manipulate SQLite.
   */

  const handleProductImport =
    useCallback(
      async (
        rows: ValidatedProductImportRow[],
      ): Promise<ProductImportResult> => {
        /*
         * TODO:
         *
         * Replace this boundary with:
         *
         * app.productImport.execute({
         *   branchId,
         *   mode,
         *   rows,
         * });
         *
         * once ProductImportService is connected
         * to ProductApi / InventoryApi.
         *
         * Do NOT write directly to SQLite here.
         */

        console.log(
          "Approved product import:",
          rows,
        );

        throw new Error(
          "Product import service is not connected yet.",
        );
      },
      [],
    );

  /*
   * -----------------------------
   * HEADER ACTIONS
   * -----------------------------
   */

  const handleOpenImport =
    useCallback(() => {
      setProductImportOpen(true);
    }, []);

  const handleCloseImport =
    useCallback(() => {
      setProductImportOpen(false);
    }, []);

  /*
   * -----------------------------
   * UI
   * -----------------------------
   */

  return (
    <div className="min-h-screen bg-neutral-950 pb-32 text-white">
      {/* ================= HEADER ================= */}

      <div
        className="
          sticky
          top-0
          z-40
          border-b
          border-white/10
          bg-neutral-950/85
          backdrop-blur-2xl
        "
      >
        <div className="space-y-4 px-4 pb-3 pt-4">
          {/* ================= TITLE ROW ================= */}

          <div className="flex min-w-0 items-center justify-between gap-3">
            <h1 className="flex min-w-0 items-center gap-2.5 text-xl font-semibold">
              <GlassIcon
                size="sm"
                variant="primary"
              >
                <LayoutGrid className="h-4 w-4" />
              </GlassIcon>

              <span className="truncate">
                {context === "sell"
                  ? "Quick Sell"
                  : "Inventory"}
              </span>
            </h1>

            <div className="flex shrink-0 items-center gap-2">
              {/* ================= DESKTOP ADMIN ACTIONS ================= */}

              {context === "admin" && (
                <div className="hidden items-center gap-2 sm:flex">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={
                      handleOpenImport
                    }
                    className="h-10 px-3.5"
                    icon={
                      <Upload className="h-4 w-4" />
                    }
                  >
                    Import
                  </GlassButton>

                  <GlassButton
                    type="button"
                    onClick={openCreate}
                    className="h-10 px-3.5"
                    icon={
                      <Plus className="h-4 w-4" />
                    }
                  >
                    Add product
                  </GlassButton>
                </div>
              )}

              {/* ================= SELL CART ================= */}

              {context === "sell" && (
                <button
                  type="button"
                  onClick={() =>
                    setCartOpen(true)
                  }
                  aria-label="Open cart"
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    transition
                    hover:bg-white/10
                    active:scale-95
                  "
                >
                  <ShoppingCart className="h-5 w-5" />

                  {cartQuantity > 0 && (
                    <span
                      className="
                        absolute
                        -right-1.5
                        -top-1.5
                        flex
                        h-5
                        min-w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-teal-500
                        px-1
                        text-[10px]
                        font-bold
                        text-white
                      "
                    >
                      {cartQuantity > 99
                        ? "99+"
                        : cartQuantity}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ================= SEARCH ================= */}

          <GlassInput
            icon={
              <Search className="h-4 w-4" />
            }
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />

          {/* ================= CATEGORIES ================= */}

          <div
            className="
              no-scrollbar
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category,
                  )
                }
                className={cn(
                  `
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    whitespace-nowrap
                    transition-all
                  `,
                  activeCategory ===
                    category
                    ? `
                      border-teal-500/40
                      bg-teal-500/20
                      text-teal-300
                      shadow-[0_0_20px_rgba(20,184,166,0.15)]
                    `
                    : `
                      border-white/10
                      bg-white/4
                      text-gray-400
                      hover:bg-white/8
                      hover:text-gray-200
                    `,
                )}
              >
                <Package className="h-3.5 w-3.5" />

                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= PRODUCT GRID ================= */}

      <div className="px-3 pb-6 pt-4 sm:px-4 lg:px-6">
        {!branchId || loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            {branchId ? "Loading products..." : "Loading branch..."}
          </div>
        )
        : filteredProducts.length ===
        0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <GlassIcon
              size="lg"
              variant="primary"
            >
              <Package className="h-6 w-6" />
            </GlassIcon>

            <p className="mt-4 text-sm">
              No products found
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              sm:gap-4
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {filteredProducts.map(
              (product) =>
                context === "sell" ? (
                  <SellCard
                    key={product.id}
                    product={product}
                    cartQuantity={
                      cartItems.find(
                        (item) =>
                          item.productId ===
                          product.id,
                      )?.quantity ?? 0
                    }
                    disabled={loader}
                    onAddToCart={
                      handleAddToCart
                    }
                    onChangeCartQuantity={
                      handleChangeCartQuantity
                    }
                    onQuickSell={
                      handleQuickSell
                    }
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    context={context}
                    onManage={
                      openManage
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                ),
            )}
          </div>
        )}
      </div>

      {/* ================= MOBILE ADMIN ACTIONS ================= */}

      {context === "admin" && (
        <div
          className="
            pointer-events-none
            fixed
            inset-x-0
            bottom-0
            z-40
            px-4
            pb-[max(1rem,env(safe-area-inset-bottom))]
            pt-3
            sm:hidden
          "
        >
          <div className="flex justify-end">
            <div
              className="
                pointer-events-auto
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-neutral-950/90
                p-1.5
                shadow-2xl
                shadow-black/50
                backdrop-blur-2xl
              "
            >
              {/* ================= MOBILE IMPORT ================= */}

              <button
                type="button"
                onClick={
                  handleOpenImport
                }
                aria-label="Import products"
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  text-white/80
                  transition
                  hover:bg-white/10
                  active:scale-95
                "
              >
                <Upload className="h-5 w-5" />
              </button>

              {/* ================= MOBILE ADD ================= */}

              <button
                type="button"
                onClick={openCreate}
                aria-label="Add product"
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-teal-500
                  text-white
                  shadow-lg
                  shadow-teal-500/25
                  transition
                  hover:bg-teal-400
                  active:scale-95
                "
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE CART BAR ================= */}

      {context === "sell" &&
        cartItems.length > 0 && (
          <div
            className="
              fixed
              bottom-4
              left-3
              right-3
              z-50
            "
          >
            <GlassCard
              variant="elevated"
              className="
                overflow-hidden
                border-white/15
              "
            >
              <button
                type="button"
                onClick={() =>
                  setCartOpen(true)
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  px-4
                  py-3.5
                  transition
                  active:scale-[0.98]
                "
              >
                <GlassIcon
                  size="sm"
                  variant="primary"
                >
                  <ShoppingCart className="h-4 w-4" />
                </GlassIcon>

                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-white">
                    {cartQuantity}{" "}
                    {cartQuantity === 1
                      ? "item"
                      : "items"}
                  </div>

                  <div className="text-xs text-gray-400">
                    Tap to view cart
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-teal-300">
                    ₦
                    {cartTotal.toLocaleString()}
                  </div>

                  <div className="text-[10px] text-gray-500">
                    Checkout →
                  </div>
                </div>
              </button>
            </GlassCard>
          </div>
        )}

      {/* ================= CART SHEET ================= */}

      {context === "sell" && (
        <GlassSheet
          open={cartOpen}
          onClose={() =>
            setCartOpen(false)
          }
          title="Current Sale"
          subtitle={`${cartQuantity} ${
            cartQuantity === 1
              ? "item"
              : "items"
          } · ${
            cartItems.length
          } products`}
          size="lg"
          className="
            w-full
            sm:max-w-xl
            lg:max-w-2xl
            xl:max-w-3xl
          "
          loading={loader}
          footer={
            <div className="w-full space-y-3">
              <div className="flex justify-between px-1 text-sm">
                <span className="text-gray-400">
                  Subtotal
                </span>

                <span className="text-gray-200">
                  ₦
                  {cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-white">
                  Total
                </span>

                <span className="text-2xl font-bold text-emerald-400">
                  ₦
                  {cartTotal.toLocaleString()}
                </span>
              </div>

              <GlassButton
                variant="success"
                disabled={
                  loader ||
                  !cartItems.length
                }
                onClick={
                  handleCheckout
                }
                className="h-12 w-full"
                icon={
                  <CreditCard className="h-5 w-5" />
                }
              >
                {loader
                  ? "Processing..."
                  : `Checkout · ₦${cartTotal.toLocaleString()}`}
              </GlassButton>

              <button
                type="button"
                onClick={() =>
                  cartStore.clear()
                }
                className="
                  w-full
                  py-1
                  text-xs
                  text-red-400/80
                  transition
                  hover:text-red-400
                "
              >
                Clear cart
              </button>
            </div>
          }
        >
          <div className="space-y-2.5">
            {cartItems.map(
              (item) => (
                <GlassCard
                  key={item.productId}
                  variant="default"
                  className="
                    border-white/10
                    p-3.5
                  "
                >
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">
                        {item.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        ₦
                        {item.price.toLocaleString()}{" "}
                        each
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        cartStore.removeItem(
                          item.productId,
                        )
                      }
                      aria-label={`Remove ${item.name} from cart`}
                      className="
                        p-1
                        text-gray-500
                        transition
                        hover:text-red-400
                      "
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between">
                    {/* Quantity controls */}

                    <div
                      className="
                        flex
                        items-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-white/10
                        bg-white/3
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleChangeCartQuantity(
                            item.productId,
                            item.quantity - 1,
                          )
                        }
                        aria-label="Decrease quantity"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          text-gray-300
                          transition
                          hover:bg-white/5
                        "
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <div className="w-10 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleChangeCartQuantity(
                            item.productId,
                            item.quantity + 1,
                          )
                        }
                        aria-label="Increase quantity"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          text-gray-300
                          transition
                          hover:bg-white/5
                        "
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-sm font-bold text-teal-300">
                      ₦
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString()}
                    </div>
                  </div>
                </GlassCard>
              ),
            )}
          </div>
        </GlassSheet>
      )}

      {/* ================= PRODUCT IMPORT ================= */}

      <ProductImportSheet
        open={productImportOpen}
        onClose={
          handleCloseImport
        }
        onImport={
          handleProductImport
        }
        onViewProducts={() => {
          setProductImportOpen(
            false,
          );
        }}
        onViewInventory={() => {
          setProductImportOpen(
            false,
          );
        }}
      />

      {/* ================= PRODUCT SHEET ================= */}

      <ProductSheet
        open={
          activeSheet ===
            "create" ||
          activeSheet === "edit"
        }
        mode={
          activeSheet === "create"
            ? "create"
            : "edit"
        }
        initialData={
          selectedProduct
        }
        loading={loading}
        onClose={() =>
          setActiveSheet(null)
        }
        onSubmit={handleSubmit}
      />

      {/* ================= MANAGEMENT ================= */}

      <ProductDetailsSheet
        open={
          activeSheet === "manage"
        }
        onclose={() =>
          setActiveSheet(null)
        }
        product={
          selectedProduct
        }
        onEditDetails={() => {
          if (!selectedProduct) {
            return;
          }

          setActiveSheet("edit");
        }}
        onReceiveStock={() =>
          setActiveSheet("receive")
        }
        onAdjustStock={() =>
          setActiveSheet("adjust")
        }
        onTransferStock={() =>
          setActiveSheet("transfer")
        }
        onViewHistory={() =>
          setActiveSheet("history")
        }
      />

      {/* ================= RECEIVE ================= */}

      <ReceiveStockSheet
        open={
          activeSheet ===
          "receive"
        }
        product={
          selectedProduct
        }
        onClose={() =>
          setActiveSheet(null)
        }
        onSubmit={
          handleReceiveStock
        }
      />

      {/* ================= ADJUST ================= */}

      <AdjustStockSheet
        open={
          activeSheet ===
          "adjust"
        }
        product={
          selectedProduct
        }
        onClose={() =>
          setActiveSheet(null)
        }
        onSubmit={
          handleAdjustStock
        }
      />

      {/* ================= TRANSFER ================= */}

      <TransferStockSheet
        open={
          activeSheet ===
          "transfer"
        }
        product={
          selectedProduct
        }
        branches={branches}
        onClose={() =>
          setActiveSheet(null)
        }
        onSubmit={
          handleTransferStock
        }
      />

      {/* ================= HISTORY ================= */}

      <ProductHistorySheet
        open={
          activeSheet ===
          "history"
        }
        product={
          selectedProduct
        }
        history={history}
        onClose={() =>
          setActiveSheet(null)
        }
      />
    </div>
  );
}