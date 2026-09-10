"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Receipt,
  Filter,
  RefreshCw,
  ShoppingBag,
  Calendar,
  X,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { GlassSheet } from "@/components/ui/GlassSheet";
import { cn } from "@/lib/utils";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";
import type { SaleFilters } from "@/src/services/ApplicationService/API/Sales/SalesApi"; // adjust path
import { Sales } from "@business/shared-types";

type StatusFilter = "all" | "completed" | "voided" | "refunded";

function formatNaira(n: number) {
  return `₦${(n || 0).toLocaleString()}`;
}

function formatDate(ts: string | number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    voided: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize",
        styles[status] ?? "bg-white/5 text-gray-400 border-white/10"
      )}
    >
      {status}
    </span>
  );
}

export default function SalesListPage() {
  const app = useApplication();
  const { businessId, branchId } = useBusinessContext();

  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Sales | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const filters: SaleFilters = {
        branchId: branchId ?? undefined,
        businessId,
        status,
        from: from || undefined,
        to: to || undefined,
        limit: 200,
      };

      const rows = await app.sales.listSales(filters);

      console.log("This is the Sales i Get for the whole Business: ", rows)
      setSales(rows);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [app, branchId, status, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sales;
    const q = search.toLowerCase();
    return sales.filter(
      (s) =>
        s.productName?.toLowerCase().includes(q) ||
        s.productId.toLowerCase().includes(q) ||
        s.customerRef?.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [sales, search]);

  const pageTotal = useMemo(
    () =>
      filtered
        .filter((s) => s.status === "completed")
        .reduce((sum, s) => sum + s.total, 0),
    [filtered]
  );

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <Receipt className="w-4 h-4" />
              </GlassIcon>
              Sales
            </h1>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="secondary"
                onClick={() => setFilterOpen(true)}
                icon={<Filter className="w-4 h-4" />}
              >
                Filters
              </GlassButton>
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
          </div>

          <GlassInput
            icon={<Search className="w-4 h-4" />}
            placeholder="Search product, customer, id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Status chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "completed", "voided", "refunded"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs capitalize border whitespace-nowrap transition",
                    status === s
                      ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                      : "bg-white/[0.04] text-gray-400 border-white/10"
                  )}
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="px-4 pt-4">
        <GlassCard variant="accent" className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Showing</p>
            <p className="text-sm font-semibold">
              {filtered.length} sale{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Completed total</p>
            <p className="text-lg font-bold text-emerald-400">
              {formatNaira(pageTotal)}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-2.5">
        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            Loading sales…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-500">
            <GlassIcon size="lg" variant="primary">
              <ShoppingBag className="w-6 h-6" />
            </GlassIcon>
            <p className="mt-4 text-sm">No sales found</p>
          </div>
        ) : (
          filtered.map((sale) => (
            <button
              key={sale.id}
              type="button"
              onClick={() => setSelected(sale)}
              className="w-full text-left"
            >
              <GlassCard
                variant="default"
                className="p-4 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {sale.productName || sale.productId}
                      </p>
                      <StatusPill status={sale.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {sale.quantity} × {formatNaira(sale.total / (sale.quantity || 1))}
                      {sale.customerRef ? ` · ${sale.customerRef}` : ""}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">
                      {formatNaira(sale.total)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Profit {formatNaira(sale.profit ?? sale.total - (sale as any).costPrice)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </button>
          ))
        )}
      </div>

      {/* Detail sheet */}
      <GlassSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Sale details"
        subtitle={selected ? formatDate(selected.createdAt) : undefined}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <StatusPill status={selected.status} />
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Product" value={selected.productName || selected.productId} />
              <Row label="Quantity" value={String(selected.quantity)} />
              <Row label="Line total" value={formatNaira(selected.total)} />
              <Row
                label="Cost"
                value={formatNaira((selected as any).costPrice ?? 0)}
              />
              <Row
                label="Profit"
                value={formatNaira(
                  selected.profit ??
                    selected.total - ((selected as any).costPrice ?? 0)
                )}
              />
              {selected.paymentMethod && (
                <Row label="Payment" value={selected.paymentMethod} />
              )}
              {selected.customerRef && (
                <Row label="Customer" value={selected.customerRef} />
              )}
              <Row label="Sale ID" value={selected.id} mono />
              {selected.mode && <Row label="Mode" value={selected.mode} />}
            </div>
          </div>
        )}
      </GlassSheet>

      {/* Filters sheet */}
      <GlassSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setFrom("");
                setTo("");
                setStatus("all");
              }}
            >
              Reset
            </GlassButton>
            <GlassButton
              variant="primary"
              className="flex-1"
              onClick={() => {
                setFilterOpen(false);
                load();
              }}
            >
              Apply
            </GlassButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">From</label>
            <input
              type="date"
              value={from ? from.slice(0, 10) : ""}
              onChange={(e) =>
                setFrom(
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : ""
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">To</label>
            <input
              type="date"
              value={to ? to.slice(0, 10) : ""}
              onChange={(e) =>
                setTo(
                  e.target.value
                    ? new Date(e.target.value + "T23:59:59").toISOString()
                    : ""
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </GlassSheet>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span
        className={cn(
          "text-right text-white truncate",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}