
import { useCallback, useEffect, useState } from "react";

import {
  Layers3,
  CreditCard,
  ShieldCheck,
  Receipt,
  RefreshCw,
  Activity,
  Building2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api"; 
import { platformSubscriptionApi } from "../../../Biztru/services/platform/billing/platform-subscription.api";
import { usePlatformSession } from "../../../Biztru/services/PlatformSession/PlatformSessionContext";

interface BillingOverviewData {
  plans: number;
  publishedPlans: number;
  subscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  monthlyRecurringRevenueMinor: string;
  currency: string;
}

export default function BillingOverviewPage() {
  const [data, setData] = useState<BillingOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { session, isAuthenticated} = usePlatformSession();
  const load = useCallback(async () => {
    try {
      if (!isAuthenticated || !session.accessToken) {
        setError("Platform authentication required.");
        return;
        }
      setLoading(true);
      setError("");

      const [plans, metrics] = await Promise.all([
        billingPlanApi.list(session.accessToken),
        platformSubscriptionApi.getMetrics(session.accessToken),
      ]);

      setData({
        plans: plans.length,
        publishedPlans: plans.filter(
          (plan) => plan.status === "PUBLISHED"
        ).length,
        subscriptions: metrics.totalSubscriptions,
        activeSubscriptions: metrics.activeSubscriptions,
        trialingSubscriptions: metrics.trialingSubscriptions,
        pastDueSubscriptions: metrics.pastDueSubscriptions,
        monthlyRecurringRevenueMinor:
          metrics.monthlyRecurringRevenueMinor,
        currency: metrics.currency,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load billing overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revenue = data
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: data.currency,
      }).format(Number(data.monthlyRecurringRevenueMinor) / 100)
    : "—";

  const metrics = [
    {
      label: "Total Plans",
      value: data?.plans ?? "—",
      description: "Registered subscription products",
      icon: Layers3,
    },
    {
      label: "Published Plans",
      value: data?.publishedPlans ?? "—",
      description: "Available in business catalogues",
      icon: ShieldCheck,
    },
    {
      label: "Subscriptions",
      value: data?.subscriptions ?? "—",
      description: "All tenant subscriptions",
      icon: CreditCard,
    },
    {
      label: "Active Subscriptions",
      value: data?.activeSubscriptions ?? "—",
      description: "Currently active subscriptions",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-400">
            Platform Command Center / Billing
          </p>
          <h1 className="text-3xl font-bold mt-2">
            Billing Overview
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Monitor subscription products, tenant billing and commercial performance.
          </p>
        </div>

        <GlassButton variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </GlassButton>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 text-red-400 p-4 text-sm">
          <AlertCircle size={17} className="inline mr-2" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <GlassCard key={metric.label} className="p-5">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">
                {metric.label}
              </span>
              <GlassIcon size="sm">
                <metric.icon size={19} />
              </GlassIcon>
            </div>

            <h3 className="text-3xl font-bold mt-5">
              {loading ? "—" : metric.value}
            </h3>

            <p className="text-xs text-gray-500 mt-2">
              {metric.description}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-teal-400" size={22} />
            <h2 className="font-semibold text-lg">
              Monthly Recurring Revenue
            </h2>
          </div>

          <h3 className="text-4xl font-bold mt-6">
            {loading ? "—" : revenue}
          </h3>

          <p className="text-xs text-gray-400 mt-2">
            Calculated from eligible active recurring subscriptions.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold text-lg">
            Subscription Health
          </h2>

          <div className="space-y-5 mt-6">
            {[
              ["Active", data?.activeSubscriptions ?? 0],
              ["Trialing", data?.trialingSubscriptions ?? 0],
              ["Past Due", data?.pastDueSubscriptions ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-gray-400">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{
                      width: `${data?.subscriptions
                        ? Math.min(100, Number(value) / data.subscriptions * 100)
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Plan Management",
            description: "Configure and publish subscription plans.",
            icon: Layers3,
            href: "/platform/billing/plans",
          },
          {
            title: "Subscriptions",
            description: "Inspect tenant subscriptions.",
            icon: CreditCard,
            href: "/platform/billing/subscriptions",
          },
          {
            title: "Entitlements",
            description: "Review effective business permissions.",
            icon: ShieldCheck,
            href: "/platform/billing/entitlements",
          },
          {
            title: "Event History",
            description: "Inspect billing events and processing.",
            icon: Receipt,
            href: "/platform/billing/events",
          },
        ].map((item) => (
          <GlassCard key={item.title} className="p-5">
            <item.icon className="text-teal-400" size={22} />
            <h3 className="font-semibold mt-4">{item.title}</h3>
            <p className="text-xs text-gray-400 mt-2">
              {item.description}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <h2 className="font-semibold text-lg">
          Billing Architecture
        </h2>

        <div className="grid gap-3 mt-5 sm:grid-cols-4">
          {[
            ["01", "Plan Catalogue", "Commercial definitions"],
            ["02", "Subscriptions", "Tenant agreements"],
            ["03", "Entitlements", "Access and quotas"],
            ["04", "Financial Records", "Invoices and payments"],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-xl bg-white/5 p-4">
              <span className="text-xs text-teal-400">STEP {number}</span>
              <h3 className="font-semibold mt-2">{title}</h3>
              <p className="text-xs text-gray-400 mt-2">{description}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
