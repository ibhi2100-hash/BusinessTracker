"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarRange, RefreshCw } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { cn } from "@/lib/utils";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";
import type { YearlyRow } from "@business/shared-types";
import { BarSeries } from "@/components/reports/BarSeries";
import { formatNaira } from "@/components/reports/reportFormat";

export default function ReportsYearlyPage() {
  const app = useApplication();
  const { branchId } = useBusinessContext();
  const [rows, setRows] = useState<YearlyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const data = await app.report.getYearSeries(branchId, 6);
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2.5">
            <GlassIcon size="sm" variant="primary">
              <CalendarRange className="w-4 h-4" />
            </GlassIcon>
            Yearly
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

      <div className="px-4 pt-4 space-y-4">
        <GlassCard className="p-4">
          <h2 className="text-sm font-semibold mb-4">Revenue by year</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No data</p>
          ) : (
            <BarSeries
              data={rows.map((r) => ({
                label: String(r.year),
                value: r.revenue,
                secondary: r.netProfit,
              }))}
            />
          )}
        </GlassCard>

        {rows.map((r) => (
          <GlassCard key={r.year} className="p-4">
            <p className="text-sm font-semibold mb-3">{r.year}</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-400">Revenue</span>
              <span className="text-right">{formatNaira(r.revenue)}</span>
              <span className="text-gray-400">COGS</span>
              <span className="text-right">{formatNaira(r.cogs)}</span>
              <span className="text-gray-400">Expenses</span>
              <span className="text-right">{formatNaira(r.expenses)}</span>
              <span className="text-gray-400">Gross profit</span>
              <span className="text-right text-teal-300">
                {formatNaira(r.grossProfit)}
              </span>
              <span className="text-gray-400">Net profit</span>
              <span
                className={cn(
                  "text-right font-bold",
                  r.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {formatNaira(r.netProfit)}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}