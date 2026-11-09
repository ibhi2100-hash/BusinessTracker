import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Package,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import type { Sales } from "@business/shared-types";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/utils";

interface SalesAnalysisPageProps {
  sales: Sales[];
  loading?: boolean;
  error?: string | null;
  branchName?: string;
  onRetry?: () => void;
}

const money = (value: number) =>
  `₦${(Number.isFinite(value) ? value : 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const number = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString("en-NG");

function quantityOf(sale: Sales): number {
  const value = Number(sale.quantity);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function totalOf(sale: Sales): number {
  const value = Number(sale.total);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function costOf(sale: Sales): number {
  const value = Number((sale as any).costPrice ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function profitOf(sale: Sales): number {
  const explicit = (sale as any).profit;
  return typeof explicit === "number" && Number.isFinite(explicit)
    ? explicit
    : totalOf(sale) - costOf(sale);
}

function dateOf(sale: Sales): Date | null {
  const date = new Date(sale.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
}

function Metric({
  label,
  value,
  detail,
  icon,
  tone = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: "teal" | "green" | "blue" | "amber";
}) {
  const tones = {
    teal: "text-teal-300 bg-teal-400/10 border-teal-400/15",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
    blue: "text-blue-300 bg-blue-400/10 border-blue-400/15",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/15",
  };

  return (
    <GlassCard className="min-w-0 p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] leading-4 text-gray-400 sm:text-xs">{label}</p>
          <p className="mt-2 break-words text-lg font-bold tracking-tight text-white sm:text-xl">{value}</p>
          <p className="mt-1 text-[10px] leading-4 text-gray-500 sm:text-[11px]">{detail}</p>
        </div>
        <span className={cn("shrink-0 rounded-xl border p-2", tones[tone])}>{icon}</span>
      </div>
    </GlassCard>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-gray-500">
      {children}
    </div>
  );
}

export default function SalesAnalysisPage({
  sales,
  loading = false,
  error = null,
  branchName = "Selected branch",
  onRetry,
}: SalesAnalysisPageProps) {
  const [productSort, setProductSort] = useState<"revenue" | "profit" | "quantity">("revenue");

  const completed = useMemo(() => sales.filter((sale) => sale.status === "completed"), [sales]);
  const refunded = useMemo(() => sales.filter((sale) => sale.status === "refunded"), [sales]);
  const voided = useMemo(() => sales.filter((sale) => sale.status === "voided"), [sales]);

  const metrics = useMemo(() => {
    const revenue = completed.reduce((sum, sale) => sum + totalOf(sale), 0);
    const cost = completed.reduce((sum, sale) => sum + costOf(sale), 0);
    const profit = completed.reduce((sum, sale) => sum + profitOf(sale), 0);
    const units = completed.reduce((sum, sale) => sum + quantityOf(sale), 0);
    return {
      revenue,
      cost,
      profit,
      units,
      average: completed.length ? revenue / completed.length : 0,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    };
  }, [completed]);

  const productRows = useMemo(() => {
    const map = new Map<string, { id: string; name: string; transactions: number; quantity: number; revenue: number; cost: number; profit: number }>();
    for (const sale of completed) {
      const id = sale.productId || sale.productName || "unknown";
      const row = map.get(id) ?? {
        id,
        name: sale.productName || sale.productId || "Unnamed product",
        transactions: 0,
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };
      row.transactions += 1;
      row.quantity += quantityOf(sale);
      row.revenue += totalOf(sale);
      row.cost += costOf(sale);
      row.profit += profitOf(sale);
      map.set(id, row);
    }
    return [...map.values()].sort((a, b) => {
      if (productSort === "profit") return b.profit - a.profit;
      if (productSort === "quantity") return b.quantity - a.quantity;
      return b.revenue - a.revenue;
    });
  }, [completed, productSort]);

  const trend = useMemo(() => {
    const byDay = new Map<string, { date: Date; revenue: number; profit: number; count: number }>();
    for (const sale of completed) {
      const date = dateOf(sale);
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const point = byDay.get(key) ?? { date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), revenue: 0, profit: 0, count: 0 };
      point.revenue += totalOf(sale);
      point.profit += profitOf(sale);
      point.count += 1;
      byDay.set(key, point);
    }
    return [...byDay.values()].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-14);
  }, [completed]);

  const maxRevenue = Math.max(1, ...trend.map((point) => point.revenue));
  const paymentRows = useMemo(() => {
    const map = new Map<string, { method: string; count: number; revenue: number }>();
    for (const sale of completed) {
      const method = String(sale.paymentMethod || "Not recorded");
      const row = map.get(method) ?? { method, count: 0, revenue: 0 };
      row.count += 1;
      row.revenue += totalOf(sale);
      map.set(method, row);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [completed]);

  const statusCount = [
    { label: "Completed", value: completed.length, style: "bg-emerald-400" },
    { label: "Refunded", value: refunded.length, style: "bg-amber-400" },
    { label: "Voided", value: voided.length, style: "bg-rose-400" },
  ];
  const statusTotal = Math.max(1, sales.length);

  if (loading && sales.length === 0) {
    return <div className="px-3 py-20 text-center text-sm text-gray-400" role="status">Loading sales analysis…</div>;
  }

  if (error && sales.length === 0) {
    return (
      <GlassCard className="mx-3 my-5 p-6 text-center">
        <p className="text-sm text-amber-200">{error}</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs text-white">Try again</button>}
      </GlassCard>
    );
  }

  if (sales.length === 0) {
    return (
      <GlassCard className="mx-3 my-5">
        <EmptyPanel>
          <BarChart3 className="h-7 w-7" />
          <p>No sales data is available for this period.</p>
          <p className="max-w-sm text-xs text-gray-600">Once transactions are recorded, revenue, profit, product performance and payment analysis will appear here.</p>
        </EmptyPanel>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4 px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Sales performance</p>
          <p className="mt-0.5 text-xs text-gray-500">{branchName} · {number(sales.length)} records returned (query limit: 200)</p>
        </div>
        {loading && <span className="text-[11px] text-teal-300">Updating…</span>}
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 sm:gap-3">
        <Metric label="Completed revenue" value={money(metrics.revenue)} detail={`${number(completed.length)} completed sales`} icon={<CircleDollarSign className="h-4 w-4" />} tone="green" />
        <Metric label="Estimated gross profit" value={money(metrics.profit)} detail={`${metrics.margin.toFixed(1)}% revenue margin`} icon={<TrendingUp className="h-4 w-4" />} tone="teal" />
        <Metric label="Units sold" value={number(metrics.units)} detail={`${number(productRows.length)} products sold`} icon={<ShoppingCart className="h-4 w-4" />} tone="blue" />
        <Metric label="Average sale value" value={money(metrics.average)} detail="Revenue ÷ completed transactions" icon={<Banknote className="h-4 w-4" />} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <GlassCard className="min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Revenue trend</h2>
              <p className="mt-1 text-[11px] text-gray-500">Daily completed revenue · latest 14 active dates</p>
            </div>
            <Activity className="h-4 w-4 text-teal-300" />
          </div>
          {trend.length === 0 ? <EmptyPanel>No valid transaction dates to chart.</EmptyPanel> : (
            <div className="mt-5 flex h-44 items-end gap-1.5 sm:gap-2">
              {trend.map((point) => (
                <div key={point.date.toISOString()} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" title={`${shortDate(point.date)}: ${money(point.revenue)}`}>
                  <div className="flex h-full items-end overflow-hidden rounded-t-md bg-white/[0.035]">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-teal-600/80 to-teal-300" style={{ height: `${Math.max(3, (point.revenue / maxRevenue) * 100)}%` }} />
                  </div>
                  <span className="truncate text-center text-[9px] text-gray-500">{shortDate(point.date)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-gray-500">
            <span>Peak day</span>
            <span className="font-medium text-gray-300">{trend.length ? money(Math.max(...trend.map((point) => point.revenue))) : money(0)}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-white">Transaction outcomes</h2>
          <p className="mt-1 text-[11px] text-gray-500">All returned sale statuses</p>
          <div className="mt-5 space-y-4">
            {statusCount.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-semibold tabular-nums text-white">{number(item.value)} <span className="font-normal text-gray-500">({((item.value / statusTotal) * 100).toFixed(1)}%)</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className={cn("h-full rounded-full", item.style)} style={{ width: `${(item.value / statusTotal) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-4">
            <div><p className="text-[10px] text-gray-500">Cost of completed sales</p><p className="mt-1 text-sm font-semibold text-white">{money(metrics.cost)}</p></div>
            <div><p className="text-[10px] text-gray-500">Refunded records</p><p className="mt-1 text-sm font-semibold text-amber-300">{number(refunded.length)}</p></div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
          <div><h2 className="text-sm font-semibold text-white">Product performance</h2><p className="mt-1 text-[11px] text-gray-500">Products ranked from completed sales only</p></div>
          <select value={productSort} onChange={(event) => setProductSort(event.target.value as typeof productSort)} className="rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs text-gray-200 outline-none focus:border-teal-400">
            <option value="revenue">Sort: Revenue</option><option value="profit">Sort: Profit</option><option value="quantity">Sort: Units sold</option>
          </select>
        </div>
        {productRows.length === 0 ? <EmptyPanel>No completed product sales in this period.</EmptyPanel> : (
          <>
            <div className="divide-y divide-white/[0.05] sm:hidden">
              {productRows.slice(0, 12).map((row, index) => (
                <div key={row.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-2.5"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] text-gray-400">{index + 1}</span><div className="min-w-0"><p className="truncate text-xs font-medium text-white">{row.name}</p><p className="mt-1 text-[10px] text-gray-500">{number(row.quantity)} units · {number(row.transactions)} transactions</p></div></div><div className="shrink-0 text-right"><p className="text-xs font-semibold text-white">{money(row.revenue)}</p><p className={cn("mt-1 text-[10px]", row.profit >= 0 ? "text-emerald-300" : "text-rose-300")}>Profit {money(row.profit)}</p></div></div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-white/[0.025] text-[10px] uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 text-right font-medium">Units</th><th className="px-4 py-3 text-right font-medium">Transactions</th><th className="px-4 py-3 text-right font-medium">Revenue</th><th className="px-4 py-3 text-right font-medium">Profit</th></tr></thead>
                <tbody className="divide-y divide-white/[0.05]">{productRows.slice(0, 30).map((row) => <tr key={row.id} className="hover:bg-white/[0.025]"><td className="max-w-[260px] truncate px-4 py-3 font-medium text-gray-200">{row.name}</td><td className="px-4 py-3 text-right tabular-nums text-gray-300">{number(row.quantity)}</td><td className="px-4 py-3 text-right tabular-nums text-gray-400">{number(row.transactions)}</td><td className="px-4 py-3 text-right tabular-nums text-white">{money(row.revenue)}</td><td className={cn("px-4 py-3 text-right tabular-nums", row.profit >= 0 ? "text-emerald-300" : "text-rose-300")}>{money(row.profit)}</td></tr>)}</tbody>
              </table>
            </div>
            {productRows.length > 12 && <p className="border-t border-white/[0.05] px-4 py-3 text-[10px] text-gray-500">Showing the top 12 products on mobile and top 30 on desktop.</p>}
          </>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-300" /><h2 className="text-sm font-semibold text-white">Payment methods</h2></div>
          <p className="mt-1 text-[11px] text-gray-500">Completed sales grouped by recorded payment method</p>
          {paymentRows.length === 0 ? <EmptyPanel>No payment method data.</EmptyPanel> : <div className="mt-4 space-y-3">{paymentRows.slice(0, 6).map((row) => <div key={row.method} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-medium text-gray-200">{row.method}</p><p className="mt-0.5 text-[10px] text-gray-500">{number(row.count)} transactions</p></div><p className="shrink-0 text-xs font-semibold text-white">{money(row.revenue)}</p></div>)}</div>}
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal-300" /><h2 className="text-sm font-semibold text-white">Analysis notes</h2></div>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-gray-400">
            <li className="flex gap-2"><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>Revenue, units, product ranking and average sale value use completed transactions only.</span></li>
            <li className="flex gap-2"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span>Refunded and voided records are counted separately and excluded from completed revenue.</span></li>
            <li className="flex gap-2"><ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" /><span>Profit is an estimate based on the stored sale profit or cost fields. Confirm the meaning of those fields in your sales domain before using it for accounting.</span></li>
            <li className="flex gap-2"><Package className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><span>This report analyzes the sale records returned by the sales API. It is not a substitute for a complete ledger or reconciliation report.</span></li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
