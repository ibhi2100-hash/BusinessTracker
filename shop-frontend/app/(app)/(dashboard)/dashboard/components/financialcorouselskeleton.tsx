// components/dashboard/FinancialCarouselSkeleton.tsx
"use client";

import { ShoppingCart, CreditCard, Package, DollarSign, TrendingUp } from "lucide-react";

export function FinancialCarouselSkeleton() {
  const cards = [
    { title: "Today's Sales", icon: <ShoppingCart className="w-6 h-6 text-gray-300" /> },
    { title: "Cash at Hand", icon: <CreditCard className="w-6 h-6 text-gray-300" /> },
    { title: "Inventory Value", icon: <Package className="w-6 h-6 text-gray-300" /> },
    { title: "Outstanding Liabilities", icon: <DollarSign className="w-6 h-6 text-gray-300" /> },
    { title: "Net Profit", icon: <TrendingUp className="w-6 h-6 text-gray-300" /> },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-hide">
      {cards.map((card, i) => (
        <div
          key={i}
          className="min-w-[260px] snap-start bg-gray-100 p-5 rounded-3xl shadow-lg animate-pulse flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <p className="h-4 w-24 bg-gray-300 rounded"></p>
            <div className="p-2 bg-gray-200 rounded-full">{card.icon}</div>
          </div>
          <div className="h-8 w-32 bg-gray-300 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}