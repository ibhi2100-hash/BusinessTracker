
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarRange,
  RefreshCw,
  FileText,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassIcon } from "../ui/GlassIcon";

import { cn } from "../../lib/utils";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import type { YearlyRow } from "@business/shared-types";

import { BarSeries } from "./BarSeries";
import { formatNaira } from "./reportFormat";

export default function ReportsYearlyPage() {
  const app = useApplication();
  const navigate = useNavigate();

  const { branchId } = useBusinessContext();

  const [rows, setRows] = useState<YearlyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!branchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log("[ReportsYearly] Loading yearly report", {
        branchId,
      });

      const data = await app.report.getYearSeries(branchId, 6);

      setRows(data);

      console.log("[ReportsYearly] Yearly data loaded", data);
    } catch (e) {
      console.error("[ReportsYearly] Failed to load", e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">

      {/* HEADER */}

      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">

        <div className="px-4 pt-4 pb-3 flex items-center justify-between">

          <h1 className="text-xl font-semibold flex items-center gap-2.5">

            <GlassIcon size="sm" variant="primary">
              <CalendarRange className="w-4 h-4" />
            </GlassIcon>

            Yearly

          </h1>

          <div className="flex items-center gap-1">

            <GlassButton
              variant="tertiary"
              onClick={() => navigate("/reports/business")}
              icon={<FileText className="w-4 h-4" />}
            />

            <GlassButton
              variant="tertiary"
              onClick={load}
              disabled={loading}
              icon={
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    loading && "animate-spin"
                  )}
                />
              }
            />

          </div>

        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* REPORT LINK */}

        <button
          onClick={() => navigate("/reports/business")}
          className="w-full flex items-center justify-between rounded-xl border border-teal-500/20 bg-teal-500/[0.08] p-3 text-left hover:bg-teal-500/[0.13] transition"
        >

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-teal-500/15 p-2">
              <FileText className="w-5 h-5 text-teal-300" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Complete business report
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Download annual and financial analysis PDF
              </p>
            </div>

          </div>

          <span className="text-teal-300 text-lg">→</span>

        </button>

        {/* YEARLY CHART */}

        <GlassCard className="p-4">

          <h2 className="text-sm font-semibold mb-4">
            Revenue by year
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Loading yearly performance...
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No data
            </p>
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

        {/* YEARLY RECORDS */}

        {rows.map((r) => (

          <GlassCard key={r.year} className="p-4">

            <div className="flex items-center justify-between mb-3">

              <p className="text-sm font-semibold">
                {r.year}
              </p>

              <span className="text-xs text-gray-500">
                Annual performance
              </span>

            </div>

            <div className="grid grid-cols-2 gap-y-3 text-sm">

              <span className="text-gray-400">Revenue</span>

              <span className="text-right">
                {formatNaira(r.revenue)}
              </span>

              <span className="text-gray-400">COGS</span>

              <span className="text-right">
                {formatNaira(r.cogs)}
              </span>

              <span className="text-gray-400">Expenses</span>

              <span className="text-right">
                {formatNaira(r.expenses)}
              </span>

              <span className="text-gray-400">Gross profit</span>

              <span className="text-right text-teal-300">
                {formatNaira(r.grossProfit)}
              </span>

              <span className="text-gray-400">Net profit</span>

              <span
                className={cn(
                  "text-right font-bold",
                  r.netProfit >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {formatNaira(r.netProfit)}
              </span>

            </div>

          </GlassCard>

        ))}

        {!loading && rows.length === 0 && (
          <GlassCard className="p-4">
            <p className="text-center text-sm text-gray-500">
              No annual financial records are available.
            </p>
          </GlassCard>
        )}

      </div>
    </div>
  );
}
