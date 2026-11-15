
import {
  Bell,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BranchPerformanceCard,
  type BranchPerformance,
} from "../../components/BusinessDashboard/BranchPerformanceCard";

import { CEOActionCentre } from "../../components/BusinessDashboard/CEOActionCentre";
import { BusinessAlerts } from "../../components/BusinessDashboard/BusinessAlerts";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { MetricCard } from "../../components/ui/MetricCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

const branches: BranchPerformance[] = [
  {
    id: "branch-001",
    name: "Wuse Branch",
    location: "Wuse 2, Abuja",
    status: "ACTIVE",
    manager: "John Ibrahim",
    todaySales: 1_240_000,
    revenue: 1_240_000,
    netProfit: 218_000,
    inventoryValue: 6_850_000,
    cash: 2_450_000,
    salesCount: 32,
  },
  {
    id: "branch-002",
    name: "Garki Branch",
    location: "Garki Area 11, Abuja",
    status: "ACTIVE",
    manager: "Mary James",
    todaySales: 890_000,
    revenue: 890_000,
    netProfit: 154_000,
    inventoryValue: 4_650_000,
    cash: 1_950_000,
    salesCount: 24,
  },
  {
    id: "branch-003",
    name: "Maitama Branch",
    location: "Maitama, Abuja",
    status: "ACTIVE",
    manager: "David Musa",
    todaySales: 510_000,
    revenue: 510_000,
    netProfit: 82_500,
    inventoryValue: 4_200_000,
    cash: 2_150_000,
    salesCount: 15,
  },
  {
    id: "branch-004",
    name: "Kubwa Branch",
    location: "Kubwa, Abuja",
    status: "ATTENTION",
    manager: "Peter Daniel",
    todaySales: 200_000,
    revenue: 200_000,
    netProfit: 32_000,
    inventoryValue: 2_750_000,
    cash: 1_700_000,
    salesCount: 8,
  },
];

/**
 * Monthly business-level figures.
 * These are demo values and will later come from consolidated projections.
 */
const monthlyOverview = {
  revenue: 42_680_000,
  netProfit: 7_650_000,
};

/* -------------------------------------------------------------------------- */
/* Derived business figures                                                   */
/* -------------------------------------------------------------------------- */

const businessOverview = {
  inventoryValue: branches.reduce(
    (total, branch) => total + branch.inventoryValue,
    0
  ),

  availableCash: branches.reduce(
    (total, branch) => total + branch.cash,
    0
  ),

  todaySales: branches.reduce(
    (total, branch) => total + branch.todaySales,
    0
  ),

  todayRevenue: branches.reduce(
    (total, branch) => total + branch.revenue,
    0
  ),

  todayNetProfit: branches.reduce(
    (total, branch) => total + branch.netProfit,
    0
  ),
};

