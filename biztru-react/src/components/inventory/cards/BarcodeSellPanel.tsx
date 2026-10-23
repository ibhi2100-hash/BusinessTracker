import { useCallback, useMemo, useRef, useState } from "react";
import { Barcode, CheckCircle2, Package, Search, XCircle } from "lucide-react";
import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface BarcodeSellPanelProps {
  products: LiveProduct[];
  disabled?: boolean;
  onConfirmAdd: (productId: string, quantity: number) => boolean;
}

function normalizeBarcode(value: string): string {
  // Preserve leading zeroes; trim only scanner-added surrounding whitespace.
  return value.trim();
}

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function BarcodeSellPanel({
  products,
  disabled = false,
  onConfirmAdd,
}: BarcodeSellPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [matchedProductId, setMatchedProductId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    kind: "error" | "success" | "info";
    text: string;
  } | null>(null);

  // Build once per product projection update, rather than scanning the entire
  // product array for every keystroke. Duplicate barcodes are detected explicitly.
  const productsByBarcode = useMemo(() => {
    const index = new Map<string, LiveProduct[]>();

    for (const product of products) {
      const barcode = normalizeBarcode(product.barcode ?? "");
      if (!barcode) continue;

      const key = barcode.toLocaleLowerCase();
      const matches = index.get(key) ?? [];
      matches.push(product);
      index.set(key, matches);
    }

    return index;
  }, [products]);

  const matchedProduct = useMemo(
    () => products.find((product) => product.id === matchedProductId) ?? null,
    [products, matchedProductId],
  );

  const lookupBarcode = useCallback(
    (rawValue: string) => {
      const barcode = normalizeBarcode(rawValue);

      if (!barcode) {
        setMessage({ kind: "error", text: "Scan a barcode or type it in first." });
        return;
      }

      const matches = productsByBarcode.get(barcode.toLocaleLowerCase()) ?? [];

      if (matches.length === 0) {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `No product matches barcode “${barcode}”. Check the barcode or add it to the product record.`,
        });
        return;
      }

      if (matches.length > 1) {
        setMatchedProductId(null);
        setMessage({
          kind: "error",
          text: `Barcode “${barcode}” is assigned to more than one product. An administrator must fix the duplicate before selling.`,
        });
        return;
      }

      const product = matches[0];

      if (!product) {
        setMatchedProductId(null);
        setMessage({ kind: "error", text: "Product lookup failed. Scan again." });
        return;
      }

      setMatchedProductId(product.id);
      setMessage(
        product.quantity > 0
          ? { kind: "success", text: "Product found. Confirm it before adding it to the sale." }
          : { kind: "error", text: "Product found, but it is out of stock." },
      );
    },
    [productsByBarcode],
  );

  const handleConfirm = useCallback(() => {
    if (!matchedProduct || disabled || matchedProduct.quantity <= 0) return;

    const added = onConfirmAdd(matchedProduct.id, 1);
    if (!added) return;

    setBarcodeInput("");
    setMatchedProductId(null);
    setMessage({
      kind: "success",
      text: `${matchedProduct.name} added to the current sale.`,
    });

    // Keep the operator in the scan workflow for the next item.
    requestAnimationFrame(() => inputRef.current?.focus());
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
            Scan with a USB/Bluetooth barcode reader, then confirm the product.
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
            value={barcodeInput}
            onChange={(event) => {
              setBarcodeInput(event.target.value);
              setMatchedProductId(null);
              setMessage(null);
            }}
            onKeyDown={(event) => {
              // Most handheld scanners type the barcode and send Enter.
              // Do not intercept ordinary keystrokes before the terminator.
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
                    matchedProduct.quantity > 0 ? "text-gray-400" : "text-red-300"
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
