// InventoryPage.tsx

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

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
import ProductImportSheet, {
  type PreparedProductImport,
  type ProductImportResult,
  type ProductImportProgressUpdate,
  type ProductImportValidation,
} from "./dialogs/ProductImportSheet";
import type{ ProductImportMapping } from "./import/ImportMappingStep";

import SellCard from "./cards/SellCard";

import { useCartStore } from "../../Biztru/store/useCartStore";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBranchStore } from "../../Biztru/store/useBranchStore";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import { useLiveProducts } from "../../hooks/useLiveProducts";

import { inventoryKey } from "../../Biztru/utils/keygenerator";

import type {
  ProductImportRow,
  ValidatedProductImportRow,
} from "@business/shared-types";

import type {
  LiveProduct,
} from "../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

import { salesEventType } from "@business/shared-types";

import { GlassButton } from "../ui/GlassButton";
import { GlassCard } from "../ui/GlassCard";
import { GlassInput } from "../ui/GlassInput";
import { GlassSheet } from "../ui/GlassSheet";
import { GlassIcon } from "../ui/GlassIcon";

import { cn } from "../../lib/utils";

/* ============================================================
   CONTRACTS
   ============================================================ */

type InventoryMode = "OPENING" | "LIVE";

type InventoryContext = "sell" | "admin";

type ActiveSheet =
  | null
  | "create"
  | "manage"
  | "edit"
  | "receive"
  | "adjust"
  | "transfer"
  | "history";

interface ProductHistoryItem {
  id: string;
  title: string;
  date: string;
  quantity?: number;
  amount?: number;
  description?: string;
}

interface ProductFormData {
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

interface InventoryPageProps {
  context: InventoryContext;
  mode: InventoryMode;

  /**
   * Inject the existing file parser/preparation service.
   * Its source must be ProductImportSource, not string.
   */
  prepareProductImportFile: (
    file: File,
  ) => Promise<PreparedProductImport>;

  /**
   * Inject the canonical product-import validator.
   */
  validateProductImportRows: (args: {
    rows: ProductImportRow[];
    mapping: ProductImportMapping;
    source: PreparedProductImport["source"];
  }) => ProductImportValidation;

