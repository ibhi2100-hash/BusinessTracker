
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { platformSubscriptionApi } from "../../../Biztru/services/platform/billing/platform-subscription.api"; 

import type { PlatformSubscription } from "../../../types/billing/platform-billing.types";

export default function BillingSubscriptionDetailsPage() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] =
    useState<PlatformSubscription | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subscriptionId) return;

    let mounted = true;

    platformSubscriptionApi.get(subscriptionId)
      .then((result) => {
        if (mounted) setSubscription(result);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load subscription");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [subscriptionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="animate-spin text-teal-400" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <GlassCard className="p-8">
        <AlertCircle className="text-red-400" />
        <p className="mt-3">{error || "Subscription not found"}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <button
        onClick={() => navigate("/platform/billing/subscriptions")}
        className="flex items-center gap-2 text-sm text-gray-400"
      >
        <ArrowLeft size={16} /> Back to subscriptions
      </button>

      <div>
        <h1 className="text-3xl font-bold">Subscription Details</h1>
        <p className="text-sm text-gray-400 mt-2">{subscription.id}</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex gap-3 items-center">
          <Building2 className="text-teal-400" size={24} />
          <div>
            <h2 className="font-semibold text-xl">
              {subscription.businessName}
            </h2>
            <p className="text-xs text-gray-400">
              Business ID: {subscription.businessId}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-7">
          {[
            ["Plan", subscription.planName],
            ["Plan Version", `v${subscription.planVersion}`],
            ["Status", subscription.status],
            ["Billing Cycle", subscription.billingCycle],
            ["Price", new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: subscription.currency,
            }).format(Number(subscription.priceMinor) / 100)],
            ["Started", subscription.startedAt
              ? new Date(subscription.startedAt).toLocaleString()
              : "—"],
            ["Renewal", subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toLocaleString()
              : "—"],
            ["Cancel at Period End", subscription.cancelAtPeriodEnd ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/5 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-medium mt-2">{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-teal-400" size={22} />
          <div>
            <h3 className="font-semibold">Subscription Governance</h3>
            <p className="text-sm text-gray-400 mt-2">
              Subscription changes must be processed through audited backend commands.
              The founder must not directly modify payment confirmation or subscription
              history records.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
