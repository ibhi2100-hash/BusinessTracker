
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  RefreshCw,
  CreditCard,
  Building2,
  AlertCircle,
  LoaderCircle,
  Eye,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { platformSubscriptionApi } from "../../../services/platform/billing/platform-subscription.api";

import type {
  PlatformSubscription,
} from "../../../types/billing/platform-billing.types";

export default function BillingSubscriptionsPage() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<PlatformSubscription[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSubscriptions(await platformSubscriptionApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return subscriptions.filter((item) => {
      const term = search.toLowerCase();

      const matchesSearch =
        item.businessName.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.planName.toLowerCase().includes(term);

      return matchesSearch &&
        (status === "ALL" || item.status === status);
    });
  }, [subscriptions, search, status]);

  const active = subscriptions.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const pastDue = subscriptions.filter(
    (item) => item.status === "PAST_DUE"
  ).length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-sm text-gray-400 mt-2">
            Monitor subscription activity across all BizTru businesses.
          </p>
        </div>

        <GlassButton variant="secondary" onClick={load}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </GlassButton>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Subscriptions", subscriptions.length],
          ["Active", active],
          ["Past Due", pastDue],
        ].map(([label, value]) => (
          <GlassCard key={String(label)} className="p-5">
            <CreditCard size={20} className="text-teal-400" />
            <h3 className="text-3xl font-bold mt-4">{value}</h3>
            <p className="text-xs text-gray-400 mt-2">{label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap gap-3 justify-between">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business or plan..."
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm"
          >
            <option value="ALL">All statuses</option>
            {[
              "PENDING",
              "TRIALING",
              "ACTIVE",
              "PAST_DUE",
              "SUSPENDED",
              "CANCELLED",
              "EXPIRED",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[850px] text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-white/10">
              <tr>
                <th className="py-4">Business</th>
                <th>Plan</th>
                <th>Version</th>
                <th>Price</th>
                <th>Status</th>
                <th>Renewal</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <LoaderCircle className="animate-spin mx-auto text-teal-400" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-5">
                      <div className="flex gap-3 items-center">
                        <GlassIcon size="sm">
                          <Building2 size={17} />
                        </GlassIcon>
                        <div>
                          <p className="font-medium">{item.businessName}</p>
                          <p className="text-xs text-gray-500">{item.businessId}</p>
                        </div>
                      </div>
                    </td>

                    <td>{item.planName}</td>
                    <td>v{item.planVersion}</td>

                    <td>
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: item.currency,
                      }).format(Number(item.priceMinor) / 100)}
                    </td>

                    <td>
                      <span className="text-xs rounded-full bg-white/5 px-3 py-2">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item.currentPeriodEnd
                        ? new Date(item.currentPeriodEnd).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          navigate(`/platform/billing/subscriptions/${item.id}`)
                        }
                        className="p-2 hover:bg-white/10 rounded-lg"
                      >
                        <Eye size={17} />
                      </button>
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
