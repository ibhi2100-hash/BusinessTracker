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
  ScanBarcode,
  ArrowUpRight,
  Barcode,
} from "lucide-react";
import {
  prepareProductImportFile,
  validateProductImportRows,
  executeProductImport,
} from "../../ingestion/ProductImportService";
import ProductCard from "./cards/ProductCard";
import ProductSheet, { type ProductFormData } from "./dialogs/ProductSheet";
import AdjustStockSheet from "./dialogs/AdjustStockSheet";
import ReceiveStockSheet from "./dialogs/ReceivedStockSheet";
import TransferStockSheet from "./dialogs/TransferStockSheet";
import ProductHistorySheet from "./dialogs/ProductHistorySheet";
import ProductDetailsSheet from "./dialogs/ProductsManagement";
import ProductImportSheet, {
  type ProductImportResult,
  type ProductImportProgressUpdate,
} from "./dialogs/ProductImportSheet";

import SellCard from "./cards/SellCard";
import BarcodeSellPanel from "./cards/BarcodeSellPanel";

import { useCartStore } from "../../Biztru/store/useCartStore";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBranchStore } from "../../Biztru/store/useBranchStore";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import { useLiveProducts } from "../../hooks/useLiveProducts";

import { inventoryKey } from "../../Biztru/utils/keygenerator";

