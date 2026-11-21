
import { useCallback, useEffect, useState } from "react";

import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { billingFinancialApi } from "../../../services/business/billing/billing-financial.api";

import type { BusinessPayment } from "../../../types/billing/billing-financial.types";

export default function BusinessPaymentsPage() {
  const [payments, setPayments] = useState<BusinessPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPayments(await billingFinancialApi.payments());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusIcon = (status: string) => {
    if (status === "SUCCESSFUL") {
      return <CheckCircle2 className="text-emerald-400" size={18} />;
    }

    if (status === "FAILED") {
      return <XCircle className="text-red-400" size={18} />;
    }

    return <Clock className="text-amber-400" size={18} />;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-sm text-gray-400 mt-2">
            View transactions recorded against your business account.
          </p>
        </div>

        <GlassButton variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </GlassButton>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 text-red-400 p-4 text-sm">
          {error}
        </div>
      )}

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <CreditCard className="text-teal-400" size={22} />
          <h2 className="font-semibold">Transactions</h2>
        </div>

        <div className="overflow-x-auto mt-5">
          <table className="w-full min-w-[650px] text-sm text-left">
            <thead className="text-gray-500 text-xs border-b border-white/10">
              <tr>
                <th className="py-4">Reference</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No payment records available.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5">
                    <td className="py-5 font-mono text-xs">
                      {payment.reference}
                    </td>

                    <td>{payment.provider}</td>

                    <td className="font-semibold">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: payment.currency,
                      }).format(Number(payment.amountMinor) / 100)}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        {statusIcon(payment.status)}
                        {payment.status}
                      </div>
                    </td>

                    <td>
                      {new Date(payment.createdAt).toLocaleDateString()}
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