  /**
   * Inject the application-level import service.
   * This service owns persistence, idempotency, and partial-failure
   * reconciliation. Do not write directly to SQLite from this page.
   */
  executeProductImport: (
    args: {
      branchId: string;
      mode: InventoryMode;
      rows: ValidatedProductImportRow[];
    },
    onProgress?: (update: ProductImportProgressUpdate) => void,
  ) => Promise<ProductImportResult>;
}

/* ============================================================
   HELPERS
   ============================================================ */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function isPositiveQuantity(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function isValidMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function InventoryPage({
  context,
  mode,
  prepareProductImportFile,
  validateProductImportRows,
  executeProductImport,
}: InventoryPageProps) {
  const app = useApplication();
  const { branchId } = useBusinessContext();

  const { data, loading: productsLoading } =
    useLiveProducts(branchId);

  const products = data ?? [];

  const branches = useBranchStore(
    (state) => state.branches,
  );

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [selectedProduct, setSelectedProduct] =
    useState<LiveProduct | null>(null);

  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [history] = useState<ProductHistoryItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);
  const [productImportOpen, setProductImportOpen] =
    useState(false);

  const [activeSheet, setActiveSheet] =
    useState<ActiveSheet>(null);

  // React state alone does not synchronously prevent double-clicks.
  const actionInProgressRef = useRef(false);

  const runExclusiveAction = useCallback(
    async <T,>(
      action: () => Promise<T>,
    ): Promise<T | undefined> => {
      if (actionInProgressRef.current) {
        return undefined;
      }

      actionInProgressRef.current = true;
      setLoader(true);

      try {
        return await action();
      } finally {
        actionInProgressRef.current = false;
        setLoader(false);
      }
    },
    [],
  );

  const requireBranchId = useCallback((): string => {
    if (!branchId) {
      throw new Error(
        "Select an active branch before performing this operation.",
      );
    }

    return branchId;
  }, [branchId]);

  /* ==========================================================
     CART
     ========================================================== */

  const cartItems = useCartStore(
    (state) => state.items,
  );

  const cartStore = useCartStore();

  const cartQuantity = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  /* ==========================================================
     CATEGORIES AND FILTERING
     ========================================================== */

  const categories = useMemo(() => {
    const categorySet = new Set(
      products.map(
        (product) =>
          product.category?.trim() || "Uncategorized",
      ),
    );

    return ["All", ...Array.from(categorySet).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch);

      const matchCategory =
        activeCategory === "All" ||
        (product.category?.trim() || "Uncategorized") ===
          activeCategory;

      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  /* ==========================================================
     PRODUCT SHEET ACTIONS
     ========================================================== */

  const openCreate = useCallback(() => {
    setSelectedProduct(null);
    setActiveSheet("create");
  }, []);

  const openManage = useCallback(
    (product: LiveProduct) => {
      setSelectedProduct(product);
      setActiveSheet("manage");
    },
    [],
  );

  const handleDelete = useCallback(
    async (_productId: string) => {
      // Do not display success or mutate local state until a
      // real delete command exists in the application service.
      toast.error(
        "Product deletion is not connected to the application service.",
      );
    },
    [],
  );

  /* ==========================================================
     ADD TO CART
     ========================================================== */

  const handleAddToCart = useCallback(
    (productId: string, quantity: number) => {
      if (!isPositiveQuantity(quantity)) {
        toast.error("Enter a valid quantity.");
        return;
      }

      const product = products.find(
        (item) => item.id === productId,
      );

      if (!product) {
        toast.error("Product is no longer available.");
        return;
      }

      if (!Number.isFinite(product.quantity)) {
        toast.error("The product stock quantity is invalid.");
        return;
      }

      const existing = cartItems.find(
        (item) => item.productId === productId,
      );

      const currentQuantity = existing?.quantity ?? 0;
      const requestedQuantity = currentQuantity + quantity;

      if (requestedQuantity > product.quantity) {
        toast.error(
          `Only ${product.quantity} units are currently available.`,
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
    [products, cartItems, cartStore],
  );

  /* ==========================================================
     CHANGE CART QUANTITY
     ========================================================== */

  const handleChangeCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) {
        toast.error("Enter a valid quantity.");
        return;
      }

      if (quantity <= 0) {
        cartStore.removeItem(productId);
        return;
      }

      const product = products.find(
        (item) => item.id === productId,
      );

      if (!product) {
        toast.error(
          "This product is no longer in the current inventory.",
        );
        return;
      }

      if (quantity > product.quantity) {
        toast.error(
          `Only ${product.quantity} units are currently available.`,
        );
        return;
      }

      cartStore.updateQty(productId, quantity);
    },
    [products, cartStore],
  );

  /* ==========================================================
     QUICK SELL
     ========================================================== */

  const handleQuickSell = useCallback(
    async (productId: string, quantity: number) => {
      if (!isPositiveQuantity(quantity)) {
        toast.error("Enter a valid sale quantity.");
        return;
      }

      const product = products.find(
        (item) => item.id === productId,
      );

      if (!product) {
        toast.error("Product is no longer available.");
        return;
      }

      if (
        !isValidMoney(product.price) ||
        !isValidMoney(product.costPrice)
      ) {
        toast.error("The product pricing is invalid.");
        return;
      }

      if (quantity > product.quantity) {
        toast.error("Insufficient stock.");
        return;
      }

      try {
        await runExclusiveAction(async () => {
          const activeBranchId = requireBranchId();

          await app.sales.createSale({
            type: salesEventType.SALE_ADDED,
            mode,
            payload: {
              productId: product.id,
              productName: product.name,
              quantity,
              amount: product.price * quantity,
              costPrice: product.costPrice * quantity,
              unitCostPrice: product.costPrice,
              unitPrice: product.price,
              // Include branchId here only if the existing event
              // payload contract explicitly supports this field.
            },
          });

          toast.success(
            `Sale completed for ${product.name}.`,
          );

          return activeBranchId;
        });
      } catch (error) {
        console.error("Quick sale failed:", error);

        toast.error(
          getErrorMessage(error, "Sale failed."),
        );
      }
    },
    [
      products,
      app.sales,
      mode,
      requireBranchId,
      runExclusiveAction,
    ],
  );

  /* ==========================================================
     CHECKOUT
     ========================================================== */

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Snapshot the current cart. Changes made during checkout
    // must not change the lines being processed by this action.
    const checkoutItems = cartItems.map((item) => ({
      ...item,
    }));

    for (const item of checkoutItems) {
      if (
        !isPositiveQuantity(item.quantity) ||
        !isValidMoney(item.price) ||
        !isValidMoney(item.costPrice)
      ) {
        toast.error(
          "The cart contains an invalid item or quantity.",
        );
        return;
      }

      const product = products.find(
        (candidate) => candidate.id === item.productId,
      );

      if (!product) {
        toast.error(
          `${item.name} is no longer available.`,
        );
        return;
      }

      if (item.quantity > product.quantity) {
        toast.error(
          `Insufficient stock for ${item.name}. Available: ${product.quantity}.`,
        );
        return;
      }
    }

    try {
      await runExclusiveAction(async () => {
        requireBranchId();

        /*
         * IMPORTANT:
         * This loop preserves your current sales API, but it is
         * not an atomic multi-line checkout. The sales service
         * must provide idempotency and partial-checkout recovery
         * to make retries safe if one line fails after earlier
         * lines have committed.
         */
        for (const item of checkoutItems) {
          await app.sales.createSale({
            type: salesEventType.SALE_ADDED,
            mode,
            payload: {
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              amount: item.price * item.quantity,
              costPrice: item.costPrice * item.quantity,
              unitCostPrice: item.costPrice,
              unitPrice: item.price,
            },
          });
        }

        cartStore.clear();
        setCartOpen(false);

        toast.success("Checkout completed.");
      });
    } catch (error) {
      console.error("Checkout failed:", error);

      toast.error(
        `${getErrorMessage(
          error,
          "Checkout failed.",
        )} The cart was preserved. Verify committed sales before retrying.`,
      );
    }
  }, [
    cartItems,
    products,
    app.sales,
    cartStore,
    mode,
    requireBranchId,
    runExclusiveAction,
  ]);

  /* ==========================================================
     RECEIVE STOCK
     ========================================================== */

  const handleReceiveStock = useCallback(
    async (
      quantity: number,
      costPrice: number,
      note?: string,
    ) => {
      if (!selectedProduct) {
        throw new Error("Select a product first.");
      }

      if (!isPositiveQuantity(quantity)) {
        throw new Error("Enter a valid stock quantity.");
      }

      if (!isValidMoney(costPrice)) {
        throw new Error("Enter a valid unit cost price.");
      }

      const activeBranchId = requireBranchId();

      const key = inventoryKey(
        selectedProduct.id,
        activeBranchId,
      );

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

      toast.success("Stock received.");
      setActiveSheet(null);
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
    ],
  );

  /* ==========================================================
     ADJUST STOCK
     ========================================================== */

  const handleAdjustStock = useCallback(
    async (
      direction: "increase" | "decrease",
      quantity: number,
      reason: string,
    ) => {
      if (!selectedProduct) {
        throw new Error("Select a product first.");
      }

      if (!isPositiveQuantity(quantity)) {
        throw new Error("Enter a valid adjustment quantity.");
      }

      if (!reason.trim()) {
        throw new Error("Provide a reason for the adjustment.");
      }

      const activeBranchId = requireBranchId();

      const key = inventoryKey(
        selectedProduct.id,
        activeBranchId,
      );

      await app.inventory.adjust({
        aggregateId: key,
        mode,
        payload: {
          productId: selectedProduct.id,
          costPrice: selectedProduct.costPrice,
          direction,
          quantity,
          reason: reason.trim(),
        },
      });

      toast.success("Inventory adjusted.");
      setActiveSheet(null);
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
    ],
  );

  /* ==========================================================
     TRANSFER STOCK
     ========================================================== */

  const handleTransferStock = useCallback(
    async (
      targetBranchId: string,
      quantity: number,
      note?: string,
    ) => {
      if (!selectedProduct) {
        throw new Error("Select a product first.");
      }

      if (!isPositiveQuantity(quantity)) {
        throw new Error("Enter a valid transfer quantity.");
      }

      const activeBranchId = requireBranchId();

      if (!targetBranchId.trim()) {
        throw new Error("Select a destination branch.");
      }

      if (targetBranchId === activeBranchId) {
        throw new Error(
          "The destination branch must differ from the source branch.",
        );
      }

      const key = inventoryKey(
        selectedProduct.id,
        activeBranchId,
      );

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

      toast.success("Stock transfer submitted.");
      setActiveSheet(null);
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
    ],
  );

  /* ==========================================================
     CREATE / EDIT PRODUCT
     ========================================================== */

  const handleSubmit = useCallback(
    async (data: ProductFormData) => {
      const name = data.name.trim();

      if (!name) {
        toast.error("Product name is required.");
        return;
      }

      if (
        !isValidMoney(data.price) ||
        !isValidMoney(data.cost)
      ) {
        toast.error("Enter valid product prices.");
        return;
      }

      if (
        !Number.isSafeInteger(data.quantity) ||
        data.quantity < 0
      ) {
        toast.error(
          "Initial stock must be a non-negative whole number.",
        );
        return;
      }

      try {
        await runExclusiveAction(async () => {
          const activeBranchId = requireBranchId();

          if (activeSheet === "edit") {
            /*
             * Do not report success for an edit that is not
             * connected to the product update command.
             */
            throw new Error(
              "Product editing is not connected to the update service yet.",
            );
          }

          if (activeSheet !== "create") {
            throw new Error(
              "The product form is not in create mode.",
            );
          }

          const productId = crypto.randomUUID();

          const inventoryId = inventoryKey(
            productId,
            activeBranchId,
          );

          /*
           * These are two separate service calls. For strict
           * consistency, provide a single application command
           * that creates the product and initial stock together,
           * or uses an idempotent saga/outbox workflow.
           */
          await app.product.create({
            id: productId,
            name,
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

          if (data.quantity > 0) {
            await app.inventory.createStock({
              id: inventoryId,
              productId,
              quantity: data.quantity,
              costPrice: data.cost,
              mode,
            });
          }

          toast.success("Product created.");
          setActiveSheet(null);
        });
      } catch (error) {
        console.error("Product save failed:", error);

        toast.error(
          getErrorMessage(error, "Unable to save product."),
        );
      }
    },
    [
      activeSheet,
      app.product,
      app.inventory,
      mode,
      requireBranchId,
      runExclusiveAction,
    ],
  );

  /* ==========================================================
     PRODUCT IMPORT
     ========================================================== */

  const handleProductImport = useCallback(
    async (
      rows: ValidatedProductImportRow[],
      onProgress?: (update: ProductImportProgressUpdate) => void,
    ): Promise<ProductImportResult> => {
      const activeBranchId = requireBranchId();

      if (rows.length === 0) {
        throw new Error("There are no validated rows to import.");
      }

      // Delegate all writes to the application-level service.
      // The service must enforce idempotency and report partial
      // failures accurately.
      return executeProductImport(
        {
          branchId: activeBranchId,
          mode,
          rows,
        },
        onProgress,
      );
    },
    [
      requireBranchId,
      executeProductImport,
      mode,
    ],
  );

  /* ==========================================================
     HEADER ACTIONS
     ========================================================== */

  const handleOpenImport = useCallback(() => {
    setProductImportOpen(true);
  }, []);

  const handleCloseImport = useCallback(() => {
    setProductImportOpen(false);
  }, []);

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="min-h-screen bg-neutral-950 pb-32 text-white">
      {/* HEADER */}

      <div
        className="
          sticky top-0 z-40
          border-b border-white/10
          bg-neutral-950/85 backdrop-blur-2xl
        "
      >
        <div className="space-y-4 px-4 pb-3 pt-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h1 className="flex min-w-0 items-center gap-2.5 text-xl font-semibold">
              <GlassIcon size="sm" variant="primary">
                <LayoutGrid className="h-4 w-4" />
              </GlassIcon>

              <span className="truncate">
                {context === "sell" ? "Quick Sell" : "Inventory"}
              </span>
            </h1>

            <div className="flex shrink-0 items-center gap-2">
              {context === "admin" && (
                <div className="hidden items-center gap-2 sm:flex">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={handleOpenImport}
                    className="h-10 px-3.5"
                    icon={<Upload className="h-4 w-4" />}
                  >
                    Import
                  </GlassButton>

                  <GlassButton
                    type="button"
                    onClick={openCreate}
                    className="h-10 px-3.5"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add product
                  </GlassButton>
                </div>
              )}

              {context === "sell" && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                  className="
                    relative flex h-10 w-10 shrink-0
                    items-center justify-center rounded-xl
                    border border-white/10 bg-white/5
                    transition hover:bg-white/10 active:scale-95
                  "
                >
                  <ShoppingCart className="h-5 w-5" />

                  {cartQuantity > 0 && (
                    <span
                      className="
                        absolute -right-1.5 -top-1.5
                        flex h-5 min-w-5 items-center
                        justify-center rounded-full bg-teal-500
                        px-1 text-[10px] font-bold text-white
                      "
                    >
                      {cartQuantity > 99 ? "99+" : cartQuantity}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          <GlassInput
            icon={<Search className="h-4 w-4" />}
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={cn(
                  `
                    flex shrink-0 items-center gap-1.5
                    whitespace-nowrap rounded-full border
                    px-4 py-2 text-sm transition-all
                  `,
                  activeCategory === category
                    ? `
                      border-teal-500/40 bg-teal-500/20
                      text-teal-300
                      shadow-[0_0_20px_rgba(20,184,166,0.15)]
                    `
                    : `
                      border-white/10 bg-white/4
                      text-gray-400 hover:bg-white/8
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

      {/* PRODUCT GRID */}

      <div className="px-3 pb-6 pt-4 sm:px-4 lg:px-6">
        {!branchId ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            Select a branch to view inventory.
          </div>
        ) : productsLoading ? (
          <div
            role="status"
            className="flex items-center justify-center py-24 text-gray-400"
          >
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <GlassIcon size="lg" variant="primary">
              <Package className="h-6 w-6" />
            </GlassIcon>

            <p className="mt-4 text-sm">
              {search.trim() || activeCategory !== "All"
                ? "No products match your filters."
                : "No products found."}
            </p>
          </div>
        ) : (
          <div
            className="
              grid grid-cols-1 gap-3
              sm:grid-cols-2 sm:gap-4
              lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5
            "
          >
            {filteredProducts.map((product) =>
              context === "sell" ? (
                <SellCard
                  key={product.id}
                  product={product}
                  cartQuantity={
                    cartItems.find(
                      (item) => item.productId === product.id,
                    )?.quantity ?? 0
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
              ),
            )}
          </div>
        )}
      </div>

      {/* MOBILE ADMIN ACTIONS */}

      {context === "admin" && (
        <div
          className="
            pointer-events-none fixed inset-x-0 bottom-0 z-40
            px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3
            sm:hidden
          "
        >
          <div className="flex justify-end">
            <div
              className="
                pointer-events-auto flex items-center gap-2
                rounded-2xl border border-white/10
                bg-neutral-950/90 p-1.5 shadow-2xl
                shadow-black/50 backdrop-blur-2xl
              "
            >
              <button
                type="button"
                onClick={handleOpenImport}
                aria-label="Import products"
                className="
                  flex h-12 w-12 shrink-0 items-center
                  justify-center rounded-xl border border-white/10
                  bg-white/5 text-white/80 transition
                  hover:bg-white/10 active:scale-95
                "
              >
                <Upload className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={openCreate}
                aria-label="Add product"
                className="
                  flex h-12 w-12 shrink-0 items-center
                  justify-center rounded-xl bg-teal-500
                  text-white shadow-lg shadow-teal-500/25
                  transition hover:bg-teal-400 active:scale-95
                "
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE CART BAR */}

      {context === "sell" && cartItems.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-50">
          <GlassCard
            variant="elevated"
            className="overflow-hidden border-white/15"
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="
                flex w-full items-center gap-3
                px-4 py-3.5 transition active:scale-[0.98]
              "
            >
              <GlassIcon size="sm" variant="primary">
                <ShoppingCart className="h-4 w-4" />
              </GlassIcon>

              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-white">
                  {cartQuantity} {cartQuantity === 1 ? "item" : "items"}
                </div>

                <div className="text-xs text-gray-400">
                  Tap to view cart
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-teal-300">
                  {formatNaira(cartTotal)}
                </div>

                <div className="text-[10px] text-gray-500">
                  Checkout →
                </div>
              </div>
            </button>
          </GlassCard>
        </div>
      )}

      {/* CART SHEET */}

      {context === "sell" && (
        <GlassSheet
          open={cartOpen}
          onClose={() => {
            if (!loader) setCartOpen(false);
          }}
          title="Current Sale"
          subtitle={`${cartQuantity} ${
            cartQuantity === 1 ? "item" : "items"
          } · ${cartItems.length} products`}
          size="lg"
          className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-3xl"
          loading={loader}
          footer={
            <div className="w-full space-y-3">
              <div className="flex justify-between px-1 text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-200">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <GlassButton
                variant="success"
                disabled={loader || cartItems.length === 0}
                onClick={handleCheckout}
                className="h-12 w-full"
                icon={<CreditCard className="h-5 w-5" />}
              >
                {loader
                  ? "Processing..."
                  : `Checkout · ${formatNaira(cartTotal)}`}
              </GlassButton>

              <button
                type="button"
                disabled={loader}
                onClick={() => cartStore.clear()}
                className="
                  w-full py-1 text-xs text-red-400/80
                  transition hover:text-red-400
                  disabled:cursor-not-allowed disabled:opacity-50
                "
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
                className="border-white/10 p-3.5"
              >
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {item.name}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {formatNaira(item.price)} each
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loader}
                    onClick={() =>
                      cartStore.removeItem(item.productId)
                    }
                    aria-label={`Remove ${item.name} from cart`}
                    className="
                      p-1 text-gray-500 transition
                      hover:text-red-400
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3.5 flex items-center justify-between">
                  <div
                    className="
                      flex items-center overflow-hidden
                      rounded-xl border border-white/10 bg-white/3
                    "
                  >
                    <button
                      type="button"
                      disabled={loader}
                      onClick={() =>
                        handleChangeCartQuantity(
                          item.productId,
                          item.quantity - 1,
                        )
                      }
                      aria-label={`Decrease ${item.name} quantity`}
                      className="
                        flex h-9 w-9 items-center justify-center
                        text-gray-300 transition hover:bg-white/5
                        disabled:opacity-50
                      "
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="w-10 text-center text-sm font-bold text-white">
                      {item.quantity}
                    </div>

                    <button
                      type="button"
                      disabled={loader}
                      onClick={() =>
                        handleChangeCartQuantity(
                          item.productId,
                          item.quantity + 1,
                        )
                      }
                      aria-label={`Increase ${item.name} quantity`}
                      className="
                        flex h-9 w-9 items-center justify-center
                        text-gray-300 transition hover:bg-white/5
                        disabled:opacity-50
                      "
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-sm font-bold text-teal-300">
                    {formatNaira(item.price * item.quantity)}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassSheet>
      )}

      {/* PRODUCT IMPORT */}

      <ProductImportSheet
        open={productImportOpen}
        onClose={handleCloseImport}
        prepareFile={prepareProductImportFile}
        validateRows={validateProductImportRows}
        onImport={handleProductImport}
        onViewProducts={() => setProductImportOpen(false)}
        onViewInventory={() => setProductImportOpen(false)}
      />

      {/* CREATE / EDIT PRODUCT */}

      <ProductSheet
        open={activeSheet === "create" || activeSheet === "edit"}
        mode={activeSheet === "create" ? "create" : "edit"}
        initialData={selectedProduct}
        loading={loader}
        onClose={() => {
          if (!loader) setActiveSheet(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* PRODUCT MANAGEMENT */}

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

      {/* RECEIVE STOCK */}

      <ReceiveStockSheet
        open={activeSheet === "receive"}
        product={selectedProduct}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleReceiveStock}
      />

      {/* ADJUST STOCK */}

      <AdjustStockSheet
        open={activeSheet === "adjust"}
        product={selectedProduct}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleAdjustStock}
      />

      {/* TRANSFER STOCK */}

      <TransferStockSheet
        open={activeSheet === "transfer"}
        product={selectedProduct}
        branches={branches}
        onClose={() => setActiveSheet(null)}
        onSubmit={handleTransferStock}
      />

      {/* PRODUCT HISTORY */}

      <ProductHistorySheet
        open={activeSheet === "history"}
        product={selectedProduct}
        history={history}
        onClose={() => setActiveSheet(null)}
      />
    </div>
  );
}