import type {
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

interface InventoryPageProps {
  context: InventoryContext;
  mode: InventoryMode;

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

/**
 * Resolve and validate the effective unit selling price.
 * This is client-side input validation only. The sales command/domain
 * must remain the authoritative enforcement boundary for pricing policy.
 */
function resolveSellingPrice(
  benchmarkPrice: number,
  negotiatedPrice?: number,
): number {
  const price = negotiatedPrice ?? benchmarkPrice;

  if (!isValidMoney(price) || !Number.isSafeInteger(price) || price <= 0) {
    throw new Error("Enter a valid whole-naira selling price greater than zero.");
  }

  return price;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function InventoryPage({
  context,
  mode,
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


  const [barcodeLookup, setBarcodeLookup] = useState("");
const [barcodeLookupOpen, setBarcodeLookupOpen] = useState(false);
const [pendingBarcode, setPendingBarcode] = useState("");

const handleBarcodeLookup = useCallback(
  (rawBarcode: string) => {
    const barcode = rawBarcode.trim();

    if (!barcode) {
      toast.error("Enter or scan a product barcode.");
      return;
    }

    const existingProduct = products.find(
      (product) =>
        (product.barcode ?? "").trim().toLowerCase() ===
        barcode.toLowerCase()
    );

    setPendingBarcode(barcode);
    setBarcodeLookupOpen(false);

    if (existingProduct) {
      setSelectedProduct(existingProduct);
      setActiveSheet("manage");
      toast.success(`Found ${existingProduct.name}.`);
      return;
    }

    setSelectedProduct(null);
    setActiveSheet("create");

    toast.info(
      "Product not found. Enter its details to create it."
    );
  },
  [products]
);

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
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.barcode ?? "").toLowerCase().includes(normalizedSearch) ||
        (product.sku ?? "").toLowerCase().includes(normalizedSearch);

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
    (
      productId: string,
      quantity: number,
      openCart = true,
      negotiatedPrice?: number,
    ): boolean => {
      if (!isPositiveQuantity(quantity)) {
        toast.error("Enter a valid quantity.");
        return false;
      }

      if (!branchId) {
        toast.error("Select an active branch before adding products to a sale.");
        return false;
      }

      const product = products.find((item) => item.id === productId);
      if (!product) {
        toast.error("Product is no longer available.");
        return false;
      }

      if (!Number.isSafeInteger(product.quantity) || product.quantity < 0) {
        toast.error("The product stock quantity is invalid.");
        return false;
      }

      if (!isValidMoney(product.price) || product.price <= 0 ||
          !isValidMoney(product.costPrice)) {
        toast.error("The product pricing is invalid.");
        return false;
      }

      let actualSellingPrice: number;
      try {
        actualSellingPrice = resolveSellingPrice(product.price, negotiatedPrice);
      } catch (error) {
        toast.error(getErrorMessage(error, "Enter a valid selling price."));
        return false;
      }

      // A product may have multiple cart lines when the agreed unit prices differ.
      // Stock validation must therefore sum every line for this product.
      const currentProductQuantity = cartItems
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0);

      if (currentProductQuantity + quantity > product.quantity) {
        const remaining = Math.max(0, product.quantity - currentProductQuantity);
        toast.error(`Only ${remaining} more units can be added.`);
        return false;
      }

      cartStore.addItem({
        productId: product.id,
        name: product.name,
        quantity,
        price: actualSellingPrice,
        costPrice: product.costPrice,
      });

      if (openCart) setCartOpen(true);
      return true;
    },
    [branchId, products, cartItems, cartStore],
  );

  /* ==========================================================
     CHANGE / REMOVE CART LINE
     ========================================================== */

  const handleChangeCartQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) {
        toast.error("Enter a valid quantity.");
        return;
      }

      const line = cartItems.find((item) => item.lineId === lineId);
      if (!line) {
        toast.error("This cart line no longer exists.");
        return;
      }

      if (quantity <= 0) {
        cartStore.removeItem(lineId);
        return;
      }

      const product = products.find((item) => item.id === line.productId);
      if (!product) {
        toast.error("This product is no longer in the current inventory.");
        return;
      }

      if (!Number.isSafeInteger(product.quantity) || product.quantity < 0) {
        toast.error("The product stock quantity is invalid.");
        return;
      }

      const otherLinesQuantity = cartItems
        .filter((item) => item.productId === line.productId && item.lineId !== lineId)
        .reduce((total, item) => total + item.quantity, 0);

      const availableForThisLine = product.quantity - otherLinesQuantity;
      if (quantity > availableForThisLine) {
        toast.error(`Only ${Math.max(0, availableForThisLine)} units are available for this cart line.`);
        return;
      }

      cartStore.updateQty(lineId, quantity);
    },
    [cartItems, products, cartStore],
  );

  /* ==========================================================
     QUICK SELL
     ========================================================== */

  const handleQuickSell = useCallback(
    async (productId: string, quantity: number, negotiatedPrice?: number) => {
      if (!isPositiveQuantity(quantity)) {
        toast.error("Enter a valid sale quantity.");
        return;
      }

      const product = products.find((item) => item.id === productId);
      if (!product) {
        toast.error("Product is no longer available.");
        return;
      }

      if (!isValidMoney(product.price) || product.price <= 0 ||
          !isValidMoney(product.costPrice)) {
        toast.error("The product pricing is invalid.");
        return;
      }

      if (!Number.isSafeInteger(product.quantity) || product.quantity < 0) {
        toast.error("The product stock quantity is invalid.");
        return;
      }

      const alreadyInCart = cartItems
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + item.quantity, 0);
      if (alreadyInCart + quantity > product.quantity) {
        toast.error("Insufficient stock after accounting for the current cart.");
        return;
      }

      let actualSellingPrice: number;
      try {
        actualSellingPrice = resolveSellingPrice(product.price, negotiatedPrice);
      } catch (error) {
        toast.error(getErrorMessage(error, "Enter a valid selling price."));
        return;
      }

      try {
        await runExclusiveAction(async () => {
          const activeBranchId = requireBranchId();
          await app.sales.createSale({
            type: salesEventType.SALE_ADDED,
            mode,
            payload: {
              branchId: activeBranchId,
              productId: product.id,
              productName: product.name,
              quantity,
              amount: actualSellingPrice * quantity,
              costPrice: product.costPrice * quantity,
              unitCostPrice: product.costPrice,
              unitPrice: actualSellingPrice,
            },
          });
          toast.success(`Sale completed for ${product.name} at ${formatNaira(actualSellingPrice)} each.`);
        });
      } catch (error) {
        console.error("Quick sale failed:", error);
        toast.error(getErrorMessage(error, "Sale failed."));
      }
    },
    [products, cartItems, app.sales, mode, requireBranchId, runExclusiveAction],
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

    // Validate aggregate quantity per product, not each negotiated-price line
    // independently. Several lines can represent the same physical stock.
    const checkoutQuantityByProduct = new Map<string, number>();
    for (const item of checkoutItems) {
      checkoutQuantityByProduct.set(
        item.productId,
        (checkoutQuantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    for (const item of checkoutItems) {
      if (
        !isPositiveQuantity(item.quantity) ||
        !isValidMoney(item.price) ||
        item.price <= 0 ||
        !Number.isSafeInteger(item.price) ||
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

      if (!Number.isSafeInteger(product.quantity) || product.quantity < 0) {
        toast.error(`The stock quantity for ${item.name} is invalid.`);
        return;
      }

      const totalRequested = checkoutQuantityByProduct.get(item.productId) ?? 0;
      if (totalRequested > product.quantity) {
        toast.error(
          `Insufficient stock for ${item.name}. Requested: ${totalRequested}; available: ${product.quantity}.`,
        );
        return;
      }
    }

    try {
      await runExclusiveAction(async () => {
        const activeBranchId = requireBranchId();

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
              branchId: activeBranchId,
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
          if (!selectedProduct) {
            throw new Error("Select a product to edit.");
          }

          // Preserve the identity of the existing product.
          await app.product.update({
            id: selectedProduct.id,
            name,
            price: data.price,
            costPrice: data.cost,
            description: data.description || null,
            sku: data.sku || null,
            barcode: data.barcode || null,
            reorderLevel: data.reorderLevel,
            imageUrl: data.imageUrl || null,
            category: data.category || null,
            mode,
          });

          toast.success("Product updated.");
          setActiveSheet(null);
          return;
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
            description: data.description ?? null,
            sku:  data.sku ?? null,
            barcode: data.barcode ?? null,
            reorderLevel: data.reorderLevel ??  null,
            imageUrl: data.imageUrl ?? null,
            category: data.category ??  null,
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
      const branchId = requireBranchId();

      // Delegate all writes to the application-level service.
      // The service must enforce idempotency and report partial
      // failures accurately.
      return executeProductImport(
        app,
        {
          branchId,
          mode,
          rows,
        },
        onProgress,
      );
    },
    [
      app,
      mode,
      requireBranchId
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
<div className="min-h-screen bg-[#09090b] pb-28 text-white sm:pb-10">
      
{/* HEADER — iOS-inspired responsive command center */}

<header
  className="
    z-40
    border-b border-white/[0.08]
    bg-neutral-950/90
    backdrop-blur-2xl
    supports-[backdrop-filter]:bg-neutral-950/75
  "
>
  <div className="mx-auto max-w-[1800px] space-y-4 px-4 pb-4 pt-4 sm:px-6 sm:pt-6">

    {/* Title and primary actions */}

    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-[16px] border border-teal-300/15
            bg-gradient-to-br from-teal-400/20 to-teal-600/5
            shadow-inner shadow-white/[0.04]
          "
        >
          <LayoutGrid className="h-5 w-5 text-teal-300" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-semibold tracking-tight text-white sm:text-2xl">
            {context === "sell" ? "Quick Sell" : "Inventory"}
          </h1>

          <p className="mt-0.5 text-xs text-white/45">
            {context === "sell"
              ? `${products.length} products available`
              : `${products.length} products in your inventory`}
          </p>
        </div>
      </div>

      {context === "sell" && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
          className="
            relative flex h-11 w-11 shrink-0 items-center justify-center
            rounded-2xl border border-white/10 bg-white/[0.06]
            text-white transition-all
            hover:bg-white/10 active:scale-95
          "
        >
          <ShoppingCart className="h-5 w-5" />

          {cartQuantity > 0 && (
            <span
              className="
                absolute -right-1.5 -top-1.5 flex h-5 min-w-5
                items-center justify-center rounded-full
                bg-teal-400 px-1 text-[10px] font-bold text-neutral-950
              "
            >
              {cartQuantity > 99 ? "99+" : cartQuantity}
            </span>
          )}
        </button>
      )}
    </div>

    {/* Mobile product actions — positioned at the TOP */}

    {context === "admin" && (
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 sm:hidden">

        <button
          type="button"
          onClick={openCreate}
          className="
            flex h-[48px] min-w-0 items-center justify-center gap-2
            rounded-2xl bg-teal-400 px-3
            text-sm font-semibold text-neutral-950
            shadow-[0_4px_18px_rgba(45,212,191,0.16)]
            transition-all hover:bg-teal-300
            active:scale-[0.97]
          "
        >
          <Plus className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Add product</span>
        </button>

        <button
          type="button"
          onClick={() => setBarcodeLookupOpen(true)}
          aria-label="Scan or look up product barcode"
          title="Scan or look up product"
          className="
            flex h-[48px] w-[48px] items-center justify-center
            rounded-2xl border border-teal-300/20
            bg-teal-400/[0.10] text-teal-200
            transition-all hover:bg-teal-400/15
            active:scale-95
          "
        >
          <ScanBarcode className="h-[21px] w-[21px]" />
        </button>

        <button
          type="button"
          onClick={handleOpenImport}
          aria-label="Import products"
          title="Import products"
          className="
            flex h-[48px] w-[48px] items-center justify-center
            rounded-2xl border border-white/10
            bg-white/[0.06] text-white/80
            transition-all hover:bg-white/10
            active:scale-95
          "
        >
          <Upload className="h-[19px] w-[19px]" />
        </button>
      </div>
    )}

    {/* Desktop product actions */}

    {context === "admin" && (
      <div className="hidden items-center gap-2 sm:flex">
        <GlassButton
          type="button"
          variant="secondary"
          onClick={handleOpenImport}
          className="h-10 px-4"
          icon={<Upload className="h-4 w-4" />}
        >
          Import products
        </GlassButton>

        <GlassButton
          type="button"
          variant="secondary"
          onClick={() => setBarcodeLookupOpen(true)}
          className="h-10 px-4"
          icon={<ScanBarcode className="h-4 w-4" />}
        >
          Scan / Lookup
        </GlassButton>

        <GlassButton
          type="button"
          onClick={openCreate}
          className="h-10 px-4"
          icon={<Plus className="h-4 w-4" />}
        >
          Add product
        </GlassButton>
      </div>
    )}

    {/* Fast barcode lookup input */}

    {context === "admin" && (
      <form
        className="
          flex h-[46px] items-center gap-2 rounded-2xl
          border border-white/[0.09] bg-white/[0.035]
          p-1.5 transition-colors
          focus-within:border-teal-400/30
          focus-within:bg-white/[0.05]
        "
        onSubmit={(event) => {
          event.preventDefault();
          handleBarcodeLookup(barcodeLookup);
        }}
      >
        <Barcode className="ml-2 h-[18px] w-[18px] shrink-0 text-white/40" />

        <input
          type="text"
          value={barcodeLookup}
          onChange={(event) => setBarcodeLookup(event.target.value)}
          placeholder="Scan or enter product barcode..."
          aria-label="Product barcode lookup"
          autoComplete="off"
          className="
            h-full min-w-0 flex-1 bg-transparent px-1
            text-sm text-white outline-none
            placeholder:text-white/35
          "
        />

        {barcodeLookup.trim() && (
          <button
            type="button"
            onClick={() => setBarcodeLookup("")}
            aria-label="Clear barcode"
            className="
              rounded-lg px-2 py-1 text-xs text-white/45
              hover:bg-white/[0.06] hover:text-white
            "
          >
            Clear
          </button>
        )}

        <button
          type="submit"
          disabled={!barcodeLookup.trim()}
          className="
            flex h-[34px] shrink-0 items-center gap-1
            rounded-xl bg-white/[0.09] px-3
            text-xs font-semibold text-white
            transition hover:bg-white/[0.14]
            disabled:cursor-not-allowed disabled:opacity-30
          "
        >
          Find
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </form>
    )}

    {context === "sell" && (
      <BarcodeSellPanel
        products={products}
        disabled={loader || productsLoading || !branchId}
        onConfirmAdd={(productId, quantity) =>
          handleAddToCart(productId, quantity, false)
        }
      />
    )}

    {/* Search */}

    <GlassInput
      icon={<Search className="h-4 w-4" />}
      placeholder="Search name, SKU or barcode..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    {/* Category filters */}

    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setActiveCategory(category)}
          aria-pressed={activeCategory === category}
          className={cn(
            `
              flex shrink-0 items-center gap-1.5
              rounded-full border px-3.5 py-2
              text-xs font-medium transition-all
              sm:text-sm
            `,
            activeCategory === category
              ? `
                border-teal-300/25 bg-teal-300/[0.12]
                text-teal-200
              `
              : `
                border-white/[0.07] bg-white/[0.025]
                text-white/55 hover:bg-white/[0.06]
                hover:text-white/85
              `
          )}
        >
          <Package className="h-3.5 w-3.5" />
          {category}
        </button>
      ))}
    </div>
  </div>
</header>


{/* BARCODE LOOKUP */}

<GlassSheet
  open={barcodeLookupOpen}
  onClose={() => setBarcodeLookupOpen(false)}
  title="Find a product"
  subtitle="Look up an existing item or register a new barcode."
  size="md"
  className="w-full sm:max-w-lg"
>
  <div className="space-y-4">
    <div
      className="
        flex items-start gap-3 rounded-2xl
        border border-teal-300/10 bg-teal-300/[0.05] p-4
      "
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-300/10 text-teal-200">
        <ScanBarcode className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          Product barcode
        </p>
        <p className="mt-1 text-xs leading-5 text-white/50">
          Enter the barcode below. A matching product opens its
          management screen; an unknown barcode starts a new product.
        </p>
      </div>
    </div>

    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        handleBarcodeLookup(barcodeLookup);
      }}
    >
      <label
        htmlFor="inventory-barcode-lookup"
        className="text-xs font-medium text-white/65"
      >
        Barcode / EAN / UPC
      </label>

      <input
        id="inventory-barcode-lookup"
        type="text"
        value={barcodeLookup}
        onChange={(event) => setBarcodeLookup(event.target.value)}
        placeholder="Enter or scan barcode"
        autoComplete="off"
        autoFocus
        className="
          h-12 w-full rounded-2xl border border-white/10
          bg-white/[0.04] px-4 text-base text-white
          outline-none transition
          focus:border-teal-300/40 focus:ring-2
          focus:ring-teal-300/10
        "
      />

      <button
        type="submit"
        disabled={!barcodeLookup.trim() || productsLoading || !branchId}
        className="
          flex h-12 w-full items-center justify-center gap-2
          rounded-2xl bg-teal-400 text-sm font-semibold
          text-neutral-950 transition hover:bg-teal-300
          active:scale-[0.99]
          disabled:cursor-not-allowed disabled:opacity-40
        "
      >
        <Search className="h-4 w-4" />
        Find or create product
      </button>
    </form>

    <p className="text-center text-[11px] leading-5 text-white/35">
      Existing product metadata is reused. Unknown barcodes need
      product details before they can be saved.
    </p>
  </div>
</GlassSheet>

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
              lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            "
          >
            {filteredProducts.map((product) =>
              context === "sell" ? (
                <SellCard
                  key={product.id}
                  product={product}
                  cartQuantity={cartItems
                    .filter((item) => item.productId === product.id)
                    .reduce((total, item) => total + item.quantity, 0)}
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
                key={item.lineId}
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
                      cartStore.removeItem(item.lineId)
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
                          item.lineId,
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
                          item.lineId,
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
        initialBarcode={
          activeSheet === "create" ? pendingBarcode : ""
        }
        categories={categories.filter(
          (category) => category !== "All" && category !== "Uncategorized",
        )}
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
