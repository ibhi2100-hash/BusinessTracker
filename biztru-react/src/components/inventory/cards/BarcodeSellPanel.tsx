import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Barcode,
  CheckCircle2,
  Package,
  Search,
  XCircle,
} from "lucide-react";

import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface BarcodeSellPanelProps {
  products: LiveProduct[];
  disabled?: boolean;
  onConfirmAdd: (productId: string, quantity: number) => boolean;
}

type Message = {
  kind: "error" | "success" | "info";
  text: string;
};

type ScannerInputSnapshot = {
  element: HTMLInputElement | HTMLTextAreaElement;
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
};

const SCANNER_MAX_KEY_INTERVAL_MS = 120;
const SCANNER_MAX_AVERAGE_INTERVAL_MS = 65;
const SCANNER_MIN_LENGTH = 4;
const SCANNER_MAX_LENGTH = 128;

function normalizeBarcode(value: string): string {
  // Do not remove leading zeroes.
  return value.trim();
}

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function isEditableElement(
  element: Element | null,
): element is HTMLInputElement | HTMLTextAreaElement {
  if (!element) return false;

  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  );
}

function captureFocusedInput(): ScannerInputSnapshot | null {
  const element = document.activeElement;

  if (!isEditableElement(element)) return null;

  return {
    element,
    value: element.value,
    selectionStart: element.selectionStart,
    selectionEnd: element.selectionEnd,
  };
}

/**
 * A keyboard-wedge scanner types into the currently focused control.
 * Restore that control to its pre-scan value after identifying a scanner burst.
 */
function restoreFocusedInput(
  snapshot: ScannerInputSnapshot | null,
): void {
  if (!snapshot || !snapshot.element.isConnected) return;

  const element = snapshot.element;

  // Use the native setter so React's input tracking can observe the change.
  const prototype =
    element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (setter) {
    setter.call(element, snapshot.value);
  } else {
    element.value = snapshot.value;
  }

  element.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );

  try {
    element.setSelectionRange(
      snapshot.selectionStart,
      snapshot.selectionEnd,
    );
  } catch {
    // Some input types do not support selection ranges.
  }
}

