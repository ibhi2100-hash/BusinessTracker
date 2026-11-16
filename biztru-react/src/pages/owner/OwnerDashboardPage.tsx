// pages/OwnerDashboardPage.tsx

import {
  Bell,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  PackageX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  BranchPerformanceCard,
  type BranchPerformance,
} from "../../components/BusinessDashboard/BranchPerformanceCard";

import { CEOActionCentre } from "../../components/BusinessDashboard/CEOActionCentre";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { MetricCard } from "../../components/ui/MetricCard";
import { GlassButton } from "../../components/ui/GlassButton";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";
import { useLiveBusinessDashboard } from "../../hooks/Business/useLiveBusinessDashboard";

/* ============================================================
   FORMATTING
   ============================================================ */

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatCompactCurrency = (amount: number) => {
  const value = amount ?? 0;

  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(2)}m`;
  }

  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(0)}k`;
  }

  return formatCurrency(value);
};

/* ============================================================
   PAGE
   ============================================================ */

export default function OwnerDashboardPage() {
  const { businessId } = useBusinessContext();
  const navigate = useNavigate();

  // Business profile.
  const {
    data: business,
    loading: businessLoading,
    error: businessError,
  } = useBusinessLiveQuery(businessId);

  // Consolidated business dashboard data.
  const {
    data: dashboard,
    loading: dashboardLoading,
    error: dashboardError,
  } = useLiveBusinessDashboard(businessId);

  const summary = dashboard?.summary;
  const monthlyOverview = dashboard?.monthlyPerformance;
  const branches = dashboard?.branches ?? [];

  const loading = businessLoading || dashboardLoading;
  const error = businessError || dashboardError;

  // Cash and bank are separate balances in the repository.
  const availableCash =
    (summary?.cash ?? 0) + (summary?.bank ?? 0);

  const monthlyProfitMargin =
    (monthlyOverview?.revenue ?? 0) > 0
      ? ((monthlyOverview?.netProfit ?? 0) /
          monthlyOverview!.revenue) *
        100
      : 0;

  const activeBranches = branches.filter(
    (branch) => branch.status === "ACTIVE"
  ).length;

  /*
   * Convert the repository branch rows to the card contract.
   * A branch without an assigned manager displays "Unassigned".
   */
  const branchCards: BranchPerformance[] = branches.map(
    (branch) => ({
      id: branch.id,
      name: branch.name,
      location: branch.location || "Location not provided",
      status: branch.status,
      manager: branch.manager || "Unassigned",
      todaySales: branch.todaySales ?? 0,
      revenue: branch.revenue ?? 0,
      netProfit: branch.netProfit ?? 0,
      inventoryValue: branch.inventoryValue ?? 0,
      cash: branch.cash ?? 0,
      salesCount: branch.salesCount ?? 0,
    })
  );

  // Derive operational alerts only from actual branch data.
  const branchAlerts = branches.flatMap((branch) => {
    const alerts = [];

    if (branch.status === "ATTENTION") {
      alerts.push({
        id: `${branch.id}-attention`,
        title: "Branch requires attention",
        description:
          "The branch has been flagged by its current operational or financial status.",
        branch: branch.name,
        severity: "warning" as const,
      });
    }

    if ((branch.outOfStockRows ?? 0) > 0) {
      alerts.push({
        id: `${branch.id}-stock`,
        title: "Out-of-stock products detected",
        description: `${branch.outOfStockRows} inventory records are out of stock.`,
        branch: branch.name,
        severity: "warning" as const,
      });
    }

    return alerts;
  });

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="px-4 pb-24 space-y-5 animate-pulse">
        <div className="h-28 rounded-3xl bg-white/5 border border-white/10" />

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl bg-white/5 border border-white/10"
            />
          ))}
        </div>

        <div className="h-40 rounded-3xl bg-white/5 border border-white/10" />

        <div className="h-48 rounded-3xl bg-white/5 border border-white/10" />
      </div>
    );
  }

  /* ============================================================
     ERROR
     ============================================================ */

  if (error) {
    return (
      <div className="px-4 py-8">
        <GlassCard className="p-5 space-y-2">
          <h2 className="font-semibold text-red-400">
            Unable to load business dashboard
          </h2>

          <p className="text-sm text-white/60">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading business data."}
          </p>
        </GlassCard>
      </div>
    );
  }

  /* ============================================================
     EMPTY STATE
     ============================================================ */

  if (!businessId || !dashboard) {
    return (
      <div className="px-4 py-8">
        <GlassCard className="p-5">
          <h2 className="font-semibold">
            Business dashboard unavailable
          </h2>

          <p className="text-sm text-white/50 mt-2">
            No business dashboard data is currently available.
          </p>
        </GlassCard>
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="px-4 pb-24 space-y-6">

      {/* BUSINESS HEADER */}

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
                {business?.name || "Business Overview"}
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

      {/* BUSINESS FINANCIAL POSITION */}

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
              summary?.inventoryValue ?? 0
            )}
            icon={<Package size={19} />}
          />

          <MetricCard
            title="Available Cash"
            value={formatCompactCurrency(availableCash)}
            icon={<Wallet size={19} />}
          />

          <MetricCard
            title="Today's Sales"
            value={formatCompactCurrency(
              summary?.todaySales ?? 0
            )}
            icon={<ShoppingCart size={19} />}
          />

          <MetricCard
            title="Today's Revenue"
            value={formatCompactCurrency(
              summary?.revenue ?? 0
            )}
            icon={<CircleDollarSign size={19} />}
          />

          <MetricCard
            title="Today's Net Profit"
            value={formatCompactCurrency(
              summary?.netProfit ?? 0
            )}
            icon={<TrendingUp size={19} />}
          />
        </div>
      </section>

      {/* CEO ACTION CENTRE */}

      <CEOActionCentre
        onAction={(action) => navigate(action)}
      />

      {/* MONTHLY BUSINESS PERFORMANCE */}

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
                {formatCompactCurrency(
                  monthlyOverview?.revenue ?? 0
                )}
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
                {formatCompactCurrency(
                  monthlyOverview?.netProfit ?? 0
                )}
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

      {/* BRANCH PERFORMANCE */}

      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-base font-semibold">
              Branch Performance
            </h2>

            <p className="text-xs text-white/50 mt-1">
              Consolidated branch economics
            </p>
          </div>

          <span className="text-xs text-white/50">
            {activeBranches}/{branches.length} active
          </span>
        </div>

        {branchCards.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <Building2
              size={25}
              className="mx-auto text-white/40"
            />

            <p className="text-sm font-medium mt-3">
              No branches found
            </p>

            <p className="text-xs text-white/50 mt-1">
              Your business branches will appear here.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {branchCards.map((branch) => (
              <BranchPerformanceCard
                key={branch.id}
                branch={branch}
                onClick={(selectedBranch) => {
                  navigate(`/branch/${selectedBranch.id}`);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* REAL BUSINESS ALERTS */}

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">
            Business Alerts
          </h2>

          <p className="text-xs text-white/50 mt-1">
            Operational issues detected across your branches
          </p>
        </div>

        {branchAlerts.length === 0 ? (
          <GlassCard className="p-4">
            <p className="text-sm text-white/60">
              No branch alerts detected from the available dashboard data.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {branchAlerts.map((alert) => (
              <GlassCard
                key={alert.id}
                className="p-3"
              >
                <div className="flex items-start gap-3">
                  <GlassIcon
                    size="md"
                    variant="primary"
                  >
                    {alert.title.includes("stock") ? (
                      <PackageX size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}
                  </GlassIcon>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {alert.title}
                    </p>

                    <p className="text-xs text-white/50 mt-1">
                      {alert.description}
                    </p>

                    <p className="text-xs text-white/60 mt-2">
                      {alert.branch}
                    </p>
                  </div>

                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">
                    Warning
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}