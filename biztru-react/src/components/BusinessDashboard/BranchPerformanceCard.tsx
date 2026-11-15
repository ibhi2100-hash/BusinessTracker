
import {
  Building2,
  ChevronRight,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";

export interface BranchPerformance {
  id: string;
  name: string;
  location: string;
  status: "ACTIVE" | "ATTENTION" | "INACTIVE";
  manager: string;
  todaySales: number;
  revenue: number;
  netProfit: number;
  inventoryValue: number;
  cash: number;
  salesCount: number;
}

interface BranchPerformanceCardProps {
  branch: BranchPerformance;
  onClick: (branch: BranchPerformance) => void;
}

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(2)}m`;
  }

  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return `₦${amount.toLocaleString("en-NG")}`;
};

export function BranchPerformanceCard({
  branch,
  onClick,
}: BranchPerformanceCardProps) {
  const statusStyles = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400",
    ATTENTION: "bg-amber-500/15 text-amber-400",
    INACTIVE: "bg-red-500/15 text-red-400",
  };

  const statusLabels = {
    ACTIVE: "Active",
    ATTENTION: "Attention",
    INACTIVE: "Inactive",
  };

  return (
    <button
      type="button"
      onClick={() => onClick(branch)}
      className="w-full text-left"
    >
      <GlassCard className="p-4 space-y-4 hover:bg-white/[0.06] transition-colors">
        {/* Branch identity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <GlassIcon size="lg">
              <Building2 size={21} />
            </GlassIcon>

            <div className="min-w-0">
              <h3 className="font-semibold truncate">
                {branch.name}
              </h3>

              <p className="text-xs text-white/50 mt-1">
                {branch.location}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${
              statusStyles[branch.status]
            }`}
          >
            {statusLabels[branch.status]}
          </span>
        </div>

        <div className="text-xs text-white/50">
          Branch Manager: {branch.manager}
        </div>

        {/* Branch economics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-xs text-white/50">
              Today's Sales
            </p>
            <p className="font-semibold mt-1">
              {formatCompactCurrency(branch.todaySales)}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/50">
              Net Profit
            </p>
            <p className="font-semibold text-emerald-400 mt-1">
              {formatCompactCurrency(branch.netProfit)}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/50">
              Inventory Value
            </p>
            <p className="text-sm font-medium mt-1">
              {formatCompactCurrency(branch.inventoryValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/50">
              Available Cash
            </p>
            <p className="text-sm font-medium mt-1">
              {formatCompactCurrency(branch.cash)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3"
        onClick={()=> {
            console.log("i am Going To navigate to this branchId")
        }}>
          <p className="text-xs text-white/50">
            {branch.salesCount} transactions today
          </p>

          <span className="text-xs text-teal-400 flex items-center gap-1">
            View branch
            <ChevronRight size={15} />
          </span>
        </div>
      </GlassCard>
    </button>
  );
}