export default function BarcodeSellPanel({
  products,
  disabled = false,
  onConfirmAdd,
}: BarcodeSellPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const scannerBufferRef = useRef("");
  const scannerStartedAtRef = useRef(0);
  const scannerLastKeyAtRef = useRef(0);
  const scannerInputSnapshotRef =
    useRef<ScannerInputSnapshot | null>(null);

  const lastScannedBarcodeRef = useRef<{
    barcode: string;
    time: number;
  } | null>(null);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [matchedProductId, setMatchedProductId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<Message | null>(null);

  const productsByBarcode = useMemo(() => {
    const index = new Map<string, LiveProduct[]>();

    for (const product of products) {
      const barcode = normalizeBarcode(product.barcode ?? "");
      if (!barcode) continue;

      const key = barcode.toLocaleLowerCase("en");

      const matches = index.get(key) ?? [];
      matches.push(product);

      index.set(key, matches);
    }

    return index;
  }, [products]);

  const matchedProduct = useMemo(
    () =>
      products.find((product) => product.id === matchedProductId) ?? null,
    [products, matchedProductId],
  );

  const resetScannerBuffer = useCallback(() => {
    scannerBufferRef.current = "";
    scannerStartedAtRef.current = 0;
    scannerLastKeyAtRef.current = 0;
    scannerInputSnapshotRef.current = null;
  }, []);

  const findProduct = useCallback(
    (rawValue: string):
      | { kind: "found"; product: LiveProduct }
      | { kind: "missing" }
      | { kind: "duplicate" } => {
      const barcode = normalizeBarcode(rawValue);

      if (!barcode) return { kind: "missing" };

      const matches =
        productsByBarcode.get(barcode.toLocaleLowerCase("en")) ?? [];

      if (matches.length === 0) {
        return { kind: "missing" };
      }

      if (matches.length > 1) {
        return { kind: "duplicate" };
      }

      const product = matches[0];

      if (!product) {
        return { kind: "missing" };
      }

      return { kind: "found", product };
    },
    [productsByBarcode],
  );

  const addScannedProduct = useCallback(
    (rawValue: string) => {
      const barcode = normalizeBarcode(rawValue);

      if (!barcode) return;

      if (disabled) {
        setMessage({
          kind: "error",
          text: "Sales are currently disabled. The scanned product was not added.",
        });
        return;
      }

      // Protect against scanners sending the same barcode twice immediately.
      const now = Date.now();
      const lastScan = lastScannedBarcodeRef.current;

      if (
        lastScan?.barcode === barcode &&
        now - lastScan.time < 350
      ) {
        return;
      }

      lastScannedBarcodeRef.current = {
        barcode,
        time: now,
      };

      const result = findProduct(barcode);

      if (result.kind === "missing") {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `No product matches barcode "${barcode}". Add this barcode to the product record first.`,
        });
        return;
      }

      if (result.kind === "duplicate") {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `Barcode "${barcode}" belongs to more than one product. An administrator must resolve the duplicate.`,
        });
        return;
      }

      const product = result.product;

      if (product.quantity <= 0) {
        setMatchedProductId(product.id);
        setMessage({
          kind: "error",
          text: `${product.name} is out of stock.`,
        });
        return;
      }

      const added = onConfirmAdd(product.id, 1);

      if (!added) {
        setMatchedProductId(product.id);
        setMessage({
          kind: "error",
          text: `Could not add ${product.name} to the current sale. Check the sale and stock status.`,
        });
        return;
      }

      setBarcodeInput("");
      setMatchedProductId(null);
      setMessage({
        kind: "success",
        text: `${product.name} added to the current sale.`,
      });
    },
    [disabled, findProduct, onConfirmAdd],
  );

  /**
   * Global keyboard-wedge scanner listener.
   *
   * It does not require the barcode input to have focus.
   * Configure the scanner to append Enter after every barcode.
   */
  useEffect(() => {
    if (disabled) {
      resetScannerBuffer();
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey) {
        resetScannerBuffer();
        return;
      }

      if (event.key === "Escape") {
        resetScannerBuffer();
        return;
      }

      const now = Date.now();

      if (event.key === "Enter") {
        const barcode = scannerBufferRef.current;
        const startedAt = scannerStartedAtRef.current;
        const lastKeyAt = scannerLastKeyAtRef.current;

        const characterCount = barcode.length;
        const elapsed = lastKeyAt - startedAt;
        const averageInterval =
          characterCount > 1 ? elapsed / (characterCount - 1) : Infinity;

        const isScannerBurst =
          characterCount >= SCANNER_MIN_LENGTH &&
          characterCount <= SCANNER_MAX_LENGTH &&
          averageInterval <= SCANNER_MAX_AVERAGE_INTERVAL_MS;

        if (isScannerBurst) {
          // Stop Enter from submitting whichever form currently has focus.
          event.preventDefault();
          event.stopPropagation();

          restoreFocusedInput(scannerInputSnapshotRef.current);
          resetScannerBuffer();

          addScannedProduct(barcode);
          return;
        }

        resetScannerBuffer();
        return;
      }

      // Ignore non-character keys. Scanner input should be plain characters.
      if (event.key.length !== 1) {
        resetScannerBuffer();
        return;
      }

      const previousKeyAt = scannerLastKeyAtRef.current;
      const gap = previousKeyAt ? now - previousKeyAt : 0;

      if (
        !scannerBufferRef.current ||
        gap > SCANNER_MAX_KEY_INTERVAL_MS
      ) {
        scannerBufferRef.current = "";
        scannerStartedAtRef.current = now;
        scannerInputSnapshotRef.current = captureFocusedInput();
      }

      scannerBufferRef.current += event.key;
      scannerLastKeyAtRef.current = now;

      if (scannerBufferRef.current.length > SCANNER_MAX_LENGTH) {
        resetScannerBuffer();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
      resetScannerBuffer();
    };
  }, [addScannedProduct, disabled, resetScannerBuffer]);

  const lookupBarcode = useCallback(
    (rawValue: string) => {
      const barcode = normalizeBarcode(rawValue);

      if (!barcode) {
        setMessage({
          kind: "error",
          text: "Scan a barcode or type it in first.",
        });
        return;
      }

      const result = findProduct(barcode);

      if (result.kind === "missing") {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `No product matches barcode "${barcode}". Check the barcode or add it to the product record.`,
        });
        return;
      }

      if (result.kind === "duplicate") {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `Barcode "${barcode}" is assigned to more than one product. An administrator must resolve the duplicate.`,
        });
        return;
      }

      const product = result.product;

      setMatchedProductId(product.id);

      setMessage(
        product.quantity > 0
          ? {
              kind: "success",
              text: "Product found. Confirm it to add it to the sale.",
            }
          : {
              kind: "error",
              text: "Product found, but it is out of stock.",
            },
      );
    },
    [findProduct],
  );

  const handleConfirm = useCallback(() => {
    if (!matchedProduct || disabled || matchedProduct.quantity <= 0) {
      return;
    }

    const added = onConfirmAdd(matchedProduct.id, 1);

    if (!added) {
      setMessage({
        kind: "error",
        text: `Could not add ${matchedProduct.name} to the current sale.`,
      });
      return;
    }

    setBarcodeInput("");
    setMatchedProductId(null);
    setMessage({
      kind: "success",
      text: `${matchedProduct.name} added to the current sale.`,
    });

    inputRef.current?.focus();
  }, [matchedProduct, disabled, onConfirmAdd]);

  const handleClear = useCallback(() => {
    setBarcodeInput("");
    setMatchedProductId(null);
    setMessage(null);
    inputRef.current?.focus();
  }, []);

  return (
    <section
      aria-label="Scan product barcode"
      className="mb-4 rounded-2xl border border-teal-400/20 bg-teal-400/[0.05] p-3 sm:p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 text-teal-300">
          <Barcode className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white">Scan to sell</h2>
          <p className="text-xs text-gray-400">
            Scanner reads are added immediately. Manual entries can be checked
            before adding.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          lookupBarcode(barcodeInput);
        }}
        className="flex gap-2"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Product barcode</span>

          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

          <input
            ref={inputRef}
            data-barcode-input
            value={barcodeInput}
            onChange={(event) => {
              setBarcodeInput(event.target.value);
              setMatchedProductId(null);
              setMessage(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") handleClear();
            }}
            placeholder="Scan barcode or enter code…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={disabled}
            className="h-12 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-teal-400/60"
          />
        </label>

        <button
          type="submit"
          disabled={disabled || !barcodeInput.trim()}
          className="h-12 shrink-0 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Find
        </button>
      </form>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`mt-3 flex items-start gap-2 text-xs ${
            message.kind === "error"
              ? "text-red-300"
              : message.kind === "success"
                ? "text-emerald-300"
                : "text-gray-300"
          }`}
        >
          {message.kind === "error" ? (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>{message.text}</span>
        </p>
      )}

      {matchedProduct && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-300">
              <Package className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold text-white">
                {matchedProduct.name}
              </p>

              <p className="mt-1 break-all text-xs text-gray-400">
                Barcode: {matchedProduct.barcode}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-lg font-bold text-emerald-300">
                  {formatNaira(matchedProduct.price)}
                </span>

                <span
                  className={`text-xs ${
                    matchedProduct.quantity > 0
                      ? "text-gray-400"
                      : "text-red-300"
                  }`}
                >
                  {matchedProduct.quantity} in stock
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled || matchedProduct.quantity <= 0}
            onClick={handleConfirm}
            className="mt-3 h-11 w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm product · Add 1 to sale
          </button>
        </div>
      )}
    </section>
  );
}