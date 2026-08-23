"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  Package,
  TrendingUp,
  Receipt,
  RefreshCw,
  Scale,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { MetricCard } from "@/components/ui/MetricCard";
import { cn } from "@/lib/utils";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";
import type { DashboardSummary, ReportSummary, MonthlyRow } from "@business/shared-types";
import type { PresetPeriod } from "@/src/services/ApplicationService/API/report/ReportApi"
import { BarSeries } from "@/components/reports/BarSeries";
import { formatNaira } from "@/components/reports/reportFormat";

const PRESETS: { key: PresetPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "this_month", label: "This month" },
  { key: "this_year", label: "This year" },
];

export default function ReportsDashboardPage() {
  const app = useApplication();
  const { branchId } = useBusinessContext();

  const [preset, setPreset] = useState<PresetPeriod>("today");
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const [dash, period, months] = await Promise.all([
        app.report.getDashboard(branchId),
        app.report.getPresetSummary(branchId, preset),
        app.report.getLast12Months(branchId),
      ]);
      setDashboard(dash);
      setSummary(period);
      setMonthly(months);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId, preset]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <LayoutDashboard className="w-4 h-4" />
              </GlassIcon>
              Reports
            </h1>
            <GlassButton
              variant="tertiary"
              onClick={load}
              disabled={loading}
              icon={
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              }
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs border whitespace-nowrap transition",
                  preset === p.key
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                    : "bg-white/[0.04] text-gray-400 border-white/10"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Balances */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-0.5">
          Balances
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Cash"
            value={loading ? "…" : formatNaira(dashboard?.cash ?? 0)}
            icon={<Wallet className="w-5 h-5" />}
          />
          <MetricCard
            title="Bank"
            value={loading ? "…" : formatNaira(dashboard?.bank ?? 0)}
            icon={<Landmark className="w-5 h-5" />}
          />
          <MetricCard
            title="Inventory"
            value={loading ? "…" : formatNaira(dashboard?.inventoryValue ?? 0)}
            icon={<Package className="w-5 h-5" />}
          />
          <MetricCard
            title="Liabilities"
            value={loading ? "…" : formatNaira(dashboard?.liabilities ?? 0)}
            icon={<Scale className="w-5 h-5" />}
          />
        </div>

        {/* Period P&L */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-0.5 pt-2">
          Performance
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Revenue"
            value={loading ? "…" : formatNaira(summary?.revenue ?? 0)}
            icon={<Receipt className="w-5 h-5" />}
          />
          <MetricCard
            title="Gross profit"
            value={loading ? "…" : formatNaira(summary?.grossProfit ?? 0)}
            trend={
              summary
                ? `COGS ${formatNaira(summary.cogs)}`
                : undefined
            }
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        <GlassCard variant="accent" className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Expenses</span>
            <span>{formatNaira(summary?.expenses ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">COGS</span>
            <span>{formatNaira(summary?.cogs ?? 0)}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Net profit</span>
            <span
              className={cn(
                "text-xl font-bold",
                (summary?.netProfit ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {formatNaira(summary?.netProfit ?? 0)}
            </span>
          </div>
        </GlassCard>

        {/* 12-month chart */}
        <GlassCard className="p-4">
          <h2 className="text-sm font-semibold mb-4">Last 12 months</h2>
          {monthly.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No data</p>
          ) : (
            <BarSeries
              data={monthly.map((m) => ({
                label: m.month,
                value: m.revenue,
                secondary: m.netProfit,
              }))}
              valueLabel="Revenue"
              secondaryLabel="Net profit"
            />
          )}
        </GlassCard>
      </div>
    </div>
  );
}