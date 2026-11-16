
import {
  ShoppingCart,
  CreditCard,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "../ui/MetricCard";
import { useLiveDashboard } from "../../hooks/useLiveDashboard";
import { useParams } from "react-router-dom";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

export function FinancialCarousel() {
  // Branch ID supplied by /branch/:branchId
  const { branchId: routeBranchId } = useParams<{
    branchId: string;
  }>();

  // Branch ID supplied by the normal manager branch context
  const { branchId: contextBranchId } = useBusinessContext();

  // URL branch takes priority; otherwise use the active branch context.
  const branchId = routeBranchId ?? contextBranchId;

  const { data, loading, error } = useLiveDashboard(branchId);

  const summary = data;

  if (loading || !summary) {
    return (
      <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="
              min-w-65
              h-30
              rounded-3xl
              animate-pulse
              bg-white/4
              border
              border-white/10
            "
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
        Unable to load branch financial data.
      </div>
    );
  }

  const metrics = [
    {
      id: "todaySales",
      title: "Today's Sales",
      value: `₦${(summary.todaySales ?? 0).toLocaleString()}`,
      trend: "Sales recorded today",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: "cashAtHand",
      title: "Cash at Hand",
      value: `₦${(summary.cash ?? 0).toLocaleString()}`,
      trend: "Available balance",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "inventoryValue",
      title: "Inventory Value",
      value: `₦${(summary.inventoryValue ?? 0).toLocaleString()}`,
      trend: "Current stock value",
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: "liabilities",
      title: "Liabilities",
      value: `₦${(summary.liabilities ?? 0).toLocaleString()}`,
      trend: "Outstanding obligations",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: "netProfit",
      title: "Net Profit",
      value: `₦${(summary.netProfit ?? 0).toLocaleString()}`,
      trend: "Profit after expenses",
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="min-w-70 snap-start"
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
