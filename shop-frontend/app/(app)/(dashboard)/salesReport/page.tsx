"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  Package,
  Percent,
  RefreshCw,
  BarChart3,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { MetricCard } from "@/components/ui/MetricCard";
import { cn } from "@/lib/utils";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";
import type {
  SalesSummary,
  ProductSalesSummary,
} from "@/src/services/ApplicationService/API/Sales/SalesApi"; // adjust path

function formatNaira(n: number) {
  return `₦${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

type RangeKey = "today" | "7d" | "30d" | "all";

export default function SalesAnalysisPage() {
  const app = useApplication();
  const { branchId } = useBusinessContext();

  const [range, setRange] = useState<RangeKey>("today");
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [byProduct, setByProduct] = useState<ProductSalesSummary[]>([]);
  const [marginPercent, setMarginPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const getRange = useCallback((key: RangeKey) => {
    if (key === "today") return { from: startOfDay(), to: endOfDay() };
    if (key === "7d")
      return { from: startOfDay(daysAgo(6)), to: endOfDay() };
    if (key === "30d")
      return { from: startOfDay(daysAgo(29)), to: endOfDay() };
    return {};
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { from, to } = getRange(range);

      const [sum, products, margin] = await Promise.all([
        app.sales.getSalesSummary({ branchId: branchId ?? undefined, from, to }),
        app.sales.getProductSalesSummary({
          branchId: branchId ?? undefined,
          from,
          to,
        }),
        app.sales.getGrossMargin({
          branchId: branchId ?? undefined,
          from,
          to,
        }),
      ]);

      setSummary(sum);
      setByProduct(products.slice(0, 10));
      setMarginPercent(margin.marginPercent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId, range, getRange]);

  useEffect(() => {
    load();
  }, [load]);

  const maxRevenue = Math.max(...byProduct.map((p) => p.revenue), 1);

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <BarChart3 className="w-4 h-4" />
              </GlassIcon>
              Sales analysis
            </h1>

            <GlassButton
              variant="tertiary"
              onClick={load}
              disabled={loading}
              icon={
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              }
            />
          </div>

          {/* Range */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { key: "today", label: "Today" },
                { key: "7d", label: "7 days" },
                { key: "30d", label: "30 days" },
                { key: "all", label: "All time" },
              ] as { key: RangeKey; label: string }[]
            ).map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs border whitespace-nowrap transition",
                  range === r.key
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                    : "bg-white/[0.04] text-gray-400 border-white/10"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Revenue"
            value={loading ? "…" : formatNaira(summary?.totalSales ?? 0)}
            trend={
              summary
                ? `${summary.transactionCount} sales`
                : undefined
            }
            icon={<Wallet className="w-5 h-5" />}
          />
          <MetricCard
            title="Profit"
            value={loading ? "…" : formatNaira(summary?.totalProfit ?? 0)}
            trend={
              summary
                ? `Cost ${formatNaira(summary.totalCost)}`
                : undefined
            }
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <MetricCard
            title="Units sold"
            value={loading ? "…" : String(summary?.totalQuantity ?? 0)}
            icon={<Package className="w-5 h-5" />}
          />
          <MetricCard
            title="Gross margin"
            value={loading ? "…" : `${marginPercent.toFixed(1)}%`}
            trend={
              summary && summary.voidedCount > 0
                ? `${summary.voidedCount} voided`
                : undefined
            }
            icon={<Percent className="w-5 h-5" />}
          />
        </div>

        {/* Extra financial strip */}
        {summary && (
          <GlassCard variant="default" className="p-4 space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Financial controls
            </p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-400">Transactions</span>
              <span className="text-right font-semibold">
                {summary.transactionCount}
              </span>
              <span className="text-gray-400">Refunded</span>
              <span className="text-right text-amber-400">
                {formatNaira(summary.refundedAmount)}
              </span>
              <span className="text-gray-400">Voided</span>
              <span className="text-right text-red-400">
                {summary.voidedCount}
              </span>
              <span className="text-gray-400">Net profit</span>
              <span className="text-right text-emerald-400 font-bold">
                {formatNaira(summary.totalProfit)}
              </span>
            </div>
          </GlassCard>
        )}

        {/* Top products */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3 px-0.5">
            Top products
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
          ) : byProduct.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-gray-500">
              No product sales in this period
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {byProduct.map((p, i) => (
                <GlassCard key={p.productId} className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-teal-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.productName || p.productId}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {p.quantitySold} sold · {p.transactionCount} txns
                      </p>

                      {/* Bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500/60"
                          style={{
                            width: `${(p.revenue / maxRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">
                        {formatNaira(p.revenue)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatNaira(p.profit)} profit
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}