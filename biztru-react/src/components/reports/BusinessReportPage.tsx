
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  Wallet,
  Package,
  Scale,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassIcon } from "../ui/GlassIcon";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import type {
  DashboardSummary,
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
} from "@business/shared-types";

import type { PresetPeriod } from "../../Biztru/services/ApplicationService/API/report/ReportApi";

import { formatNaira } from "./reportFormat";

import {
  downloadBusinessReport,
  printBusinessReport,
  type BusinessReportData,
} from "./businessReportPdf";

import { cn } from "../../lib/utils";

const PRESETS: {
  key: PresetPeriod;
  label: string;
}[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "this_month", label: "This month" },
  { key: "this_year", label: "This year" },
];

const PERIOD_LABELS: Record<string, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  this_month: "This month",
  this_year: "This year",
};

export default function BusinessReportPage() {
  const app = useApplication();
  const { branchId } = useBusinessContext();

  const [preset, setPreset] = useState<PresetPeriod>("this_month");

  const [dashboard, setDashboard] =
    useState<DashboardSummary | null>(null);

  const [summary, setSummary] =
    useState<ReportSummary | null>(null);

  const [monthly, setMonthly] =
    useState<MonthlyRow[]>([]);

  const [yearly, setYearly] =
    useState<YearlyRow[]>([]);

  const [comparison, setComparison] =
    useState<ComparisonResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!branchId) {
      setLoading(false);
      setError("No branch is currently selected.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[BusinessReport] Loading report data", {
        branchId,
        preset,
      });

      const [
        dashboardData,
        summaryData,
        monthlyData,
        yearlyData,
        comparisonData,
      ] = await Promise.all([
        app.report.getDashboard(branchId),
        app.report.getPresetSummary(branchId, preset),
        app.report.getLast12Months(branchId),
        app.report.getYearSeries(branchId, 6),
        app.report.getMonthOverMonth(branchId),
      ]);

      setDashboard(dashboardData);
      setSummary(summaryData);
      setMonthly(monthlyData);
      setYearly(yearlyData);
      setComparison(comparisonData);

      console.log("[BusinessReport] Report data loaded", {
        dashboardData,
        summaryData,
        monthlyData,
        yearlyData,
        comparisonData,
      });
    } catch (e) {
      console.error("[BusinessReport] Failed to load report", e);

      setError(
        e instanceof Error
          ? e.message
          : "Unable to load business report data."
      );
    } finally {
      setLoading(false);
    }
  }, [app, branchId, preset]);

  useEffect(() => {
    load();
  }, [load]);

  const isReady =
    !!dashboard &&
    !!summary &&
    !!comparison;

  const reportData: BusinessReportData | null =
    isReady
      ? {
          branchId: String(branchId),
          period: PERIOD_LABELS[preset] ?? preset,
          generatedAt: new Date(),
          dashboard: dashboard!,
          summary: summary!,
          monthly,
          yearly,
          comparison: comparison!,
        }
      : null;

  const handleDownload = () => {
    if (!reportData) return;

    try {
      setGenerating(true);

      console.log("[BusinessReport] Generating PDF download");

      downloadBusinessReport(reportData);
    } catch (e) {
      console.error("[BusinessReport] PDF download failed", e);

      window.alert(
        e instanceof Error
          ? e.message
          : "Unable to generate PDF."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;

    try {
      setGenerating(true);

      console.log("[BusinessReport] Preparing print document");

      printBusinessReport(reportData);
    } catch (e) {
      console.error("[BusinessReport] Print failed", e);

      window.alert(
        e instanceof Error
          ? e.message
          : "Unable to prepare the print document."
      );
    } finally {
      setGenerating(false);
    }
  };

  const grossMargin =
    summary && summary.revenue > 0
      ? (summary.grossProfit / summary.revenue) * 100
      : 0;

  const netMargin =
    summary && summary.revenue > 0
      ? (summary.netProfit / summary.revenue) * 100
      : 0;

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">

      {/* HEADER */}

      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-3">

          <div className="flex items-center justify-between">

            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <FileText className="w-4 h-4" />
              </GlassIcon>

              Business Report
            </h1>

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

        {/* ERROR */}

        {error && (
          <GlassCard className="p-4 border border-red-500/20">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />

              <div>
                <p className="text-sm font-semibold text-red-300">
                  Report loading failed
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {error}
                </p>

                <button
                  onClick={load}
                  className="text-xs text-teal-300 mt-3"
                >
                  Try again
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* REPORT INFORMATION */}

        <GlassCard variant="accent" className="p-4 space-y-3">

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/10">
              <FileText className="w-6 h-6 text-teal-300" />
            </div>

            <div>
              <h2 className="font-semibold">
                Comprehensive Business Report
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                {PERIOD_LABELS[preset]} · Branch {branchId ?? "—"}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            A consolidated financial report covering business
            balances, profitability, monthly comparisons,
            historical performance and management analysis.
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Includes financial analysis and recommendations
          </div>

        </GlassCard>

        {/* PERFORMANCE */}

        <div className="space-y-3">

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Financial performance
          </p>

          <div className="grid grid-cols-2 gap-3">

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500">Revenue</p>

              <p className="text-base font-bold mt-2">
                {loading ? "…" : formatNaira(summary?.revenue ?? 0)}
              </p>
            </GlassCard>

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500">Gross profit</p>

              <p className="text-base font-bold mt-2 text-teal-300">
                {loading ? "…" : formatNaira(summary?.grossProfit ?? 0)}
              </p>
            </GlassCard>

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500">Net profit</p>

              <p className={cn(
                "text-base font-bold mt-2",
                (summary?.netProfit ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              )}>
                {loading ? "…" : formatNaira(summary?.netProfit ?? 0)}
              </p>
            </GlassCard>

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500">Expenses</p>

              <p className="text-base font-bold mt-2">
                {loading ? "…" : formatNaira(summary?.expenses ?? 0)}
              </p>
            </GlassCard>

          </div>

        </div>

        {/* FINANCIAL POSITION */}

        <div className="space-y-3">

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Financial position
          </p>

          <GlassCard className="p-4 space-y-4">

            {[
              {
                label: "Cash",
                value: dashboard?.cash ?? 0,
                icon: Wallet,
              },
              {
                label: "Bank",
                value: dashboard?.bank ?? 0,
                icon: Wallet,
              },
              {
                label: "Inventory",
                value: dashboard?.inventoryValue ?? 0,
                icon: Package,
              },
              {
                label: "Liabilities",
                value: dashboard?.liabilities ?? 0,
                icon: Scale,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>

                  <span className="text-sm font-medium">
                    {loading ? "…" : formatNaira(item.value)}
                  </span>
                </div>
              );
            })}

          </GlassCard>

        </div>

        {/* ANALYSIS */}

        <div className="space-y-3">

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Business analysis
          </p>

          <GlassCard className="p-4 space-y-4">

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gross margin</span>
                <span>{loading ? "…" : `${grossMargin.toFixed(2)}%`}</span>
              </div>

              <div className="h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, grossMargin))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Net margin</span>
                <span>{loading ? "…" : `${netMargin.toFixed(2)}%`}</span>
              </div>

              <div className="h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, netMargin))}%`,
                  }}
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                The PDF includes detailed analysis of margins,
                cost structure, liquidity coverage, revenue
                movement and management recommendations.
              </p>
            </div>

          </GlassCard>

        </div>

        {/* REPORT CONTENT */}

        <GlassCard className="p-4 space-y-3">

          <h2 className="text-sm font-semibold">
            What's included in the PDF?
          </h2>

          {[
            "Executive summary",
            "Financial performance and profitability",
            "Financial position indicators",
            "Month-over-month comparison",
            "Last 12 months performance",
            "Yearly financial performance",
            "Business analysis and recommendations",
            "Management conclusion",
          ].map((item, index) => (
            <div key={item} className="flex gap-2 items-center">
              <span className="text-xs text-teal-300">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="text-sm text-gray-300">
                {item}
              </span>
            </div>
          ))}

        </GlassCard>

        {/* GENERATION ACTIONS */}

        <div className="space-y-3 pb-5">

          <button
            onClick={handleDownload}
            disabled={!isReady || loading || generating || !!error}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm transition",
              "bg-teal-500 text-black hover:bg-teal-400",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />

            {generating ? "Preparing report..." : "Download PDF Report"}
          </button>

          <button
            onClick={handlePrint}
            disabled={!isReady || loading || generating || !!error}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm",
              "bg-white/[0.06] border border-white/10 text-white hover:bg-white/10",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Printer className="w-4 h-4" />

            Print Business Report
          </button>

          {loading && (
            <p className="text-center text-xs text-gray-500">
              Preparing business reporting data...
            </p>
          )}

          {!loading && isReady && (
            <p className="text-center text-xs text-gray-500">
              Your report is ready to generate.
            </p>
          )}

        </div>

      </div>
    </div>
  );
}
