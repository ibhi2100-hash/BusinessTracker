"use client";

import { Product } from "@/types/types";
import { useRef } from "react";
import {
  Edit2,
  Trash2,
  Tag,
  Package,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";

interface Props {
  product: any;
  context: "sell" | "admin";
  onSell?: (productId: string, quantity: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onOpenQuantityModal?: (product: Product) => void;
}

export default function ProductCard({
  product,
  context,
  onSell,
  onEdit,
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
    "bg-white/80 backdrop-blur-xl border border-white/40";

  const shadow = outOfStock
    ? "shadow-[0_0_25px_rgba(239,68,68,0.25)]"
    : "shadow-[0_10px_30px_rgba(0,0,0,0.08)]";

  const disabledStyle = blockInteraction ? "opacity-60" : "cursor-pointer";

  return (
    <div
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handleCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handleCancel}
      className={`${base} ${glass} ${shadow} ${disabledStyle}`}
    >
      {/* OUT OF STOCK BADGE */}
      {outOfStock && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-500/90 text-white text-[11px] px-2 py-1 rounded-full backdrop-blur">
          <AlertTriangle className="w-3 h-3" />
          Sold out
        </div>
      )}

      {/* QUICK SELL INDICATOR */}
      {context === "sell" && !outOfStock && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-green-500/90 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur">
          <Zap className="w-3 h-3" />
          Tap to sell
        </div>
      )}

      {/* IMAGE */}
      <div className="relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-44 object-cover"
          />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
            <Package className="w-6 h-6" />
          </div>
        )}

        {/* PRICE FLOAT */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded-xl backdrop-blur flex items-center gap-1">
          <Tag className="w-3 h-3" />
          ₦{product.price.toLocaleString()}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3.5 flex flex-col gap-2">
        {/* NAME */}
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* STOCK */}
        <div className={`flex items-center gap-2 text-xs font-medium ${
          outOfStock ? "text-red-500" : "text-gray-600"
        }`}>
          <Package className="w-4 h-4" />
          {outOfStock
            ? "Out of stock"
            : `${product.quantity} in stock`}
        </div>

        {/* ADMIN ACTIONS */}
        {context === "admin" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="flex-1 bg-yellow-500 text-white py-2.5 rounded-2xl text-sm flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product.id);
              }}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}