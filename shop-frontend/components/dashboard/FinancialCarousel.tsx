"use client";

import { useState } from "react";
import { useFinancialStore } from "@/store/financialDataStore";
import { BusinessActivationPanel } from "@/components/dashboard/BusinessActivationalPanel";
import { ShoppingCart, CreditCard, Package, DollarSign, TrendingUp, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/cardContent";

export function FinancialCarousel() {
  const dashboardSummary = useFinancialStore((state) => state.dashboardSummary);
  const cashAtHand = useFinancialStore((state) => state.reports.cashAtHand);
  const businessStatus = useFinancialStore((state) => state.businessStatus); // or useBusinessStatus hook
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const isLoading = !dashboardSummary;

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card className="min-w-[260px] snap-start animate-pulse h-32" />
        ))}
      </div>
    );
  }

  const cards = [
    businessStatus?.isOpening && {
      id: "activateBusiness",
      title: "Start Business Today",
      value: "🚀 Activate",
      subtitle: "Activate to begin real transactions",
      icon: <Rocket className="w-6 h-6 text-primary" />,
      onClick: () => {
        // Optionally trigger a modal or panel
        // Could also scroll to BusinessActivationPanel
        document.getElementById("businessActivation")?.scrollIntoView({ behavior: "smooth" });
      },
      gradient: "from-indigo-100 to-indigo-50",
      extra: "Complete setup and start all transactions."
    },
    {
      id: "todaySales",
      title: "Today's Sales",
      value: `₦${dashboardSummary.todaySales?.toLocaleString()}`,
      subtitle: "vs yesterday",
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      extra: "Detailed info about sales can go here."
    },
    {
      id: "cashAtHand",
      title: "Cash at Hand",
      value: `₦${dashboardSummary.cashAtHand?.toLocaleString()}`,
      subtitle: "Updated just now",
      icon: <CreditCard className="w-6 h-6 text-green-600" />,
      extra: "Shows all available cash including inflows and outflows."
    },
    {
      id: "inventoryValue",
      title: "Inventory Value",
      value: `₦${dashboardSummary.inventoryValue?.toLocaleString()}`,
      subtitle: "Across all products",
      icon: <Package className="w-6 h-6 text-yellow-600" />,
      extra: "Represents the total stock value for the business."
    },
    {
      id: "liabilities",
      title: "Outstanding Liabilities",
      value: `₦${dashboardSummary.outstandingLiabilities?.toLocaleString()}`,
      subtitle: "Active liabilities",
      icon: <DollarSign className="w-6 h-6 text-red-600" />,
      extra: "All loans or obligations to suppliers and partners."
    },
    {
      id: "netProfit",
      title: "Net Profit",
      value: `₦${dashboardSummary.netProfit?.toLocaleString()}`,
      subtitle: "For the selected period",
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      extra: "Calculated as total sales minus total expenses."
    }
  ].filter(Boolean); // remove false if businessStatus?.isOpening is false

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-hide">
      {cards.map((card: any) => (
        <Card
          key={card.id}
          className={`min-w-[260px] snap-start p-5 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${
            card.gradient ? `bg-gradient-to-br ${card.gradient}` : "bg-white border border-gray-100"
          }`}
          onClick={card.onClick}
        >
          <CardContent
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
          />
          {expandedCard === card.id && card.extra && (
            <div className="mt-3 text-sm text-gray-500">{card.extra}</div>
          )}
        </Card>
      ))}
    </div>
  );
}