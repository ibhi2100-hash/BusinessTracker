"use client";

import { useRef } from "react";
import {
  Package,
  AlertTriangle,
  Zap,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { inventoryProduct } from "@/src/store/inventoryStore";
import { cn } from "@/lib/utils";

interface SellCardProps {
  product: inventoryProduct;

  disabled?: boolean;

  onSell?: (
    productId: string,
    quantity: number
  ) => void;

  onOpenQuantityModal?: (
    product: inventoryProduct
  ) => void;
}

export default function SellCard({
  product,
  disabled,
  onSell,
  onOpenQuantityModal,
}: SellCardProps) {
  const outOfStock = product.quantity <= 0;

  const blocked =
    disabled || outOfStock;

  const pressTimer =
    useRef<NodeJS.Timeout | null>(null);

  const longPressTriggered =
    useRef(false);

  const handlePressStart = () => {
    if (blocked) return;

    longPressTriggered.current = false;

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      onOpenQuantityModal?.(
        product
      );
    }, 450);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }

    if (
      !longPressTriggered.current &&
      !blocked
    ) {
      onSell?.(
        product.id,
        1
      );
    }
  };

  const handleCancel = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  return (
    <GlassCard
      className={cn(
        `
        relative
        p-4
        select-none
        transition-all
        duration-200
        active:scale-[0.97]
        `,
        blocked
          ? "opacity-50"
          : "cursor-pointer hover:bg-white/[0.08]"
      )}
    >
      <div
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handleCancel}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handleCancel}
      >
        {/* STATUS */}

        <div className="flex items-start justify-between">
          <div
            className="
            w-10
            h-10
            rounded-2xl
            bg-white/[0.05]
            border
            border-white/10
            flex
            items-center
            justify-center
            "
          >
            <Package
              className="w-5 h-5"
            />
          </div>

          {outOfStock ? (
            <div
              className="
              flex
              items-center
              gap-1
              px-2
              py-1
              rounded-full
              text-[10px]
              bg-red-500/10
              border
              border-red-500/20
              text-red-400
              "
            >
              <AlertTriangle className="w-3 h-3" />
              Out
            </div>
          ) : (
            <div
              className="
              flex
              items-center
              gap-1
              px-2
              py-1
              rounded-full
              text-[10px]
              bg-emerald-500/10
              border
              border-emerald-500/20
              text-emerald-400
              "
            >
              <Zap className="w-3 h-3" />
              Tap
            </div>
          )}
        </div>

        {/* PRODUCT */}

        <div className="mt-4">
          <h3
            className="
            text-sm
            font-semibold
            line-clamp-2
            "
          >
            {product.name}
          </h3>

          <p
            className="
            mt-1
            text-xs
            text-gray-400
            "
          >
            {product.quantity} in stock
          </p>
        </div>

        {/* PRICE */}

        <div className="mt-5">
          <p
            className="
            text-2xl
            font-bold
            tracking-tight
            text-emerald-400
            "
          >
            ₦
            {product.price.toLocaleString()}
          </p>
        </div>

        {/* LONG PRESS HINT */}

        {!outOfStock && (
          <div
            className="
            mt-4
            text-[10px]
            text-gray-500
            "
          >
            Tap = +1 sale • Hold = quantity
          </div>
        )}
      </div>
    </GlassCard>
  );
}