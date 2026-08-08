// components/CartBar.tsx
"use client";

import { useCartStore } from "@/src/store/useCartStore";

interface Props {
  onCheckout: () => void;
}

export default function CartBar({ onCheckout }: Props) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) return null;

  return (
    <div className="
      fixed bottom-[64px] left-0 right-0
      px-4 py-3
      bg-white border-t shadow-xl
      flex items-center justify-between
      z-50
    ">
      <div>
        <p className="text-sm text-gray-500">
          {items.length} item(s)
        </p>
        <p className="font-bold text-lg">
          ₦{total.toLocaleString()}
        </p>
      </div>

      <button
        onClick={onCheckout}
        className="
          bg-green-600 text-white
          px-5 py-3 rounded-xl font-semibold
          active:scale-95 transition
        "
      >
        Checkout
      </button>
    </div>
  );
}