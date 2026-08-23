"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompare, RefreshCw } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { cn } from "@/lib/utils";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";
import type { ComparisonResult } from "@business/shared-types";
import { DeltaBadge } from "@/components/reports/DelteBadge";
import { formatNaira } from "@/components/reports/reportFormat";

export default function ReportsComparisonPage() {
  const app = useApplication();
  const { branchId } = useBusinessContext();
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const result = await app.report.getMonthOverMonth(branchId);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = data
    ? [
        { label: "Revenue", cur: data.current.revenue, prev: data.previous?.revenue ?? 0 },
        { label: "COGS", cur: data.current.cogs, prev: data.previous?.cogs ?? 0 },
        { label: "Expenses", cur: data.current.expenses, prev: data.previous?.expenses ?? 0 },
        { label: "Gross profit", cur: data.current.grossProfit, prev: data.previous?.grossProfit ?? 0 },
        { label: "Net profit", cur: data.current.netProfit, prev: data.previous?.netProfit ?? 0 },
      ]
    : [];

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2.5">
            <GlassIcon size="sm" variant="primary">
              <GitCompare className="w-4 h-4" />
            </GlassIcon>
            Month vs month
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
      </div>

      <div className="px-4 pt-4 space-y-3">
        <GlassCard variant="accent" className="p-4 text-xs text-gray-400">
          This month compared to last month
        </GlassCard>

        {rows.map((r) => (
          <GlassCard key={r.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Prev {formatNaira(r.prev)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-400">
                  {formatNaira(r.cur)}
                </p>
                <div className="mt-1">
                  <DeltaBadge current={r.cur} previous={r.prev} />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}