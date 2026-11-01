
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Package,
  TrendingUp,
  Banknote,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet";
import { GlassInput } from "../../ui/GlassInput";
import { GlassButton } from "../../ui/GlassButton";

import type {
  LiveProduct,
} from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

import {
  StockSheetNumberField,
  formatStockNumber,
  parseStockNumber,
  isValidStockQuantity,
} from "./StockSheetNumberField";

interface Props {
  open: boolean;
  onClose: () => void;
  loading?: boolean;

  product: LiveProduct | null;

  onSubmit: (
    quantity: number,
    costPrice: number,
    note?: string
  ) => void | Promise<void>;
}

export default function ReceiveStockSheet({
  open,
  onClose,
  loading = false,
  product,
  onSubmit,
}: Props) {
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const busy = loading || submitting;

  useEffect(() => {
    if (!open || !product) return;

    setQuantity("");
    setCostPrice("");
    setNote("");
    setSubmitting(false);
  }, [open, product?.id]);

  if (!open || !product) return null;

  const currentStock = Number.isFinite(product.quantity)
    ? Math.max(0, product.quantity)
    : 0;

  const receivedQuantity = parseStockNumber(quantity);
  const purchaseCost = parseStockNumber(costPrice);

  const projectedStock =
    currentStock + receivedQuantity;

  const totalPurchaseCost =
    receivedQuantity * purchaseCost;

  const valid =
    isValidStockQuantity(receivedQuantity) &&
    Number.isSafeInteger(projectedStock) &&
    Number.isFinite(totalPurchaseCost) &&
    totalPurchaseCost >= 0 &&
    Number.isSafeInteger(purchaseCost);

  const handleClose = () => {
    if (busy) return;

    setQuantity("");
    setCostPrice("");
    setNote("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!valid || busy) return;

    setSubmitting(true);

    try {
      await onSubmit(
        receivedQuantity,
        purchaseCost,
        note.trim() || undefined
      );

      setQuantity("");
      setCostPrice("");
      setNote("");
    } catch {
      // Keep entered values if submission fails.
      // The parent handles displaying errors.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title="Receive Stock"
      subtitle={product.name}
      className="
        w-full
        sm:max-w-xl
        lg:max-w-2xl
        xl:max-w-3xl
      "
    >
      <div className="space-y-7 pb-4">

        {/* CURRENT INVENTORY */}

        <section className="
          rounded-[26px]
          border
          border-white/10
          bg-white/[0.025]
          p-5
          backdrop-blur-xl
        ">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Current stock
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {formatStockNumber(String(currentStock))}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Available inventory units
              </p>
            </div>

            <div className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-400/20
              bg-blue-400/10
              text-blue-300
            ">
              <Package size={25} />
            </div>

          </div>
        </section>

        {/* QUANTITY RECEIVED */}

        <StockSheetNumberField
          label="Quantity received"
          value={quantity}
          onChange={setQuantity}
          accent="blue"
          prefix="#"
          placeholder="0"
          helper="Number of units entering inventory"
          disabled={busy}
          ariaLabel="Quantity received"
        />

        {/* PURCHASE COST */}

        <StockSheetNumberField
          label="Purchase cost per unit"
          value={costPrice}
          onChange={setCostPrice}
          accent="amber"
          prefix="₦"
          placeholder="0"
          helper="Optional purchase cost per unit"
          disabled={busy}
          ariaLabel="Purchase cost per unit"
        />

        {/* INVENTORY PREVIEW */}

        {receivedQuantity > 0 && (
          <section className="
            space-y-3
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-4
          ">

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Current stock
              </span>

              <span className="text-sm font-medium text-gray-300">
                {formatStockNumber(String(currentStock))}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Incoming stock
              </span>

              <span className="text-sm font-medium text-emerald-300">
                +{formatStockNumber(String(receivedQuantity))}
              </span>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />

                <span className="text-xs text-gray-400">
                  Projected stock
                </span>
              </div>

              <span className="text-xl font-bold text-white">
                {formatStockNumber(String(projectedStock))}
              </span>
            </div>

            {purchaseCost > 0 && (
              <>
                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-amber-400" />

                    <span className="text-xs text-gray-500">
                      Total purchase cost
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-amber-300">
                    ₦{formatStockNumber(String(totalPurchaseCost))}
                  </span>
                </div>
              </>
            )}

          </section>
        )}

        {/* REFERENCE NOTE */}

        <section className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
            Reference note
          </label>

          <GlassInput
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Supplier invoice, purchase reference..."
            disabled={busy}
            autoComplete="off"
            className="h-14 rounded-2xl"
          />
        </section>

        {/* SUBMIT */}

        <GlassButton
          className="
            h-13
            w-full
            rounded-2xl
            font-semibold
            shadow-[0_8px_30px_rgba(255,255,255,0.06)]
            transition
            active:scale-[0.98]
          "
          disabled={!valid || busy}
          onClick={handleSubmit}
        >
          {busy ? (
            "Receiving Stock..."
          ) : (
            <>
              <ArrowDownToLine size={18} />
              Receive Stock
            </>
          )}
        </GlassButton>

      </div>
    </GlassSheet>
  );
}
