import {
  useCallback,
  useEffect,
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
  AlertTriangle,
  Printer,
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
import StockAnalysisPage from "./StockAnalysisPage";
import { generateInternalBarcode, generateBarcodeCanvas } from "./barcodes/barcodeGenerator";

function renderBarcodeDataUrl(value: string): string {
  const canvas = document.createElement("canvas");
  // InventoryPage only assigns internal CODE128 barcodes. The product
  // projection currently exposes the value, not its original symbology.
  generateBarcodeCanvas(canvas, value, "CODE128");
  return canvas.toDataURL("image/png");
}

/* ============================================================
   CONTRACTS
   ============================================================ */

type InventoryMode = "OPENING" | "LIVE";

type InventoryContext = "sell" | "admin";
type InventoryView = "inventory" | "analysis";

type ActiveSheet =
  | null
  | "create"
  | "manage"
  | "edit"
  | "receive"
  | "adjust"
  | "transfer"
  | "history"
  | "barcode-label"
  | "bulk-label";

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

function escapeLabelText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

/**
 * Resolve and validate the effective unit selling price.
 * The sales command/domain remains the authoritative
 * enforcement boundary for pricing policy.
 */
function resolveSellingPrice(
  benchmarkPrice: number,
  negotiatedPrice?: number,
): number {
  const price = negotiatedPrice ?? benchmarkPrice;

  if (
    !isValidMoney(price) ||
    !Number.isSafeInteger(price) ||
    price <= 0
  ) {
    throw new Error(
      "Enter a valid whole-naira selling price greater than zero.",
    );
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

  /*
   * useLiveProducts is scoped to the active branch.
   * All product metrics and filters below therefore operate
   * on the currently selected branch's products.
   */
  const {
    data,
    loading: productsLoading,
  } = useLiveProducts(branchId);

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

  /*
   * Zero-stock filter.
   *
   * When enabled, only products whose quantity is exactly
   * zero are displayed. Search and category filters continue
   * to apply at the same time.
   */
  const [showZeroStockOnly, setShowZeroStockOnly] =
    useState(false);

  // Stock analysis is an admin-only view over the same branch-scoped data.
  const [activeView, setActiveView] =
    useState<InventoryView>("inventory");

  const [history] = useState<ProductHistoryItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  const [productImportOpen, setProductImportOpen] =
    useState(false);

  const [activeSheet, setActiveSheet] =
    useState<ActiveSheet>(null);

  const [barcodeLookup, setBarcodeLookup] = useState("");

  const [barcodeLookupOpen, setBarcodeLookupOpen] =
    useState(false);

  const [pendingBarcode, setPendingBarcode] =
    useState("");


  const [labelPrintBusy, setLabelPrintBusy] = useState(false);

  // Global keyboard-wedge scanner buffer and duplicate-scan protection.
  const scannerBufferRef = useRef("");
  const scannerLastKeyAtRef = useRef(0);
  const scannerStartAtRef = useRef(0);
  const lastHandledScanRef = useRef({ value: "", at: 0 });

  const resetBarcodeSession = useCallback(() => {
    scannerBufferRef.current = "";
    scannerLastKeyAtRef.current = 0;
    scannerStartAtRef.current = 0;
    setBarcodeLookup("");
    setPendingBarcode("");
    setBarcodeLookupOpen(false);
  }, []);

  const closeActiveSheet = useCallback(() => {
    setActiveSheet(null);
    resetBarcodeSession();
  }, [resetBarcodeSession]);

  const closeBarcodeLookup = useCallback(() => {
    resetBarcodeSession();
  }, [resetBarcodeSession]);


  //Lebels State


  /* ==========================================================
     BRANCH PRODUCT METRICS
     ========================================================== */

  /*
   * Total products in the active branch.
   *
   * This counts product records, not total stock units.
   */
  const branchProductCount = products.length;

  /*
   * Products with exactly zero available stock.
   */
  const zeroStockProductsCount = useMemo(
    () =>
      products.filter(
        (product) => product.quantity === 0,
      ).length,
    [products],
  );
  /* ==========================================================
     BARCODE LOOKUP
     ========================================================== */

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
          barcode.toLowerCase(),
      );

      // Clear the lookup immediately. Preserve only an unknown barcode
      // for the product-registration form.
      setBarcodeLookup("");
      setBarcodeLookupOpen(false);
      scannerBufferRef.current = "";
      scannerLastKeyAtRef.current = 0;
      scannerStartAtRef.current = 0;

      if (existingProduct) {
        setPendingBarcode("");
        setSelectedProduct(existingProduct);
        setActiveSheet("manage");
        toast.success(`Found ${existingProduct.name}.`);
        return;
      }

      setPendingBarcode(barcode);
      setSelectedProduct(null);
      setActiveSheet("create");
      toast.info(
        "Product not found. Complete the product details to register this barcode.",
      );
    },
    [products],
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
        (total, item) =>
          total + item.price * item.quantity,
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

  /*
   * All filters are combined here:
   *
   * 1. Search
   * 2. Category
   * 3. Zero-stock filter
   *
   * The zero-stock filter does not replace search or category
   * filtering. It adds another condition to the same query.
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.barcode ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (product.sku ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchCategory =
        activeCategory === "All" ||
        (product.category?.trim() || "Uncategorized") ===
          activeCategory;

      const matchZeroStock =
        !showZeroStockOnly || product.quantity === 0;

      return (
        matchSearch &&
        matchCategory &&
        matchZeroStock
      );
    });
  }, [
    products,
    search,
    activeCategory,
    showZeroStockOnly,
  ]);

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
      await app.product.delete(_productId, mode)
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
        toast.error(
          "Select an active branch before adding products to a sale.",
        );
        return false;
      }

      const product = products.find(
        (item) => item.id === productId,
      );

      if (!product) {
        toast.error("Product is no longer available.");
        return false;
      }

      if (
        !Number.isSafeInteger(product.quantity) ||
        product.quantity < 0
      ) {
        toast.error(
          "The product stock quantity is invalid.",
        );
        return false;
      }

      if (
        !isValidMoney(product.price) ||
        product.price <= 0 ||
        !isValidMoney(product.costPrice)
      ) {
        toast.error("The product pricing is invalid.");
        return false;
      }

      let actualSellingPrice: number;

      try {
        actualSellingPrice = resolveSellingPrice(
          product.price,
          negotiatedPrice,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Enter a valid selling price.",
          ),
        );
        return false;
      }

      // A product may have multiple cart lines when agreed
      // unit prices differ. Sum all lines before checking stock.
      const currentProductQuantity = cartItems
        .filter(
          (item) => item.productId === productId,
        )
        .reduce(
          (total, item) => total + item.quantity,
          0,
        );

      if (
        currentProductQuantity + quantity >
        product.quantity
      ) {
        const remaining = Math.max(
          0,
          product.quantity - currentProductQuantity,
        );

        toast.error(
          `Only ${remaining} more units can be added.`,
        );

        return false;
      }

      cartStore.addItem({
        productId: product.id,
        name: product.name,
        quantity,
        price: actualSellingPrice,
        costPrice: product.costPrice,
      });

      if (openCart) {
        setCartOpen(true);
      }

      return true;
    },
    [
      branchId,
      products,
      cartItems,
      cartStore,
    ],
  );


  //BarCode Generator 
  const handleGenerateBarcode = useCallback(
  async (product: LiveProduct) => {
    if (product.barcode?.trim()) {
      toast.info("This product already has a barcode.");
      return;
    }

    try {
      await runExclusiveAction(async () => {
        let assignedBarcode: string | null = null;

        // Retry only a confirmed uniqueness conflict. All other
        // application/domain errors must be surfaced immediately.
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const candidate = generateInternalBarcode();

          try {
            await app.product.assignBarcode({
              productId: product.id,
              barcode: candidate,
              barcodeFormat: "CODE128",
              barcodeSource: "INTERNAL",
              mode,
            });
            assignedBarcode = candidate;
            break;
          } catch (error) {
            const isUniqueConflict =
              error instanceof Error &&
              error.message.includes("BARCODE_UNIQUE_CONFLICT");

            if (!isUniqueConflict || attempt === 4) {
              throw error;
            }
          }
        }

        if (!assignedBarcode) {
          throw new Error("Unable to allocate a unique product barcode.");
        }

        toast.success(`Barcode assigned to ${product.name}.`);
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to assign barcode.",
        ),
      );
    }
  },
  [
    app.product,
    mode,
    runExclusiveAction,
  ],
);
  const handleScannedBarcode = useCallback(
    (rawValue: string) => {
      const value = rawValue.trim();
      if (!value || !branchId) return;

      if (context === "sell") {
        const product = products.find(
          (item) => (item.barcode ?? "").trim().toLowerCase() === value.toLowerCase(),
        );
        if (!product) {
          toast.error(`No product found for barcode ${value}.`);
          return;
        }
        if (handleAddToCart(product.id, 1, false)) {
          toast.success(`${product.name} added to the sale.`);
        }
        return;
      }

      handleBarcodeLookup(value);
    },
    [branchId, context, products, handleAddToCart, handleBarcodeLookup],
  );

  useEffect(() => {
    if (!branchId || productsLoading) return;

    const resetBuffer = () => {
      scannerBufferRef.current = "";
      scannerLastKeyAtRef.current = 0;
      scannerStartAtRef.current = 0;
    };

    const clearAccidentalInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target.readOnly || target.disabled) return;
      const prototype = target instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      setter?.call(target, "");
      target.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const now = event.timeStamp || performance.now();
      const gap = now - scannerLastKeyAtRef.current;
      if (scannerLastKeyAtRef.current && gap > 90) resetBuffer();

      if (event.key === "Enter") {
        const value = scannerBufferRef.current.trim();
        const duration = scannerLastKeyAtRef.current - scannerStartAtRef.current;
        const averageGap = value.length > 1 ? duration / (value.length - 1) : Infinity;
        const scannerBurst = value.length >= 4 && averageGap <= 55;
        resetBuffer();
        if (!scannerBurst) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const previous = lastHandledScanRef.current;
        if (previous.value === value && now - previous.at < 350) return;
        lastHandledScanRef.current = { value, at: now };
        clearAccidentalInput(event.target);
        handleScannedBarcode(value);
        return;
      }

      if (event.key === "Escape") {
        resetBuffer();
        return;
      }
      if (event.key.length !== 1) return;

      if (!scannerBufferRef.current) scannerStartAtRef.current = now;
      scannerBufferRef.current += event.key;
      scannerLastKeyAtRef.current = now;

      // Stop the rest of the barcode from entering whichever input has focus.
      if (scannerBufferRef.current.length >= 2 && gap <= 55) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      resetBuffer();
    };
  }, [branchId, productsLoading, handleScannedBarcode]);

  
const printProductLabels = useCallback(async (items: LiveProduct[]) => {
  const printable = items.filter((item) => item.barcode?.trim());

  if (!printable.length) {
    toast.error("No products with saved barcodes are available to print.");
    return;
  }

  // Open synchronously inside the click event.
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Allow pop-ups to print labels.");
    return;
  }

  setLabelPrintBusy(true);

  try {
    const labels = printable.map((product) => {
      const barcode = product.barcode!.trim();
      const image = renderBarcodeDataUrl(barcode);

      return `
        <article class="label-page">
          <div class="label">

            <div class="name">
              ${escapeLabelText(product.name)}
            </div>

            ${
              product.sku?.trim()
                ? `<div class="sku">
                    SKU: ${escapeLabelText(product.sku)}
                  </div>`
                : ""
            }

            <img
              class="barcode"
              src="${image}"
              alt="Product barcode"
            />

            <div class="value">
              ${escapeLabelText(barcode)}
            </div>

          </div>
        </article>
      `;
    });

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          <title>BizTru Product Labels</title>

          <style>

            /* PHYSICAL PRINTER PAPER */
            @page {
              size: 58mm 40mm;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 58mm;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff;
              color: #000;
              font-family: Arial, sans-serif;
            }

            body {
              overflow: visible;
            }

            /* ONE PHYSICAL PAGE PER PRODUCT */
            .label-page {
              width: 58mm;
              height: 40mm;

              min-width: 58mm;
              min-height: 40mm;

              max-width: 58mm;
              max-height: 40mm;

              margin: 0;
              padding: 0;

              display: flex;
              align-items: center;
              justify-content: center;

              overflow: hidden;

              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* ACTUAL PRINTABLE LABEL CONTENT */
            .label {
              width: 50mm;
              height: 30mm;

              min-width: 50mm;
              min-height: 30mm;

              max-width: 50mm;
              max-height: 30mm;

              margin: 0;
              padding: 1mm 1.5mm;

              display: flex;
              flex-direction: column;

              align-items: center;
              justify-content: center;

              gap: 0.5mm;

              overflow: hidden;

              background: #fff;
              color: #000;

              text-align: center;

              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* PRODUCT NAME */
            .name {
              width: 100%;
              flex: 0 0 auto;

              font-size: 8pt;
              font-weight: 700;

              line-height: 1.1;

              text-align: center;

              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            /* SKU */
            .sku {
              width: 100%;
              flex: 0 0 auto;

              font-size: 6pt;
              line-height: 1.1;

              text-align: center;

              white-space: nowrap;
              overflow: hidden;
            }

            /* BARCODE */
            .barcode {
              display: block;

              width: 38mm;
              height: 18mm;

              min-width: 38mm;
              max-width: 38mm;

              flex: 0 0 11mm;

              object-fit: contain;
              object-position: center;

              margin: 0 auto;
              padding: 0;
            }

            /* BARCODE NUMBER */
            .value {
              width: 100%;
              flex: 0 0 auto;

              font-family: monospace;

              font-size: 5.5pt;
              line-height: 1.1;

              letter-spacing: 0.2px;

              text-align: center;

              white-space: nowrap;
              overflow: hidden;
            }

            /* PRICE */
            .price {
              width: 100%;
              flex: 0 0 auto;

              font-size: 7pt;
              font-weight: 700;

              line-height: 1.1;

              text-align: center;

              white-space: nowrap;
              overflow: hidden;
            }

            /* SCREEN PREVIEW */
            @media screen {
              html,
              body {
                width: 100%;
                background: #ddd;
              }

              .label-page {
                margin: 8px auto;
                background: #fff;
              }
            }

            /* PHYSICAL PRINT */
            @media print {
              html,
              body {
                width: 58mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
              }

              .label-page {
                margin: 0 !important;
              }
            }

          </style>
        </head>

        <body>
          ${labels.join("")}

          <script>
            window.onload = async () => {
              try {
                await Promise.all(
                  Array.from(document.images).map((img) => {
                    if (img.complete && img.naturalWidth > 0) {
                      return Promise.resolve();
                    }

                    return img.decode().catch(() => {});
                  })
                );

                await document.fonts.ready;

                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    window.print();
                  });
                });

              } catch (error) {
                console.error("Label printing error:", error);
                window.print();
              }
            };

            window.onafterprint = () => {
              window.close();
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();

    toast.success(
      `${printable.length} label(s) prepared. Select the Y50 printer and print at 100%.`
    );

  } catch (error) {
    printWindow.close();

    toast.error(
      getErrorMessage(error, "Unable to prepare product labels.")
    );
  } finally {
    setLabelPrintBusy(false);
  }
}, []);


  const handlePrintLabel = useCallback(() => {
    if (!selectedProduct) {
      toast.error("Select a product first.");
      return;
    }
    void printProductLabels([selectedProduct]);
  }, [selectedProduct, printProductLabels]);

  const handlePrintAllLabels = useCallback(() => {
    void printProductLabels(products.filter((product) => product.barcode?.trim()));
  }, [products, printProductLabels]);

  /* ==========================================================
     CHANGE / REMOVE CART LINE
     ========================================================== */

  const handleChangeCartQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) {
        toast.error("Enter a valid quantity.");
        return;
      }

      const line = cartItems.find(
        (item) => item.lineId === lineId,
      );

      if (!line) {
        toast.error(
          "This cart line no longer exists.",
        );
        return;
      }

      if (quantity <= 0) {
        cartStore.removeItem(lineId);
        return;
      }

      const product = products.find(
        (item) => item.id === line.productId,
      );

      if (!product) {
        toast.error(
          "This product is no longer in the current inventory.",
        );
        return;
      }

      if (
        !Number.isSafeInteger(product.quantity) ||
        product.quantity < 0
      ) {
        toast.error(
          "The product stock quantity is invalid.",
        );
        return;
      }

      const otherLinesQuantity = cartItems
        .filter(
          (item) =>
            item.productId === line.productId &&
            item.lineId !== lineId,
        )
        .reduce(
          (total, item) => total + item.quantity,
          0,
        );

      const availableForThisLine =
        product.quantity - otherLinesQuantity;

      if (quantity > availableForThisLine) {
        toast.error(
          `Only ${Math.max(
            0,
            availableForThisLine,
          )} units are available for this cart line.`,
        );
        return;
      }

      cartStore.updateQty(lineId, quantity);
    },
    [
      cartItems,
      products,
      cartStore,
    ],
  );

  /* ==========================================================
     QUICK SELL
     ========================================================== */

  const handleQuickSell = useCallback(
    async (
      productId: string,
      quantity: number,
      negotiatedPrice?: number,
    ) => {
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
        product.price <= 0 ||
        !isValidMoney(product.costPrice)
      ) {
        toast.error("The product pricing is invalid.");
        return;
      }

      if (
        !Number.isSafeInteger(product.quantity) ||
        product.quantity < 0
      ) {
        toast.error(
          "The product stock quantity is invalid.",
        );
        return;
      }

      const alreadyInCart = cartItems
        .filter(
          (item) => item.productId === productId,
        )
        .reduce(
          (total, item) => total + item.quantity,
          0,
        );

      if (
        alreadyInCart + quantity > product.quantity
      ) {
        toast.error(
          "Insufficient stock after accounting for the current cart.",
        );
        return;
      }

      let actualSellingPrice: number;

      try {
        actualSellingPrice = resolveSellingPrice(
          product.price,
          negotiatedPrice,
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Enter a valid selling price.",
          ),
        );
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

          toast.success(
            `Sale completed for ${product.name} at ${formatNaira(
              actualSellingPrice,
            )} each.`,
          );
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
      cartItems,
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

    // Snapshot the current cart.
    const checkoutItems = cartItems.map(
      (item) => ({ ...item }),
    );

    // Validate aggregate quantity per product, not each
    // negotiated-price line independently.
    const checkoutQuantityByProduct =
      new Map<string, number>();

    for (const item of checkoutItems) {
      checkoutQuantityByProduct.set(
        item.productId,
        (checkoutQuantityByProduct.get(
          item.productId,
        ) ?? 0) + item.quantity,
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
        (candidate) =>
          candidate.id === item.productId,
      );

      if (!product) {
        toast.error(
          `${item.name} is no longer available.`,
        );
        return;
      }

      if (
        !Number.isSafeInteger(product.quantity) ||
        product.quantity < 0
      ) {
        toast.error(
          `The stock quantity for ${item.name} is invalid.`,
        );
        return;
      }

      const totalRequested =
        checkoutQuantityByProduct.get(
          item.productId,
        ) ?? 0;

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
         * This loop preserves the current sales API.
         *
         * It is not an atomic multi-line checkout. The sales
         * service must provide idempotency and partial-checkout
         * recovery to make retries safe if one line fails after
         * earlier lines have committed.
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
              costPrice:
                item.costPrice * item.quantity,
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
        throw new Error(
          "Enter a valid unit cost price.",
        );
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
      resetBarcodeSession();
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
      resetBarcodeSession,
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
        throw new Error(
          "Enter a valid adjustment quantity.",
        );
      }

      if (!reason.trim()) {
        throw new Error(
          "Provide a reason for the adjustment.",
        );
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
      resetBarcodeSession();
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
      resetBarcodeSession,
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
        throw new Error(
          "Enter a valid transfer quantity.",
        );
      }

      const activeBranchId = requireBranchId();

      if (!targetBranchId.trim()) {
        throw new Error(
          "Select a destination branch.",
        );
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
      resetBarcodeSession();
    },
    [
      selectedProduct,
      requireBranchId,
      app.inventory,
      mode,
      resetBarcodeSession,
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
              throw new Error(
                "Select a product to edit.",
              );
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
            resetBarcodeSession();
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
           * These are two separate service calls.
           * For strict consistency, provide a single application
           * command that creates the product and initial stock
           * together, or uses an idempotent saga/outbox workflow.
           */
          await app.product.create({
            id: productId,
            name,
            price: data.price,
            costPrice: data.cost,
            description: data.description ?? null,
            sku: data.sku ?? null,
            barcode: data.barcode ?? null,
            reorderLevel: data.reorderLevel ?? null,
            imageUrl: data.imageUrl ?? null,
            category: data.category ?? null,
            mode,
          });

            await app.inventory.createStock({
              id: inventoryId,
              productId,
              quantity: data.quantity,
              costPrice: data.cost,
              mode,
            });
          

          toast.success("Product created.");
          setActiveSheet(null);
          resetBarcodeSession();
        });
      } catch (error) {
        console.error(
          "Product save failed:",
          error,
        );

        toast.error(
          getErrorMessage(
            error,
            "Unable to save product.",
          ),
        );
      }
    },
    [
      activeSheet,
      selectedProduct,
      app.product,
      app.inventory,
      mode,
      requireBranchId,
      runExclusiveAction,
      resetBarcodeSession,
    ],
  );

  /* ==========================================================
     PRODUCT IMPORT
     ========================================================== */

  const handleProductImport = useCallback(
    async (
      rows: ValidatedProductImportRow[],
      onProgress?: (
        update: ProductImportProgressUpdate,
      ) => void,
    ): Promise<ProductImportResult> => {
      const activeBranchId = requireBranchId();

      // Delegate all writes to the application-level service.
      return executeProductImport(
        app,
        {
          branchId: activeBranchId,
          mode,
          rows,
        },
        onProgress,
      );
    },
    [
      app,
      mode,
      requireBranchId,
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

      {/* ======================================================
          HEADER — RESPONSIVE COMMAND CENTER
          ====================================================== */}

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
                  {context === "sell"
                    ? "Quick Sell"
                    : "Inventory"}
                </h1>

                <p className="mt-0.5 text-xs text-white/45">
                  {context === "sell"
                    ? `${branchProductCount} products available`
                    : `${branchProductCount} products in your inventory`}
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
                    {cartQuantity > 99
                      ? "99+"
                      : cartQuantity}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Admin view switcher: inventory operations and stock intelligence. */}
          {context === "admin" && (
            <div
              role="group"
              aria-label="Inventory view"
              className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-1 sm:inline-grid sm:w-auto"
            >
              <button
                type="button"
                aria-pressed={activeView === "inventory"}
                onClick={() => setActiveView("inventory")}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition sm:text-sm",
                  activeView === "inventory"
                    ? "bg-teal-300/[0.14] text-teal-200 shadow-sm"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <Package className="h-4 w-4" />
                Inventory
              </button>
              <button
                type="button"
                aria-pressed={activeView === "analysis"}
                onClick={() => setActiveView("analysis")}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition sm:text-sm",
                  activeView === "analysis"
                    ? "bg-teal-300/[0.14] text-teal-200 shadow-sm"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Stock analysis
              </button>
            </div>
          )}

          {context === "sell" || activeView === "inventory" ? (
            <>
          {/* ==================================================
              BRANCH INVENTORY METRICS AND ZERO-STOCK FILTER
              ================================================== */}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">

            {/* Branch product metric */}

            <div
              className="
                flex min-w-0 items-center gap-3
                rounded-2xl border border-white/[0.08]
                bg-white/[0.035] px-3.5 py-3
              "
            >
              <div
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl border border-teal-300/15
                  bg-teal-300/[0.08] text-teal-200
                "
              >
                <Package className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-white/40">
                  Branch products
                </p>

                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-white">
                    {productsLoading
                      ? "—"
                      : branchProductCount.toLocaleString("en-NG")}
                  </span>

                  <span className="hidden truncate text-[10px] text-white/35 sm:inline">
                    Total products
                  </span>
                </div>
              </div>
            </div>

            {/* Zero-stock filter button */}

            <button
              type="button"
              onClick={() =>
                setShowZeroStockOnly((current) => !current)
              }
              disabled={
                productsLoading ||
                !branchId ||
                zeroStockProductsCount === 0
              }
              aria-pressed={showZeroStockOnly}
              className={cn(
                `
                  flex min-w-0 items-center justify-center gap-2
                  rounded-2xl border px-3 py-3
                  text-left transition-all
                  disabled:cursor-not-allowed disabled:opacity-40
                  sm:min-w-[190px] sm:justify-start sm:px-4
                `,
                showZeroStockOnly
                  ? `
                    border-red-400/30
                    bg-red-400/[0.12]
                    text-red-200
                    shadow-[0_4px_18px_rgba(248,113,113,0.08)]
                  `
                  : `
                    border-white/[0.08]
                    bg-white/[0.035]
                    text-white/75
                    hover:border-red-300/20
                    hover:bg-red-400/[0.06]
                    hover:text-red-200
                  `,
              )}
            >
              <div
                className={cn(
                  `
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-xl
                  `,
                  showZeroStockOnly
                    ? "bg-red-400/15 text-red-200"
                    : "bg-white/[0.06] text-red-300",
                )}
              >
                <AlertTriangle className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {showZeroStockOnly
                    ? "Showing zero stock"
                    : "Zero stock"}
                </p>

                <p className="mt-0.5 text-[10px] text-white/40">
                  {productsLoading
                    ? "Loading..."
                    : `${zeroStockProductsCount.toLocaleString(
                        "en-NG",
                      )} products`}
                </p>
              </div>

              {showZeroStockOnly && (
                <span className="shrink-0 rounded-full bg-red-400/15 px-2 py-1 text-[9px] font-bold text-red-200">
                  ON
                </span>
              )}
            </button>
          </div>

          {/* Inventory filter status */}

          {showZeroStockOnly && (
            <div
              className="
                flex items-center justify-between gap-3
                rounded-xl border border-red-400/15
                bg-red-400/[0.05] px-3 py-2
              "
            >
              <div className="flex min-w-0 items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-300" />

                <p className="truncate text-xs text-red-200/80">
                  Showing products with zero stock only
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowZeroStockOnly(false)}
                className="
                  shrink-0 rounded-lg px-2 py-1
                  text-[11px] font-semibold text-red-200
                  transition hover:bg-red-300/10
                "
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Mobile product actions */}

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
                onClick={() => { resetBarcodeSession(); setBarcodeLookupOpen(true); }}
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
                onClick={handlePrintAllLabels}
                disabled={labelPrintBusy || products.every((product) => !product.barcode?.trim())}
                aria-label="Print all product labels"
                title="Print all product labels"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-400/[0.08] text-teal-200 transition hover:bg-teal-400/15 active:scale-95 disabled:opacity-40"
              >
                <Printer className="h-[19px] w-[19px]" />
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
                onClick={handlePrintAllLabels}
                disabled={labelPrintBusy || products.every((product) => !product.barcode?.trim())}
                className="h-10 px-4"
                icon={<Printer className="h-4 w-4" />}
              >
                Print labels
              </GlassButton>

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
                onClick={() => { resetBarcodeSession(); setBarcodeLookupOpen(true); }}
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
                onChange={(event) =>
                  setBarcodeLookup(event.target.value)
                }
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
            <div className="w-full">
              <BarcodeSellPanel
                products={products}
                disabled={
                  loader ||
                  productsLoading ||
                  !branchId
                }
                onConfirmAdd={(productId, quantity) => {
                  const added = handleAddToCart(
                    productId,
                    quantity,
                    false,
                  );

                  return added;
                }}
              />
            </div>
          )}

          {/* Search */}

          <GlassInput
            icon={<Search className="h-4 w-4" />}
            placeholder="Search name, SKU or barcode..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {/* Category filters */}

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(category)
                }
                aria-pressed={
                  activeCategory === category
                }
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
                    `,
                )}
              >
                <Package className="h-3.5 w-3.5" />
                {category}
              </button>
            ))}
          </div>
          </>
          ) : null}
        </div>
      </header>

      {/* ======================================================
          BARCODE LOOKUP
          ====================================================== */}

      <GlassSheet
        open={barcodeLookupOpen}
        onClose={closeBarcodeLookup}
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
                Scan a barcode at any time, or enter it below.
                A matching product opens its management screen;
                an unknown barcode starts a new product.
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
              onChange={(event) =>
                setBarcodeLookup(event.target.value)
              }
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
              disabled={
                !barcodeLookup.trim() ||
                productsLoading ||
                !branchId
              }
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
            Existing product metadata is reused. Unknown
            barcodes need product details before they can be saved.
          </p>
        </div>
      </GlassSheet>

      {/* ======================================================
          INVENTORY / STOCK ANALYSIS CONTENT
          ====================================================== */}

      {context === "admin" && activeView === "analysis" ? (
        <main className="mx-auto w-full max-w-[1800px] px-3 pb-8 pt-4 sm:px-4 sm:pt-6 lg:px-6">
          {!branchId ? (
            <div className="flex min-h-64 items-center justify-center text-center text-sm text-white/45">
              Select an active branch to analyse its stock.
            </div>
          ) : (
            <StockAnalysisPage
              products={products}
              loading={productsLoading}
              onProductSelect={openManage}
            />
          )}
        </main>
      ) : (
        <>
          {/* PRODUCT GRID */}
          <main className="mx-auto w-full max-w-[1800px] px-3 pb-6 pt-4 sm:px-4 lg:px-6">
            {!branchId ? (
              <div className="flex items-center justify-center py-24 text-gray-400">
                Select a branch to view inventory.
              </div>
            ) : productsLoading ? (
              <div role="status" aria-live="polite" className="flex items-center justify-center py-24 text-gray-400">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <GlassIcon size="lg" variant="primary">
                  {showZeroStockOnly ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : (
                    <Package className="h-6 w-6" />
                  )}
                </GlassIcon>
                <p className="mt-4 text-center text-sm">
                  {showZeroStockOnly && zeroStockProductsCount === 0
                    ? "There are no zero-stock products in this branch."
                    : showZeroStockOnly
                      ? "No zero-stock products match your search or category filters."
                      : search.trim() || activeCategory !== "All"
                        ? "No products match your filters."
                        : "No products found."}
                </p>
                {showZeroStockOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowZeroStockOnly(false);
                      setSearch("");
                      setActiveCategory("All");
                    }}
                    className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.08]"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="text-xs text-white/40">
                    {showZeroStockOnly ? "Zero-stock products" : "Products"}
                  </p>
                  <p className="text-xs font-medium tabular-nums text-white/55">
                    {filteredProducts.length.toLocaleString("en-NG")} {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
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
              </>
            )}
          </main>
        </>
      )}

      {/* ======================================================
          MOBILE CART BAR
          ====================================================== */}

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
                  {cartQuantity}{" "}
                  {cartQuantity === 1 ? "item" : "items"}
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

      {/* ======================================================
          CART SHEET
          ====================================================== */}

      {context === "sell" && (
        <GlassSheet
          open={cartOpen}
          onClose={() => {
            if (!loader) {
              setCartOpen(false);
            }
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
                <span className="text-gray-400">
                  Subtotal
                </span>

                <span className="text-gray-200">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-white">
                  Total
                </span>

                <span className="text-2xl font-bold text-emerald-400">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              <GlassButton
                variant="success"
                disabled={
                  loader || cartItems.length === 0
                }
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
                    {formatNaira(
                      item.price * item.quantity,
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassSheet>
      )}

      {/* ======================================================
          PRODUCT IMPORT
          ====================================================== */}

      <ProductImportSheet
        open={productImportOpen}
        onClose={handleCloseImport}
        prepareFile={prepareProductImportFile}
        validateRows={validateProductImportRows}
        onImport={handleProductImport}
        onViewProducts={() =>
          setProductImportOpen(false)
        }
        onViewInventory={() =>
          setProductImportOpen(false)
        }
      />

      {/* ======================================================
          CREATE / EDIT PRODUCT
          ====================================================== */}

      <ProductSheet
        open={
          activeSheet === "create" ||
          activeSheet === "edit"
        }
        mode={
          activeSheet === "create"
            ? "create"
            : "edit"
        }
        initialData={selectedProduct}
        initialBarcode={
          activeSheet === "create"
            ? pendingBarcode
            : ""
        }
        categories={categories.filter(
          (category) =>
            category !== "All" &&
            category !== "Uncategorized",
        )}
        loading={loader}
        onClose={() => {
          if (!loader) {
            setActiveSheet(null);
            resetBarcodeSession();
          }
        }}
        onSubmit={handleSubmit}
      />

      {/* ======================================================
          PRODUCT MANAGEMENT
          ====================================================== */}

      <ProductDetailsSheet
        open={activeSheet === "manage"}
        onClose={closeActiveSheet}
        product={selectedProduct}
        onEditDetails={() => {
          if (!selectedProduct) return;
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

        onPrintLabel={handlePrintLabel}
        onGenerateBarcode={() => selectedProduct && void handleGenerateBarcode(selectedProduct)}
      />

      {/* ======================================================
          RECEIVE STOCK
          ====================================================== */}

      <ReceiveStockSheet
        open={activeSheet === "receive"}
        product={selectedProduct}
        onClose={closeActiveSheet}
        onSubmit={handleReceiveStock}
      />

      {/* ======================================================
          ADJUST STOCK
          ====================================================== */}

      <AdjustStockSheet
        open={activeSheet === "adjust"}
        product={selectedProduct}
        onClose={closeActiveSheet}
        onSubmit={handleAdjustStock}
      />

      {/* ======================================================
          TRANSFER STOCK
          ====================================================== */}

      <TransferStockSheet
        open={activeSheet === "transfer"}
        product={selectedProduct}
        branches={branches}
        onClose={closeActiveSheet}
        onSubmit={handleTransferStock}
      />

      {/* ======================================================
          PRODUCT HISTORY
          ====================================================== */}

      <ProductHistorySheet
        open={activeSheet === "history"}
        product={selectedProduct}
        history={history}
        onClose={closeActiveSheet}
      />
    </div>
  );
}