"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Minus,
  Zap,
  ShoppingCart,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { GlassButton } from "@/components/ui/GlassButton";
import { StockBadge } from "@/components/ui/StockBadge";
import { cn } from "@/lib/utils";
import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface SellCardProps {
  product: LiveProduct;
  cartQuantity?: number;
  disabled?: boolean;
  onAddToCart?: (productId: string, quantity: number) => void;
  onChangeCartQuantity?: (productId: string, quantity: number) => void;
  onQuickSell?: (productId: string, quantity: number) => void;
}

export default function SellCard({
  product,
  cartQuantity = 0,
  disabled = false,
  onAddToCart,
  onQuickSell,
}: SellCardProps) {
  const outOfStock = product.quantity <= 0;
  const blocked = disabled || outOfStock;
  const inCart = cartQuantity > 0;

  // Always controls "how many I want to add right now"
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");

  const maximumQuantity = product.quantity;

  const normalizeQuantity = (value: number) => {
    if (!Number.isFinite(value)) return 1;
    return Math.min(maximumQuantity, Math.max(1, Math.floor(value)));
  };

  const getCurrentQuantity = () => {
    const parsed = Number(quantityInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return 1;
    return normalizeQuantity(parsed);
  };

  const handleQuantityDecrease = (e: React.PointerEvent) => {
    e.stopPropagation();
    const next = Math.max(1, getCurrentQuantity() - 1);
    setSelectedQuantity(next);
    setQuantityInput(String(next));
  };

  const handleQuantityIncrease = (e: React.PointerEvent) => {
    e.stopPropagation();
    const current = getCurrentQuantity();
    if (current >= maximumQuantity) return;
    const next = current + 1;
    setSelectedQuantity(next);
    setQuantityInput(String(next));
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const raw = e.target.value;
    if (raw !== "" && !/^\d+$/.test(raw)) return;
    setQuantityInput(raw);
  };

  const commitQuantityInput = () => {
    const normalized = normalizeQuantity(Number(quantityInput));
    setSelectedQuantity(normalized);
    setQuantityInput(String(normalized));
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const handleAdd = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (blocked) return;

    const quantity = normalizeQuantity(selectedQuantity);
    if (quantity <= 0) return;

    onAddToCart?.(product.id, quantity);

    // Reset so next add starts at 1
    setSelectedQuantity(1);
    setQuantityInput("1");
  };

  const handleQuickSell = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (blocked) return;
    onQuickSell?.(product.id, 1);
  };

  const canIncrease = !blocked && selectedQuantity < maximumQuantity;
  const canDecrease = selectedQuantity > 1;

  return (
    <GlassCard
      variant="default"
      className={cn(
        "relative overflow-hidden p-4 select-none transition-all duration-200",
        blocked ? "opacity-50" : "hover:bg-white/[0.06]"
      )}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-3">
        <GlassIcon size="sm" variant="primary">
          <Package className="w-4 h-4" />
        </GlassIcon>

        <div className="flex flex-col items-end gap-1.5">
          <StockBadge quantity={product.quantity} />

          {inCart && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-300">
              <ShoppingCart className="w-3 h-3" />
              {cartQuantity} in cart
            </div>
          )}
        </div>
      </div>

      {/* ================= PRODUCT ================= */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          {product.quantity} in stock
        </p>
      </div>

      {/* ================= PRICE ================= */}
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-emerald-400">
          ₦{product.price.toLocaleString()}
        </p>

        {inCart && (
          <p className="mt-1 text-xs text-teal-400/80">
            ₦{(product.price * cartQuantity).toLocaleString()} already in cart
          </p>
        )}
      </div>

      {/* ================= QUANTITY SELECTOR ================= */}
      {!outOfStock && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Quantity to add
            </span>
            <span className="text-[10px] text-gray-400">
              Max {product.quantity}
            </span>
          </div>

          <div className="flex items-center h-12 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden backdrop-blur-sm">
            <button
              type="button"
              disabled={!canDecrease}
              onPointerUp={handleQuantityDecrease}
              className="w-12 h-full shrink-0 flex items-center justify-center text-gray-300 hover:bg-white/[0.08] active:scale-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantityInput}
              onChange={handleQuantityInput}
              onBlur={commitQuantityInput}
              onKeyDown={handleQuantityKeyDown}
              disabled={blocked}
              className="min-w-0 flex-1 h-full bg-transparent text-center text-base font-bold text-white outline-none"
              aria-label={`Quantity for ${product.name}`}
            />

            <button
              type="button"
              disabled={!canIncrease}
              onPointerUp={handleQuantityIncrease}
              className="w-12 h-full shrink-0 flex items-center justify-center text-gray-300 hover:bg-white/[0.08] active:scale-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Increase quantity of ${product.name}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ACTIONS ================= */}
      <div className="mt-3 flex gap-2">
        <GlassButton
          variant="secondary"
          disabled={blocked}
          onPointerUp={handleAdd}
          className="flex-1 h-11"
          icon={<ShoppingCart className="w-4 h-4" />}
        >
          Add {selectedQuantity}
        </GlassButton>

        <GlassButton
          variant="success"
          disabled={blocked}
          onPointerUp={handleQuickSell}
          className="w-14 h-11 !px-0"
          icon={<Zap className="w-5 h-5" />}
          aria-label={`Quick sell one ${product.name}`}
        />
      </div>

      {/* ================= HINT ================= */}
      {!outOfStock && (
        <div className="mt-3 text-[10px] text-gray-500 text-center">
          {inCart
            ? "Add more or open cart to edit"
            : "Set quantity, then add to cart"}
        </div>
      )}
    </GlassCard>
  );
}