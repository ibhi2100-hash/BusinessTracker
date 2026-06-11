"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { GlassSheet } from "../ui/GlassSheet";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";

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
  ) => void;
}

export default function AdjustStockSheet({
  open,
  onClose,
  loading,
  product,
  onSubmit,
}: Props) {
  const [direction, setDirection] =
    useState<"increase" | "decrease">(
      "increase"
    );

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  if (!open || !product) return null;

  const valid =
    Number(quantity) > 0 &&
    reason.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) return;

    onSubmit(
      direction,
      Number(quantity),
      reason
    );

    setQuantity("");
    setReason("");
  };

  return (
    <GlassSheet
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      subtitle={product.name}
    >
      <div className="space-y-4">

        <div className="rounded-2xl border border-white/20 p-4 backdrop-blur-xl">
          <p className="text-sm opacity-70">
            Current Stock
          </p>

          <p className="text-3xl font-bold">
            {product.quantity}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">

          <GlassButton
            variant={
              direction === "increase"
                ? "primary"
                : "secondary"
            }
            onClick={() =>
              setDirection("increase")
            }
          >
            Increase
          </GlassButton>

          <GlassButton
            variant={
              direction === "decrease"
                ? "danger"
                : "secondary"
            }
            onClick={() =>
              setDirection("decrease")
            }
          >
            Decrease
          </GlassButton>

        </div>

        <GlassInput
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="Adjustment Quantity"
        />

        <GlassInput
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          placeholder="Reason"
        />

        <GlassButton
          className="w-full"
          disabled={!valid || loading}
          onClick={handleSubmit}
        >
          <AlertTriangle size={18} />
          Apply Adjustment
        </GlassButton>

      </div>
    </GlassSheet>
  );
}