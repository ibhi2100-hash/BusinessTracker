"use client";

import { useFinancialStore } from "@/store/financialDataStore";
import {
  ShoppingCart,
  CreditCard,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeloton"; // optional: create a simple Skeleton component

export function FinancialCarousel() {
const summary = useFinancialStore((state) => state.summary) 
  // If data isn't ready, show skeleton cards
  if (!summary) {
    return (
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[260px] snap-start bg-gray-100 animate-pulse p-5 rounded-3xl shadow-lg flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Map store data to cards
  const cards = [
    {
      title: "Today's Sales",
      value: `₦${summary.todaySales?.toLocaleString()}`,
      change: "vs yesterday",
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      color: "from-blue-100 to-blue-50",
    },
    {
      title: "Cash at Hand",
      value: `₦${summary.cashAtHand?.toLocaleString()}`,
      change: "Updated just now",
      icon: <CreditCard className="w-6 h-6 text-green-600" />,
      color: "from-green-100 to-green-50",
    },
    {
      title: "Inventory Value",
      value: `₦${summary.inventoryValue?.toLocaleString()}`,
      change: "Across all products",
      icon: <Package className="w-6 h-6 text-yellow-600" />,
      color: "from-yellow-100 to-yellow-50",
    },
    {
      title: "Outstanding Liabilities",
      value: `₦${summary.outstandingLiabilities?.toLocaleString()}`,
      change: "Active liabilities",
      icon: <DollarSign className="w-6 h-6 text-red-600" />,
      color: "from-red-100 to-red-50",
    },
    {
      title: "Net Profit",
      value: `₦${summary.netProfit?.toLocaleString()}`,
      change: "For the selected period",
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: "from-purple-100 to-purple-50",
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-hide">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`min-w-[260px] snap-start bg-gradient-to-br ${card.color} p-5 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-semibold">{card.title}</p>
            <div className="p-2 bg-white/30 rounded-full">{card.icon}</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">{card.value}</h2>
          <p className="text-sm text-gray-500">{card.change}</p>
        </div>
      ))}
    </div>
  );
}