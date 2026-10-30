
import { useState } from "react";
import {
  Package,
  Plus,
  Minus,
  Zap,
  ShoppingCart,
  Handshake,
  Check,
  RotateCcw,
  TrendingDown,
  ChevronDown,
  Tag,
} from "lucide-react";

import { GlassCard } from "../../ui/GlassCard";
import { GlassIcon } from "../../ui/GlassIcon";
import { GlassButton } from "../../ui/GlassButton";
import { StockBadge } from "../../ui/StockBadge";
import { cn } from "../../../lib/utils";

import type {
  LiveProduct,
} from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface SellCardProps {
  product: LiveProduct;
  cartQuantity?: number;
  disabled?: boolean;

  onAddToCart?: (
    productId: string,
    quantity: number,
    openCart?: boolean,
    negotiatedPrice?: number,
  ) => boolean | void;

  onChangeCartQuantity?: (
    productId: string,
    quantity: number,
  ) => void;

  onQuickSell?: (
    productId: string,
    quantity: number,
    negotiatedPrice?: number,
  ) => void;

  // Optional configuration from the parent.
  // Prefer an explicit product pricing policy when available.
  minimumSellingPrice?: number;
  negotiationEnabled?: boolean;
}

export default function SellCard({
  product,
  cartQuantity = 0,
  disabled = false,
  onAddToCart,
  onQuickSell,
  minimumSellingPrice,
  negotiationEnabled,
}: SellCardProps) {
  const outOfStock = product.quantity <= 0;
  const blocked = disabled || outOfStock;
  const inCart = cartQuantity > 0;

  // --------------------------------------------------
  // NEGOTIATION CONFIGURATION
  // --------------------------------------------------

  const category = product.category
    ?.trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  const categorySupportsNegotiation = [
    "buttonphone",
    "androidphone",
  ].includes(category ?? "");

  const canNegotiate =
    negotiationEnabled ?? categorySupportsNegotiation;

  const benchmarkPrice = product.price;

  const minimumPrice =
    minimumSellingPrice ?? benchmarkPrice;

  // --------------------------------------------------
  // LOCAL STATE
  // --------------------------------------------------

  const [selectedQuantity, setSelectedQuantity] =
    useState(1);

  const [quantityInput, setQuantityInput] =
    useState("1");

  const [negotiationOpen, setNegotiationOpen] =
    useState(false);

  const [priceInput, setPriceInput] =
    useState(String(benchmarkPrice));

  const [priceError, setPriceError] =
    useState("");

  const maximumQuantity = product.quantity;

  // --------------------------------------------------
  // QUANTITY
  // --------------------------------------------------

  const normalizeQuantity = (value: number) => {
    if (!Number.isFinite(value)) return 1;

    return Math.min(
      maximumQuantity,
      Math.max(1, Math.floor(value)),
    );
  };

  const getCurrentQuantity = () => {
    const parsed = Number(quantityInput);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 1;
    }

    return normalizeQuantity(parsed);
  };

  const handleQuantityDecrease = (
    e: React.PointerEvent,
  ) => {
    e.stopPropagation();

    const next = Math.max(
      1,
      getCurrentQuantity() - 1,
    );

    setSelectedQuantity(next);
    setQuantityInput(String(next));
  };

  const handleQuantityIncrease = (
    e: React.PointerEvent,
  ) => {
    e.stopPropagation();

    const current = getCurrentQuantity();

    if (current >= maximumQuantity) return;

    const next = current + 1;

    setSelectedQuantity(next);
    setQuantityInput(String(next));
  };

  const handleQuantityInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();

    const raw = e.target.value;

    if (raw !== "" && !/^\d+$/.test(raw)) return;

    setQuantityInput(raw);
  };

  const commitQuantityInput = () => {
    const normalized = normalizeQuantity(
      Number(quantityInput),
    );

    setSelectedQuantity(normalized);
    setQuantityInput(String(normalized));
  };

  const handleQuantityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // --------------------------------------------------
  // NEGOTIATED PRICE
  // --------------------------------------------------

  const negotiatedPrice = Number(priceInput);

  const validPrice =
    Number.isSafeInteger(negotiatedPrice) &&
    negotiatedPrice > 0 &&
    negotiatedPrice >= minimumPrice;

  const isDiscounted =
    validPrice && negotiatedPrice < benchmarkPrice;

  const formatPrice = (value: number) =>
    `₦${value.toLocaleString("en-NG")}`;

  const toggleNegotiation = (
    e: React.PointerEvent,
  ) => {
    e.stopPropagation();

    if (blocked || !canNegotiate) return;

    setNegotiationOpen((previous) => !previous);
    setPriceError("");
  };

  const handlePriceInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;

    if (raw !== "" && !/^\d+$/.test(raw)) return;

    setPriceInput(raw);
    setPriceError("");
  };

  const resetNegotiatedPrice = () => {
    setPriceInput(String(benchmarkPrice));
    setPriceError("");
  };

  const getSellingPrice = (): number | undefined => {
    if (!canNegotiate || !negotiationOpen) {
      return undefined;
    }

    if (!validPrice) {
      setPriceError(
        `Minimum permitted price is ${formatPrice(minimumPrice)}.`,
      );

      return undefined;
    }

    return negotiatedPrice;
  };

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const handleAdd = (e: React.PointerEvent) => {
    e.stopPropagation();

    if (blocked) return;

    const quantity = normalizeQuantity(
      selectedQuantity,
    );

    if (quantity <= 0) return;

    const price = getSellingPrice();

    if (
      canNegotiate &&
      negotiationOpen &&
      price === undefined
    ) {
      return;
    }

    onAddToCart?.(
      product.id,
      quantity,
      true,
      price,
    );

    setSelectedQuantity(1);
    setQuantityInput("1");

    resetNegotiatedPrice();
    setNegotiationOpen(false);
  };

  // --------------------------------------------------
  // QUICK SELL
  // --------------------------------------------------

  const handleQuickSell = (
    e: React.PointerEvent,
  ) => {
    e.stopPropagation();

    if (blocked) return;

    const price = getSellingPrice();

    if (
      canNegotiate &&
      negotiationOpen &&
      price === undefined
    ) {
      return;
    }

    onQuickSell?.(
      product.id,
      1,
      price,
    );
  };

  const canIncrease =
    !blocked &&
    selectedQuantity < maximumQuantity;

  const canDecrease = selectedQuantity > 1;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <GlassCard
      variant="default"
      className={cn(
        "relative overflow-hidden p-4 select-none",
        "transition-all duration-300",
        blocked
          ? "opacity-50"
          : "hover:bg-white/[0.06]",
        negotiationOpen &&
          "border border-amber-400/20 shadow-lg shadow-amber-500/[0.04]",
      )}
    >
      {/* HEADER */}
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

      {/* PRODUCT */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          {product.quantity} in stock
        </p>
      </div>

      {/* PRICE */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              {isDiscounted
                ? "Negotiated price"
                : "Selling price"}
            </p>

            <p
              className={cn(
                "text-2xl font-bold tracking-tight",
                isDiscounted
                  ? "text-amber-400"
                  : "text-emerald-400",
              )}
            >
              {formatPrice(
                negotiationOpen && validPrice
                  ? negotiatedPrice
                  : benchmarkPrice,
              )}
            </p>
          </div>

          {/* NEGOTIATION BUTTON */}
          {canNegotiate && (
            <button
              type="button"
              disabled={blocked}
              onPointerUp={toggleNegotiation}
              className={cn(
                "group flex items-center gap-2",
                "rounded-xl px-3 py-2.5",
                "border transition-all duration-200",
                negotiationOpen
                  ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                  : "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-300",
                "active:scale-95 disabled:opacity-30",
              )}
              aria-expanded={negotiationOpen}
              aria-label="Open price negotiation"
            >
              <Handshake className="w-4 h-4 transition-transform group-hover:scale-110" />

              <span className="text-[10px] font-semibold">
                {negotiationOpen ? "Negotiating" : "Negotiate"}
              </span>

              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  negotiationOpen && "rotate-180",
                )}
              />
            </button>
          )}
        </div>

        {isDiscounted && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-amber-400/80">
            <TrendingDown className="w-3 h-3" />

            {formatPrice(
              benchmarkPrice - negotiatedPrice,
            )}{" "}
            below benchmark
          </div>
        )}

        {inCart && (
          <p className="mt-2 text-xs text-teal-400/80">
            {formatPrice(
              (negotiationOpen && validPrice
                ? negotiatedPrice
                : benchmarkPrice) * cartQuantity,
            )}{" "}
            already in cart
          </p>
        )}
      </div>

      {/* NEGOTIATION PANEL */}
      {canNegotiate && (
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            negotiationOpen
              ? "grid-rows-[1fr] opacity-100 mt-4"
              : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none",
          )}
        >
          <div className="overflow-hidden min-h-0">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-400/10">
                    <Handshake className="w-4 h-4 text-amber-400" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Price negotiation
                    </p>

                    <p className="text-[10px] text-gray-500">
                      Enter the agreed customer price
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    resetNegotiatedPrice();
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
                  aria-label="Reset negotiated price"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <label className="block text-[10px] font-medium text-gray-400 mb-1.5">
                Agreed selling price (₦)
              </label>

              <div className="flex items-center h-12 rounded-xl bg-black/20 border border-white/10 focus-within:border-amber-400/50 transition-colors">
                <span className="pl-3 text-sm font-semibold text-amber-400">
                  ₦
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={handlePriceInput}
                  onPointerDown={(e) => e.stopPropagation()}
                  disabled={blocked}
                  className="min-w-0 flex-1 h-full px-2 bg-transparent text-base font-bold text-white outline-none"
                  placeholder="Enter agreed price"
                  aria-label="Negotiated selling price"
                />
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-[10px] text-gray-500">
                  Benchmark
                </span>

                <span className="text-[10px] text-gray-300 font-medium">
                  {formatPrice(benchmarkPrice)}
                </span>
              </div>

              {minimumSellingPrice !== undefined && (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">
                    Minimum permitted
                  </span>

                  <span className="text-[10px] text-gray-300 font-medium">
                    {formatPrice(minimumPrice)}
                  </span>
                </div>
              )}

              {priceError && (
                <div className="mt-2 flex items-start gap-1.5 text-[10px] text-red-400">
                  <TrendingDown className="w-3 h-3 shrink-0 mt-0.5" />
                  {priceError}
                </div>
              )}

              {!priceError && validPrice && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Price validation
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3" />
                    Within permitted range
                  </span>
                </div>
              )}

              {validPrice && negotiatedPrice > benchmarkPrice && (
                <p className="mt-2 text-[10px] text-emerald-400">
                  Selling above benchmark.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUANTITY */}
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
              className="w-12 h-full shrink-0 flex items-center justify-center text-gray-300 hover:bg-white/[0.08] active:scale-90 transition disabled:opacity-30"
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
              className="w-12 h-full shrink-0 flex items-center justify-center text-gray-300 hover:bg-white/[0.08] active:scale-90 transition disabled:opacity-30"
              aria-label={`Increase quantity of ${product.name}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIONS */}
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

      {/* FOOTER */}
      {!outOfStock && (
        <div className="mt-3 text-[10px] text-gray-500 text-center">
          {negotiationOpen
            ? "Confirm the agreed price before adding to cart"
            : canNegotiate
              ? "Set quantity or negotiate with your customer"
              : inCart
                ? "Add more or open cart to edit"
                : "Set quantity, then add to cart"}
        </div>
      )}
    </GlassCard>
  );
}