const activeBranches = branches.filter(
  (branch) => branch.status === "ACTIVE"
).length;

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(2)}m`;
  }

  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return formatCurrency(amount);
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function OwnerDashboardPage() {

      const {
        businessId,
      } = useBusinessContext();
    
      const {
        data: business,
        loading: businessLoading,
        error: businessError,
    } = useBusinessLiveQuery(businessId);
    const navigate = useNavigate();

  const monthlyProfitMargin =
    monthlyOverview.revenue > 0
      ? (monthlyOverview.netProfit / monthlyOverview.revenue) * 100
      : 0;

  return (
    <div className="px-4 pb-24 space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <GlassCard variant="elevated" className="p-4">
        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">
            <GlassIcon size="lg">
              <Building2 size={23} />
            </GlassIcon>

            <div className="min-w-0">
              <p className="text-xs text-white/50">
                Business Owner
              </p>

              <h1 className="text-lg font-semibold truncate">
                {`${business?.name} Overview`}
              </h1>

              <p className="text-xs text-white/50">
                All branches consolidated
              </p>
            </div>
          </div>

          <GlassButton
            variant="secondary"
            className="shrink-0"
            icon={<Bell size={17} />}
            aria-label="Notifications"
          />
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">

          <div>
            <p className="text-xs text-white/50">
              Business performance
            </p>

            <p className="text-sm font-medium">
              All systems overview
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-white/50">
            <CalendarDays size={14} />
            Today
          </div>

        </div>
      </GlassCard>

      {/* ------------------------------------------------------------------ */}
      {/* Business Financial Position                                        */}
      {/* ------------------------------------------------------------------ */}

      <section className="space-y-3">

        <div>
          <h2 className="text-base font-semibold">
            Business Financial Position
          </h2>

          <p className="text-xs text-white/50 mt-1">
            Consolidated figures across all branches
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <MetricCard
            title="Inventory Value"
            value={formatCompactCurrency(
              businessOverview.inventoryValue
            )}
            icon={<Package size={19} />}
          />

          <MetricCard
            title="Available Cash"
            value={formatCompactCurrency(
              businessOverview.availableCash
            )}
            icon={<Wallet size={19} />}
          />

          <MetricCard
            title="Today's Sales"
            value={formatCompactCurrency(
              businessOverview.todaySales
            )}
            icon={<ShoppingCart size={19} />}
          />

          <MetricCard
            title="Today's Revenue"
            value={formatCompactCurrency(
              businessOverview.todayRevenue
            )}
            icon={<CircleDollarSign size={19} />}
          />

          <MetricCard
            title="Today's Net Profit"
            value={formatCompactCurrency(
              businessOverview.todayNetProfit
            )}
            icon={<TrendingUp size={19} />}
          />

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CEO Action Centre                                                   */}
      {/* ------------------------------------------------------------------ */}

      <CEOActionCentre
        onAction={(action) => {
          navigate(action)
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Monthly Business Performance                                        */}
      {/* ------------------------------------------------------------------ */}

      <section className="space-y-3">

        <div>
          <h2 className="text-base font-semibold">
            Business Performance
          </h2>

          <p className="text-xs text-white/50 mt-1">
            Current month
          </p>
        </div>

        <GlassCard className="p-4 space-y-4">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-xs text-white/50">
                Monthly Revenue
              </p>

              <p className="text-2xl font-semibold mt-1">
                {formatCompactCurrency(monthlyOverview.revenue)}
              </p>
            </div>

            <GlassIcon variant="success" size="lg">
              <CircleDollarSign size={22} />
            </GlassIcon>

          </div>

          <div className="h-px bg-white/10" />

          <div className="flex justify-between items-center">

            <div>
              <p className="text-xs text-white/50">
                Monthly Net Profit
              </p>

              <p className="text-xl font-semibold text-emerald-400 mt-1">
                {formatCompactCurrency(monthlyOverview.netProfit)}
              </p>
            </div>

            <div className="text-right">

              <p className="text-xs text-white/50">
                Profit Margin
              </p>

              <p className="text-sm font-medium mt-1">
                {monthlyProfitMargin.toFixed(1)}%
              </p>

            </div>
          </div>

        </GlassCard>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Branch Performance                                                  */}
      {/* ------------------------------------------------------------------ */}

      <section className="space-y-3">

        <div className="flex justify-between items-end">

          <div>
            <h2 className="text-base font-semibold">
              Branch Performance
            </h2>

            <p className="text-xs text-white/50 mt-1">
              Today's branch-level economics
            </p>
          </div>

          <span className="text-xs text-white/50">
            {activeBranches}/{branches.length} active
          </span>

        </div>

        <div className="space-y-3">

          {branches.map((branch) => (
            <BranchPerformanceCard
              key={branch.id}
              branch={branch}
              onClick={(selectedBranch) => {
                console.log("Selected branch:", selectedBranch);
              }}
            />
          ))}

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Business Alerts                                                     */}
      {/* ------------------------------------------------------------------ */}

      <BusinessAlerts
        onAlertClick={(alert) => {
          console.log("Selected business alert:", alert);
        }}
      />

    </div>
  );
};
