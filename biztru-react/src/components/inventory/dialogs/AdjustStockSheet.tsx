
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet";
import { GlassInput } from "../../ui/GlassInput";
import { GlassButton } from "../../ui/GlassButton";

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

  product: {
    id: string;
    name: string;
    quantity: number;
  } | null;

  onSubmit: (
    direction: "increase" | "decrease",
    quantity: number,
    reason: string
  ) => void | Promise<void>;
}

export default function AdjustStockSheet({
  open,
  onClose,
  loading = false,
  product,
  onSubmit,
}: Props) {
  const [direction, setDirection] =
    useState<"increase" | "decrease">("increase");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const busy = loading || submitting;

  useEffect(() => {
    if (!open || !product) return;

    setDirection("increase");
    setQuantity("");
    setReason("");
    setSubmitting(false);
  }, [open, product?.id]);

  if (!open || !product) return null;

  const currentStock = Number.isFinite(product.quantity)
    ? Math.max(0, product.quantity)
    : 0;

  const adjustmentQuantity = parseStockNumber(quantity);

  const projectedStock =
    direction === "increase"
      ? currentStock + adjustmentQuantity
      : currentStock - adjustmentQuantity;

  const exceedsStock =
    direction === "decrease" &&
    adjustmentQuantity > currentStock;

  const valid =
    isValidStockQuantity(adjustmentQuantity) &&
    !exceedsStock &&
    Number.isSafeInteger(projectedStock) &&
    projectedStock >= 0 &&
    reason.trim().length > 0;

  const handleClose = () => {
    if (busy) return;

    setQuantity("");
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!valid || busy) return;

    setSubmitting(true);

    try {
      await onSubmit(
        direction,
        adjustmentQuantity,
        reason.trim()
      );

      setQuantity("");
      setReason("");
      setDirection("increase");
    } catch {
      // Preserve form values.
      // The parent handles displaying submission errors.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title="Adjust Stock"
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

        {/* ADJUSTMENT DIRECTION */}

        <section className="space-y-3">
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
            Adjustment type
          </label>

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              disabled={busy}
              onClick={() => setDirection("increase")}
              aria-pressed={direction === "increase"}
              className={`
                flex
                min-h-16
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                font-semibold
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${
                  direction === "increase"
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.08)]"
                    : "border-white/10 bg-white/[0.025] text-gray-400 hover:bg-white/5"
                }
              `}
            >
              <ArrowUp size={19} />
              Increase
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setDirection("decrease")}
              aria-pressed={direction === "decrease"}
              className={`
                flex
                min-h-16
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                font-semibold
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${
                  direction === "decrease"
                    ? "border-red-400/40 bg-red-400/10 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.08)]"
                    : "border-white/10 bg-white/[0.025] text-gray-400 hover:bg-white/5"
                }
              `}
            >
              <ArrowDown size={19} />
              Decrease
            </button>

          </div>
        </section>

        {/* QUANTITY */}

        <StockSheetNumberField
          label="Adjustment quantity"
          value={quantity}
          onChange={setQuantity}
          accent={direction === "increase" ? "emerald" : "blue"}
          prefix="#"
          placeholder="0"
          helper={
            direction === "increase"
              ? "Units being added to inventory"
              : "Units being removed from inventory"
          }
          disabled={busy}
          ariaLabel="Adjustment quantity"
        />

        {/* PROJECTED STOCK */}

        {adjustmentQuantity > 0 && (
          <section className={`
            rounded-2xl
            border
            p-4
            ${
              exceedsStock
                ? "border-red-400/20 bg-red-400/5"
                : "border-white/10 bg-white/[0.025]"
            }
          `}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Projected stock
              </span>

              <div className="flex items-center gap-2">
                {direction === "increase" ? (
                  <TrendingUp size={17} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={17} className="text-red-400" />
                )}

                <span className={`
                  text-xl
                  font-bold
                  ${
                    exceedsStock
                      ? "text-red-300"
                      : "text-white"
                  }
                `}>
                  {formatStockNumber(String(projectedStock))}
                </span>
              </div>
            </div>

            {exceedsStock && (
              <p className="mt-2 text-xs text-red-300">
                You cannot remove more units than the available stock.
              </p>
            )}
          </section>
        )}

        {/* REASON */}

        <section className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
            Adjustment reason
          </label>

          <GlassInput
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Damaged goods, stock correction..."
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
            "Applying Adjustment..."
          ) : (
            <>
              <AlertTriangle size={18} />
              Apply Adjustment
            </>
          )}
        </GlassButton>

      </div>
    </GlassSheet>
  );
}
