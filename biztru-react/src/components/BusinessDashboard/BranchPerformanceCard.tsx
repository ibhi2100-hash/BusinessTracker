
import {
  Building2,
  ChevronRight,
  Gauge,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";
import { GlassButton } from "../ui/GlassButton";

/* ============================================================
   TYPES
   ============================================================ */

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

  // Navigate to the branch operational dashboard.
  onClick: (branch: BranchPerformance) => void;

  // Navigate to the branch Control Room.
  onControlRoomClick?: (branch: BranchPerformance) => void;

  // Whether to display the Control Room button.
  showControlRoomButton?: boolean;
}

/* ============================================================
   FORMATTERS
   ============================================================ */

const formatCompactCurrency = (amount: number) => {
  const value = Number.isFinite(amount) ? amount : 0;

  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(2)}m`;
  }

  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(0)}k`;
  }

  return `₦${value.toLocaleString("en-NG")}`;
};

/* ============================================================
   STATUS STYLES
   ============================================================ */

const statusStyles: Record<BranchPerformance["status"], string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  ATTENTION: "bg-amber-500/15 text-amber-400",
  INACTIVE: "bg-red-500/15 text-red-400",
};

const statusLabels: Record<BranchPerformance["status"], string> = {
  ACTIVE: "Active",
  ATTENTION: "Attention",
  INACTIVE: "Inactive",
};

/* ============================================================
   BRANCH PERFORMANCE CARD
   ============================================================ */

export function BranchPerformanceCard({
  branch,
  onClick,
  onControlRoomClick,
  showControlRoomButton = false,
}: BranchPerformanceCardProps) {
  return (
    <GlassCard className="p-4 space-y-4 h-full hover:bg-white/[0.04] transition-colors">

      {/* ------------------------------------------------------
          BRANCH IDENTITY
          ------------------------------------------------------ */}

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

      {/* ------------------------------------------------------
          BRANCH MANAGER
          ------------------------------------------------------ */}

      <div className="text-xs text-white/50">
        Branch Manager: {branch.manager}
      </div>

      {/* ------------------------------------------------------
          BRANCH ECONOMICS
          ------------------------------------------------------ */}

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

      {/* ------------------------------------------------------
          ORIGINAL VIEW BRANCH ACTION

          Opens the branch's operational dashboard.
          ------------------------------------------------------ */}

      <button
        type="button"
        onClick={() => onClick(branch)}
        aria-label={`View ${branch.name} branch dashboard`}
        className="
          w-full
          flex items-center justify-between
          border-t border-white/10
          pt-3
          text-left
          group
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-teal-400
          rounded-sm
        "
      >

        <p className="text-xs text-white/50">
          {branch.salesCount} transactions today
        </p>

        <span className="
          text-xs text-teal-400
          flex items-center gap-1
          group-hover:gap-2
          transition-all
        ">
          View Branch
          <ChevronRight size={15} />
        </span>

      </button>

      {/* ------------------------------------------------------
          OPTIONAL CONTROL ROOM BUTTON

          Opens the dedicated branch management page.
          ------------------------------------------------------ */}

      {showControlRoomButton && onControlRoomClick && (
        <div className="pt-1">

          <GlassButton
            variant="primary"
            className="w-full"
            icon={<Gauge size={17} />}
            onClick={() => onControlRoomClick(branch)}
          >
            Open Branch Control Room
          </GlassButton>

        </div>
      )}

    </GlassCard>
  );
}
