
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
} from "lucide-react";

import { GlassCard } from "../../../../components/ui/GlassCard";
import { GlassIcon } from "../../../../components/ui/GlassIcon";

import type {
  PlatformMetric,
} from "../types/dashboard.types";

interface PlatformMetricGridProps {
  metrics: PlatformMetric[];
}

export function PlatformMetricGrid({
  metrics,
}: PlatformMetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const isPositive = metric.trend === "up";
        const isNegative = metric.trend === "down";

        return (
          <GlassCard
            key={metric.id}
            variant="default"
            className="group p-5 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/50">
                  {metric.label}
                </p>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                  {metric.value}
                </h3>
              </div>

              <GlassIcon
                icon={metric.icon}
                size="lg"
                variant={metric.variant}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                  isPositive
                    ? "bg-teal-400/10 text-teal-400"
                    : isNegative
                      ? "bg-rose-400/10 text-rose-400"
                      : "bg-white/5 text-white/50"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={13} />
                ) : isNegative ? (
                  <ArrowDownRight size={13} />
                ) : (
                  <Minus size={13} />
                )}

                {metric.change}
              </span>

              <span className="text-xs text-white/40">
                {metric.description}
              </span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
