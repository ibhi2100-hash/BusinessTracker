"use client";

import {
  ShoppingCart,
  CreditCard,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/ui/MetricCard";
import { useDashboardStore } from "@/src/store/DashboardStore";
import { useLiveDashboard } from "@/hooks/useLiveDashboard";
import { useBusinessContext } from "@/src/context/BusinessContext";

export function FinancialCarousel() {
   const { businessId, branchId, setBranchId, loading: ctxLoading } = useBusinessContext()
  const  { data } =  useLiveDashboard(branchId)
  const summary = data



  if (!summary) {
    return (
      <div
        className="
        flex
        gap-4
        overflow-x-auto
        py-4
        scrollbar-hide
      "
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="
            min-w-[260px]
            h-[120px]
            rounded-3xl
            animate-pulse
            bg-white/[0.04]
            border
            border-white/10
          "
          />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      id: "todaySales",
      title: "Today's Sales",
      value: `₦${summary.todaySales.toLocaleString()}`,
      trend: "Sales recorded today",
      icon: (
        <ShoppingCart className="w-5 h-5" />
      ),
    },

    {
      id: "cashAtHand",
      title: "Cash at Hand",
      value: `₦${summary.cash.toLocaleString()}`,
      trend: "Available balance",
      icon: (
        <CreditCard className="w-5 h-5" />
      ),
    },

    {
      id: "inventoryValue",
      title: "Inventory Value",
      value: `₦${(
        summary.inventoryValue ?? 0
      ).toLocaleString()}`,
      trend: "Current stock value",
      icon: (
        <Package className="w-5 h-5" />
      ),
    },

    {
      id: "liabilities",
      title: "Liabilities",
      value: `₦${summary.liabilities.toLocaleString()}`,
      trend: "Outstanding obligations",
      icon: (
        <DollarSign className="w-5 h-5" />
      ),
    },

    {
      id: "netProfit",
      title: "Net Profit",
      value: `₦${(
        summary.netProfit ?? 0
      ).toLocaleString()}`,
      trend: "Profit after expenses",
      icon: (
        <TrendingUp className="w-5 h-5" />
      ),
    },
  ];

  return (
    <div
      className="
      flex
      gap-4
      overflow-x-auto
      snap-x
      snap-mandatory
      py-4
      scrollbar-hide
    "
    >
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="
          min-w-[280px]
          snap-start
        "
        >
          <MetricCard
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            icon={metric.icon}
          />
        </div>
      ))}
    </div>
  );
}