
import { useCallback, useEffect, useState } from "react";

import {
  Receipt,
  CreditCard,
  Clock,
  RefreshCw,
  Download,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { billingFinancialApi } from "../../../services/business/billing/billing-financial.api";

import type {
  BusinessInvoice,
  InvoiceStatus,
} from "../../../types/billing/billing-financial.types";

function money(amount: string, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(Number(amount) / 100);
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const colors: Record<InvoiceStatus, string> = {
    DRAFT: "text-gray-400 bg-gray-500/10",
    OPEN: "text-blue-400 bg-blue-500/10",
    PAID: "text-emerald-400 bg-emerald-500/10",
    PARTIALLY_PAID: "text-amber-400 bg-amber-500/10",
    OVERDUE: "text-red-400 bg-red-500/10",
    VOID: "text-gray-500 bg-gray-500/10",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${colors[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default function BusinessInvoicesPage() {
  const [invoices, setInvoices] = useState<BusinessInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      setInvoices(await billingFinancialApi.invoices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const outstanding = invoices
    .filter((item) => ["OPEN", "OVERDUE", "PARTIALLY_PAID"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.balanceMinor), 0);

  const paid = invoices
    .reduce((sum, item) => sum + Number(item.amountPaidMinor), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Payments</h1>
          <p className="text-sm text-gray-400 mt-2">
            Review your business billing history and payment records.
          </p>
        </div>

        <GlassButton variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </GlassButton>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 rounded-xl p-4 text-sm">
          <AlertCircle size={17} className="inline mr-2" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-5">
          <Receipt className="text-teal-400" size={21} />
          <h3 className="text-2xl font-bold mt-4">{invoices.length}</h3>
          <p className="text-xs text-gray-400 mt-1">Total invoices</p>
        </GlassCard>

        <GlassCard className="p-5">
          <CreditCard className="text-emerald-400" size={21} />
          <h3 className="text-2xl font-bold mt-4">
            {money(String(paid), "NGN")}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Recorded payments</p>
        </GlassCard>

        <GlassCard className="p-5">
          <Clock className="text-amber-400" size={21} />
          <h3 className="text-2xl font-bold mt-4">
            {money(String(outstanding), "NGN")}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Outstanding balances</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h2 className="font-semibold text-lg">Invoice History</h2>

        <div className="overflow-x-auto mt-5">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-white/10">
              <tr>
                <th className="py-4">Invoice</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <LoaderCircle className="animate-spin mx-auto text-teal-400" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No invoices have been generated.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5">
                    <td className="py-5 font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td>{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                    <td>{new Date(invoice.dueAt).toLocaleDateString()}</td>
                    <td className="font-semibold">
                      {money(invoice.totalMinor, invoice.currency)}
                    </td>
                    <td>
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
