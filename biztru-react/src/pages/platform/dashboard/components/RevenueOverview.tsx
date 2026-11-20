
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Wallet,
} from "lucide-react";

import { GlassCard } from "../../../../components/ui/GlassCard";
import { GlassIcon } from "../../../../components/ui/GlassIcon";

import type {
  RevenueDataPoint,
} from "../types/dashboard.types";

interface RevenueOverviewProps {
  data: RevenueDataPoint[];
}

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1)}M`;
  }

  return `₦${value.toLocaleString("en-NG")}`;
};

export function RevenueOverview({
  data,
}: RevenueOverviewProps) {
  const [period, setPeriod] = useState<"6M" | "12M">("12M");

  const visibleData = useMemo(
    () => data.slice(period === "6M" ? -6 : -12),
    [data, period],
  );

  const totals = useMemo(() => {
    const current = visibleData.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const previous = visibleData.reduce(
      (sum, item) => sum + item.previousRevenue,
      0,
    );

    const growth =
      previous > 0
        ? ((current - previous) / previous) * 100
        : 0;

    return { current, previous, growth };
  }, [visibleData]);

  const maxValue = Math.max(
    ...visibleData.map((item) =>
      Math.max(item.revenue, item.previousRevenue),
    ),
    1,
  );

  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <GlassIcon
            icon="wallet"
            size="md"
            variant="success"
          />

          <div>
            <h2 className="font-semibold text-white">
              Revenue Overview
            </h2>
            <p className="text-xs text-white/40">
              Platform subscription revenue
            </p>
          </div>
        </div>

        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["6M", "12M"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                period === value
                  ? "bg-teal-400/15 text-teal-300"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-5">
        <div>
          <p className="text-xs text-white/40">
            Total revenue
          </p>
          <p className="mt-1 text-3xl font-bold text-white">
            {formatCurrency(totals.current)}
          </p>
        </div>

        <div className="mb-1 flex items-center gap-1 rounded-lg bg-teal-400/10 px-2 py-1 text-xs font-semibold text-teal-400">
          <ArrowUpRight size={14} />
          {totals.growth.toFixed(1)}%
        </div>
      </div>

      <div className="mt-8 flex h-52 items-end gap-2 sm:gap-4">
        {visibleData.map((item) => {
          const currentHeight =
            (item.revenue / maxValue) * 100;

          const previousHeight =
            (item.previousRevenue / maxValue) * 100;

          return (
            <div
              key={item.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-44 w-full items-end justify-center gap-1">
                <div
                  title={`Previous: ${formatCurrency(item.previousRevenue)}`}
                  className="w-2/5 rounded-t-md bg-white/15 transition-all"
                  style={{
                    height: `${previousHeight}%`,
                    minHeight: "3px",
                  }}
                />

                <div
                  title={`Current: ${formatCurrency(item.revenue)}`}
                  className="w-2/5 rounded-t-md bg-teal-400 transition-all"
                  style={{
                    height: `${currentHeight}%`,
                    minHeight: "3px",
                  }}
                />
              </div>

              <span className="text-[10px] text-white/40 sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-white/[0.07] pt-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Current period
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          Previous period
        </div>
      </div>
    </GlassCard>
  );
}
