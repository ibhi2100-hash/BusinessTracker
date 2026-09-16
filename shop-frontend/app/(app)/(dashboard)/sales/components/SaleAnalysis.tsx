"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Package,
  Percent,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { MetricCard } from "@/components/ui/MetricCard";
import { cn } from "@/lib/utils";

import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";

import type { BuyingAnalysisRow } from "@business/shared-types";

/* ================================================================
   TYPES
================================================================ */

type RangeKey = "today" | "7d" | "30d" | "all";

type BuyingPriority =
  | "critical"
  | "high"
  | "normal"
  | "low";

/* ================================================================
   HELPERS
================================================================ */

function formatNaira(value: number) {
  return `₦${(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function formatNumber(value: number) {
  return (value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function startOfDay(date = new Date()) {
  const x = new Date(date);

  x.setHours(0, 0, 0, 0);

  return x.getTime();
}

function endOfDay(date = new Date()) {
  const x = new Date(date);

  x.setHours(23, 59, 59, 999);

  return x.getTime();
}

function daysAgo(days: number) {
  const d = new Date();

  d.setDate(d.getDate() - days);

  return d;
}

function getRange(key: RangeKey) {
  if (key === "today") {
    return {
      from: startOfDay(),
      to: endOfDay(),
      days: 1,
    };
  }

  if (key === "7d") {
    return {
      from: startOfDay(daysAgo(6)),
      to: endOfDay(),
      days: 7,
    };
  }

  if (key === "30d") {
    return {
      from: startOfDay(daysAgo(29)),
      to: endOfDay(),
      days: 30,
    };
  }

  return {
    from: undefined,
    to: undefined,
    days: 30,
  };
}

/* ================================================================
   BUYING PRIORITY
================================================================ */

function getPriority(score: number): BuyingPriority {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "normal";

  return "low";
}

function getPriorityLabel(priority: BuyingPriority) {
  switch (priority) {
    case "critical":
      return "BUY NOW";

    case "high":
      return "BUY SOON";

    case "normal":
      return "WATCH";

    case "low":
      return "LOW PRIORITY";
  }
}

function getPriorityClasses(priority: BuyingPriority) {
  switch (priority) {
    case "critical":
      return {
        badge:
          "border-red-500/30 bg-red-500/10 text-red-400",
        score:
          "text-red-400",
        bar:
          "bg-red-500",
      };

    case "high":
      return {
        badge:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        score:
          "text-amber-400",
        bar:
          "bg-amber-500",
      };

    case "normal":
      return {
        badge:
          "border-blue-500/30 bg-blue-500/10 text-blue-400",
        score:
          "text-blue-400",
        bar:
          "bg-blue-500",
      };

    case "low":
      return {
        badge:
          "border-white/10 bg-white/5 text-gray-400",
        score:
          "text-gray-300",
        bar:
          "bg-gray-500",
      };
  }
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function BuyingAnalysisPage() {
  const app = useApplication();

  const {
    businessId,
    branchId,
  } = useBusinessContext();

  const [range, setRange] = useState<RangeKey>("30d");

  const [rows, setRows] = useState<BuyingAnalysisRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);

      setError(null);

      const current = getRange(range);

      /*
       * Previous period has the same duration immediately
       * before the current period.
       *
       * This gives the SQL query a proper period-over-period
       * comparison.
       */

      let currentStart: number;

let currentEnd: number;

let previousStart: number;

let previousEnd: number;

if (range === "all") {

  const now = Date.now();

  currentStart = new Date(

    2000,

    0,

    1

  ).getTime();

  currentEnd = now;

  previousStart = new Date(

    1990,

    0,

    1

  ).getTime();

  previousEnd = currentStart;

} else {

  const days = current.days;

  const currentStartDate =

    new Date(current.from!);

  const previousEndDate =

    new Date(currentStartDate);

  previousEndDate.setMilliseconds(

    previousEndDate.getMilliseconds() - 1

  );

  const previousStartDate =

    new Date(previousEndDate);

  previousStartDate.setDate(

    previousStartDate.getDate() - days + 1

  );

  currentStart = current.from!;

  currentEnd = current.to!;

  previousStart =

    startOfDay(previousStartDate);

  previousEnd =

    previousEndDate.getTime();

}     const days = current.days;

      const result =
        await app.sales.buyAnalysis({
          businessId,
          branchId ,
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
          currentDays: days,
          previousDays: days
         }
        );

      setRows(result);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load buying analysis."
      );
    } finally {
      setLoading(false);
    }
  }, [
    app,
    businessId,
    branchId,
    range,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  /* ==============================================================
     DERIVED ANALYTICS
  ============================================================== */

  const sortedRows = useMemo(() => {
    return [...rows].sort(
      (a, b) => b.buyingScore - a.buyingScore
    );
  }, [rows]);

  const criticalProducts = useMemo(
    () =>
      rows.filter(
        (row) => row.buyingScore >= 85
      ),
    [rows]
  );

  const highDemandProducts = useMemo(
    () =>
      rows.filter(
        (row) => row.demandGrowth > 0.15
      ),
    [rows]
  );

  const lowStockProducts = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.currentStock <= row.reorderLevel
      ),
    [rows]
  );

  const totalPotentialProfit = useMemo(() => {
    return criticalProducts.reduce(
      (sum, row) =>
        sum + row.grossProfitVelocity * 7,
      0
    );
  }, [criticalProducts]);

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <div className="min-h-screen bg-neutral-950 pb-28 text-white">
      {/* ==========================================================
          HEADER
      =========================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/80 backdrop-blur-2xl">
        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2.5 text-xl font-semibold">
                <GlassIcon
                  size="sm"
                  variant="primary"
                >
                  <ShoppingCart className="h-4 w-4" />
                </GlassIcon>

                Buying intelligence
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                What should this branch buy next?
              </p>
            </div>

            <GlassButton
              variant="tertiary"
              onClick={load}
              disabled={loading}
              aria-label="Refresh buying analysis"
              icon={
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    loading && "animate-spin"
                  )}
                />
              }
            />
          </div>

          {/* RANGE */}

          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                {
                  key: "today",
                  label: "Today",
                },
                {
                  key: "7d",
                  label: "7 days",
                },
                {
                  key: "30d",
                  label: "30 days",
                },
                {
                  key: "all",
                  label: "All time",
                },
              ] as {
                key: RangeKey;
                label: string;
              }[]
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setRange(item.key)
                }
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs transition",
                  range === item.key
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/[0.07]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="space-y-5 px-4 pt-4">
        {/* ========================================================
            ERROR
        ========================================================= */}

        {error && (
          <GlassCard className="border-red-500/20 bg-red-500/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />

              <div>
                <p className="text-sm font-medium text-red-400">
                  Buying analysis unavailable
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {error}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* ========================================================
            KPI
        ========================================================= */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            title="Buy now"
            value={
              loading
                ? "…"
                : String(criticalProducts.length)
            }
            trend="Score ≥ 85"
            icon={
              <Zap className="h-5 w-5" />
            }
          />

          <MetricCard
            title="High demand"
            value={
              loading
                ? "…"
                : String(highDemandProducts.length)
            }
            trend="Growth > 15%"
            icon={
              <TrendingUp className="h-5 w-5" />
            }
          />

          <MetricCard
            title="Low stock"
            value={
              loading
                ? "…"
                : String(lowStockProducts.length)
            }
            trend="At / below reorder"
            icon={
              <Package className="h-5 w-5" />
            }
          />

          <MetricCard
            title="7d profit potential"
            value={
              loading
                ? "…"
                : formatNaira(
                    totalPotentialProfit
                  )
            }
            trend="Top buy-now items"
            icon={
              <Wallet className="h-5 w-5" />
            }
          />
        </div>

        {/* ========================================================
            BUYING DECISION SUMMARY
        ========================================================= */}

        {!loading && sortedRows.length > 0 && (
          <GlassCard
            variant="default"
            className="overflow-hidden"
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    Buying decision
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Products are ranked by demand,
                    profit velocity, inventory pressure
                    and confidence.
                  </p>
                </div>

                <Target className="h-5 w-5 shrink-0 text-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/10">
              <DecisionStat
                label="Buy now"
                value={criticalProducts.length}
                icon={
                  <Zap className="h-3.5 w-3.5" />
                }
              />

              <DecisionStat
                label="Buy soon"
                value={
                  rows.filter(
                    (r) =>
                      r.buyingScore >= 70 &&
                      r.buyingScore < 85
                  ).length
                }
                icon={
                  <ArrowUp className="h-3.5 w-3.5" />
                }
              />

              <DecisionStat
                label="Watch"
                value={
                  rows.filter(
                    (r) => r.buyingScore < 70
                  ).length
                }
                icon={
                  <BarChart3 className="h-3.5 w-3.5" />
                }
              />
            </div>
          </GlassCard>
        )}

        {/* ========================================================
            BUYING QUEUE
        ========================================================= */}

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-200">
                Buying priority
              </h2>

              <p className="mt-1 text-[11px] text-gray-500">
                Highest-priority products first
              </p>
            </div>

            {!loading && (
              <span className="text-[10px] text-gray-600">
                {rows.length} products
              </span>
            )}
          </div>

          {loading ? (
            <BuyingSkeleton />
          ) : sortedRows.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Package className="mx-auto h-8 w-8 text-gray-600" />

              <p className="mt-3 text-sm text-gray-400">
                No buying data yet
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Product sales will generate buying
                recommendations as transaction history
                accumulates.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-2.5">
              {sortedRows.map((row, index) => (
                <BuyingProductCard
                  key={row.productId}
                  row={row}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* ================================================================
   BUYING PRODUCT CARD
================================================================ */

interface BuyingProductCardProps {
  row: BuyingAnalysisRow;
  rank: number;
}

function BuyingProductCard({
  row,
  rank,
}: BuyingProductCardProps) {
  const priority = getPriority(
    row.buyingScore
  );

  const classes =
    getPriorityClasses(priority);

  const stockPressure =
    row.reorderLevel > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((row.reorderLevel -
              row.currentStock) /
              row.reorderLevel) *
              100
          )
        )
      : 0;

  const growthPercent =
    row.demandGrowth * 100;

  return (
    <GlassCard
      className={cn(
        "overflow-hidden transition",
        priority === "critical" &&
          "border-red-500/20"
      )}
    >
      <div className="p-4">
        {/* TOP */}

        <div className="flex items-start gap-3">
          {/* RANK */}

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-gray-400">
            #{rank}
          </div>

          {/* PRODUCT */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {row.productName ||
                  row.productId}
              </p>

              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[9px] font-semibold",
                  classes.badge
                )}
              >
                {getPriorityLabel(
                  priority
                )}
              </span>
            </div>

            <p className="mt-1 text-[10px] text-gray-500">
              {formatNumber(row.unitsSold)} units
              sold ·{" "}
              {formatNumber(
                row.salesVelocity
              )}
              /day
            </p>
          </div>

          {/* SCORE */}

          <div className="shrink-0 text-right">
            <p
              className={cn(
                "text-xl font-bold",
                classes.score
              )}
            >
              {row.buyingScore?.toFixed(0) ?? 0}
            </p>

            <p className="text-[9px] uppercase tracking-wide text-gray-600">
              score
            </p>
          </div>
        </div>

        {/* SCORE BAR */}

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                classes.bar
              )}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    row.buyingScore
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        {/* METRICS */}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniMetric
            label="Stock"
            value={formatNumber(
              row.currentStock
            )}
          />

          <MiniMetric
            label="Reorder"
            value={formatNumber(
              row.reorderLevel
            )}
          />

          <MiniMetric
            label="Profit velocity"
            value={formatNaira(
              row.grossProfitVelocity
            )}
          />

          <MiniMetric
            label="Demand"
            value={
              growthPercent >= 0
                ? `+${growthPercent.toFixed(0)}%`
                : `${growthPercent.toFixed(0)}%`
            }
            positive={
              growthPercent > 0
            }
          />
        </div>

        {/* INVENTORY PRESSURE */}

        <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">
            Inventory pressure
          </span>

          <span className="text-[10px] text-gray-400">
            {Number(row.inventoryPressureScore ?? 0).toFixed(0)}%
          </span>
        </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className={cn(
                "h-full rounded-full",
                stockPressure >= 70
                  ? "bg-red-500"
                  : stockPressure >= 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
              style={{
                width: `${Math.min(
                  100,
                  stockPressure
                )}%`,
              }}
            />
          </div>
        </div>

        {/* REASON */}

        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.025] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            Why this product?
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <ScoreReason
              label="Sales velocity"
              score={
                row.salesVelocityScore
              }
            />

            <ScoreReason
              label="Profit velocity"
              score={
                row.grossProfitVelocityScore
              }
            />

            <ScoreReason
              label="Demand trend"
              score={
                row.demandTrendScore
              }
            />

            <ScoreReason
              label="Stock pressure"
              score={
                row.inventoryPressureScore
              }
            />

            <ScoreReason
              label="Confidence"
              score={
                row.confidenceScore
              }
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ================================================================
   SMALL COMPONENTS
================================================================ */

function DecisionStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-gray-600">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 text-xs font-semibold text-gray-300",
          positive && "text-emerald-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ScoreReason({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-[10px] text-gray-500">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-gray-300">
        {score?.toFixed(0)}
      </span>
    </div>
  );
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function BuyingSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <GlassCard
            key={index}
            className="animate-pulse p-4"
          >
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/5" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-white/5" />

                <div className="h-3 w-24 rounded bg-white/5" />

                <div className="mt-4 h-1.5 w-full rounded bg-white/5" />
              </div>

              <div className="h-8 w-10 rounded bg-white/5" />
            </div>
          </GlassCard>
        )
      )}
    </div>
  );
}
