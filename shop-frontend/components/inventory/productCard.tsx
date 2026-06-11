"use client";

import { inventoryProduct } from "@/src/store/inventoryStore";
import { useRef, useState } from "react";
import { DataCard } from "@/components/ui/DataCard";
import { StockBadge } from "@/components/ui/StockBadge";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { GlassButton } from "../ui/GlassButton";

interface Props {
  product: inventoryProduct;
  context: "sell" | "admin";
  onSell?: (productId: string, quantity: number) => void;
  onManage?: (product: inventoryProduct) => void;
  onDelete?: (productId: string) => void;
  onOpenQuantityModal?: (product: inventoryProduct) => void;
}

export default function ProductCard({
  product,
  context,
  onSell,
  onManage,
  onDelete,
  onOpenQuantityModal,
}: Props) {
  const business = useBusinessStore((s) => s.business);
  const branchId = useBranchStore((s) => s.activeBranchId);

  const outOfStock = product.quantity <= 0;
  const disabled = !business || !branchId;
  const blockInteraction = context === "sell" && outOfStock || disabled;

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  // ---------------------------
  // SELL GESTURE
  // ---------------------------
  const handlePressStart = () => {
    if (context !== "sell" || blockInteraction) return;

    longPressTriggered.current = false;

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      onOpenQuantityModal?.(product);
    }, 450);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);

    if (!longPressTriggered.current && context === "sell" && onSell && !blockInteraction) {
      onSell(product.id, 1);
    }
  };

  const handleCancel = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // ---------------------------
  // iOS / FUTURISTIC CARD STYLE
  // ---------------------------
  const base =
    "relative select-none overflow-hidden rounded-3xl transition-all duration-200 active:scale-[0.97]";

  const glass =
    "backdrop-blur-xl border border-white/40";

  const shadow = outOfStock
    ? "shadow-[0_0_25px_rgba(239,68,68,0.25)]"
    : "shadow-[0_10px_30px_rgba(0,0,0,0.08)]";

  const disabledStyle = blockInteraction ? "opacity-60" : "cursor-pointer";

  return (
   
      <DataCard
      title={product.name}
      subtitle={product.category}
      badge={
        <StockBadge quantity={product.quantity} />
      }
      metrics={[
        {
          label: "Selling",
          value: `₦${product.price.toLocaleString()}`
        },
        {
          label: "Stock",
          value: product.quantity
        },
        {
          label: "Cost",
          value: `₦${product.costPrice.toLocaleString()}`
        },
        {
          label: "Margin",
          value: `₦${(
            product.price -
            product.costPrice
          ).toLocaleString()}`
        }
      ]}
      actions={
        <>
          <GlassButton
            variant="secondary"
            onClick={() => onManage?.(product)}
          >
            Manage
          </GlassButton>

          <GlassButton
            variant="danger"
            onClick={() => onDelete?.(product.id)}
          >
            Delete
          </GlassButton>
        </>
      }
    />
  );
}