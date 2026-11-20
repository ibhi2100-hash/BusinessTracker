
import { useCallback, useState } from "react";

import { founderDashboardMock } from "./data/dashboard.mock";

import { DashboardHeader } from "./components/DashboardHeader";
import { PlatformMetricGrid } from "./components/PlatformMetricGrid";
import { RevenueOverview } from "./components/RevenueOverview";
import { TenantGrowthChart } from "./components/TenantGrowthChart";
import { SystemHealthPanel } from "./components/SystemHealthPanel";
import { RecentPlatformActivity } from "./components/RecentPlatformActivity";
import { PlatformAlerts } from "./components/PlatformAlerts";

import type {
  PlatformAlert,
} from "./types/dashboard.types";

interface FounderDashboardPageProps {
  onNavigate?: (path: string) => void;
  onRefresh?: () => Promise<void> | void;
}

export default function FounderDashboardPage({
  onNavigate,
  onRefresh,
}: FounderDashboardPageProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(
    new Date(),
  );

  const data = founderDashboardMock;

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await onRefresh?.();
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  const handleExport = useCallback(() => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      metrics: data.metrics,
      revenue: data.revenue,
      tenantGrowth: data.tenantGrowth,
      services: data.services,
      activities: data.activities,
      alerts: data.alerts,
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `biztru-founder-dashboard-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    anchor.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleOpenAlert = (alert: PlatformAlert) => {
    onNavigate?.(`/command/operations/alerts/${alert.id}`);
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      <DashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-white/35">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>

        <div className="flex items-center gap-2 text-xs text-teal-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
          Demo data active
        </div>
      </div>

      {/* Global platform metrics */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Platform Overview
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Your platform's current operating position
          </p>
        </div>

        <PlatformMetricGrid metrics={data.metrics} />
      </section>

      {/* Financial and ecosystem analytics */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueOverview data={data.revenue} />

        <TenantGrowthChart data={data.tenantGrowth} />
      </section>

      {/* Operational monitoring */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Platform Operations
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Infrastructure and operational monitoring
          </p>
        </div>

        <SystemHealthPanel
          services={data.services}
          onViewAll={() =>
            onNavigate?.("/command/infrastructure")
          }
        />
      </section>

      {/* Alerts and activity */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PlatformAlerts
          alerts={data.alerts}
          onViewAll={() =>
            onNavigate?.("/command/operations/alerts")
          }
          onOpenAlert={handleOpenAlert}
        />

        <RecentPlatformActivity
          activities={data.activities}
          onViewAll={() =>
            onNavigate?.("/command/governance/audit")
          }
        />
      </section>

      {/* Founder shortcuts */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Quick Access
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Frequently used platform controls
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Manage Businesses",
              description: "View and manage all tenants",
              icon: "building-2",
              path: "/command/tenants",
            },
            {
              title: "Subscriptions",
              description: "Control billing and subscriptions",
              icon: "credit-card",
              path: "/command/commercial/subscriptions",
            },
            {
              title: "Platform Plans",
              description: "Manage plans and pricing",
              icon: "layers",
              path: "/command/commercial/plans",
            },
            {
              title: "Platform Security",
              description: "Administrators and permissions",
              icon: "shield-check",
              path: "/command/governance",
            },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate?.(item.path)}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-teal-400/30 hover:bg-teal-400/[0.04]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400">
                <span className="text-xs font-bold">
                  {item.title.slice(0, 1)}
                </span>
              </div>

              <p className="text-sm font-semibold text-white">
                {item.title}
              </p>

              <p className="mt-1 text-xs text-white/40">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
