"use client";

import { useState } from "react";
import { ArrowDownToLine, Package, DollarSign } from "lucide-react";

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
    quantity: number,
    costPrice: number,
    note?: string
  ) => void;
}

export default function ReceiveStockSheet({
  open,
  onClose,
  loading,
  product,
  onSubmit,
}: Props) {
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [note, setNote] = useState("");

  if (!open || !product) return null;

  const valid =
    Number(quantity) > 0 && Number(costPrice) > 0;

  const handleSubmit = () => {
    if (!valid) return;

    onSubmit(
      Number(quantity),
      Number(costPrice),
      note
    );

    setQuantity("");
    setCostPrice("");
    setNote("");
  };

  return (
    <GlassSheet
      open={open}
      onClose={onClose}
      title="Receive Stock"
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

        <GlassInput
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          icon={<Package size={18} />}
          placeholder="Quantity Received"
        />

        <GlassInput
          type="number"
          value={costPrice}
          onChange={(e) =>
            setCostPrice(e.target.value)
          }
          icon={<DollarSign size={18} />}
          placeholder="Purchase Cost (optional)"
        />

        <GlassInput
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          placeholder="Reference Note"
        />

        <GlassButton
          className="w-full"
          disabled={!valid || loading}
          onClick={handleSubmit}
        >
          <ArrowDownToLine size={18} />
          Receive Stock
        </GlassButton>

      </div>
    </GlassSheet>
  );
}