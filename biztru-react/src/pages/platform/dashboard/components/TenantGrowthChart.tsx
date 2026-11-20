
import { useMemo, useState } from "react";
import { GlassCard } from "../../../../components/ui/GlassCard";
import { GlassIcon } from "../../../../components/ui/GlassIcon";

import type {
  TenantGrowthDataPoint,
} from "../types/dashboard.types";

interface TenantGrowthChartProps {
  data: TenantGrowthDataPoint[];
}

export function TenantGrowthChart({
  data,
}: TenantGrowthChartProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<"tenants" | "branches">("tenants");

  const currentValue =
    data[data.length - 1]?.[selectedMetric] ?? 0;

  const previousValue =
    data[data.length - 2]?.[selectedMetric] ?? 0;

  const growth =
    previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

  const maxValue = useMemo(
    () =>
      Math.max(...data.map((item) => item[selectedMetric]), 1),
    [data, selectedMetric],
  );

  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GlassIcon
            icon="building-2"
            size="md"
            variant="primary"
          />

          <div>
            <h2 className="font-semibold text-white">
              Ecosystem Growth
            </h2>
            <p className="text-xs text-white/40">
              Platform expansion over time
            </p>
          </div>
        </div>

        <select
          value={selectedMetric}
          onChange={(event) =>
            setSelectedMetric(
              event.target.value as "tenants" | "branches",
            )
          }
          className="rounded-xl border border-white/10 bg-[#17212E] px-3 py-2 text-xs text-white outline-none"
        >
          <option value="tenants">Businesses</option>
          <option value="branches">Branches</option>
        </select>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-bold text-white">
            {currentValue.toLocaleString("en-NG")}
          </h3>

          <span className="mb-1 text-xs font-semibold text-teal-400">
            +{growth.toFixed(1)}%
          </span>
        </div>

        <p className="mt-1 text-xs text-white/40">
          Registered {selectedMetric}
        </p>
      </div>

      <div className="mt-7 flex h-40 items-end gap-2">
        {data.map((item) => {
          const value = item[selectedMetric];
          const height = (value / maxValue) * 100;

          return (
            <div
              key={item.label}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-32 w-full items-end">
                <div
                  title={`${value.toLocaleString()} ${selectedMetric}`}
                  className="w-full rounded-t-md bg-gradient-to-t from-teal-600/60 to-teal-300 transition-all duration-300 group-hover:brightness-125"
                  style={{
                    height: `${height}%`,
                    minHeight: "4px",
                  }}
                />
              </div>

              <span className="text-[10px] text-white/40">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
