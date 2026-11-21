
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CreditCard,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  XCircle,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { useBusinessBilling } from "../../../Biztru/hooks/useBusinessBilling";

import { businessBillingApi } from "../../../services/business/billing/business-billing.api";

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BusinessSubscriptionPage() {
  const navigate = useNavigate();

  const {
    subscription,
    plans,
    refresh,
    isOffline,
  } = useBusinessBilling();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const plan = plans.find(
    (item) => item.id === subscription?.planId
  );

  const cancel = async () => {
    if (!subscription || isOffline) return;

    const confirmed = window.confirm(
      "Cancel this subscription at the end of the current billing period?"
    );

    if (!confirmed) return;

    try {
      setProcessing(true);
      setError("");

      await businessBillingApi.cancelSubscription(
        subscription.id,
        true
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel subscription"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!subscription) {
    return (
      <GlassCard className="p-10 text-center">
        <CreditCard className="mx-auto text-gray-500" size={32} />
        <h2 className="font-semibold mt-4">
          No active subscription
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Choose a subscription plan to access additional BizTru capabilities.
        </p>

        <GlassButton
          className="mt-5"
          onClick={() => navigate("/business/billing/plans")}
        >
          Browse Plans
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      <div>
        <h1 className="text-3xl font-bold">My Subscription</h1>
        <p className="text-sm text-gray-400 mt-2">
          View and manage your business subscription.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <GlassCard className="p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500">
              Current Subscription
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {subscription.planName}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {subscription.status}
            </p>
          </div>

          <GlassIcon size="lg">
            <ShieldCheck size={25} />
          </GlassIcon>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Billing Interval</p>
            <p className="font-semibold mt-2">
              {subscription.billingCycle}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Plan Version</p>
            <p className="font-semibold mt-2">
              v{subscription.planVersion}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Started</p>
            <p className="font-semibold mt-2">
              {formatDate(subscription.startedAt)}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Next Renewal</p>
            <p className="font-semibold mt-2">
              {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
        </div>
      </GlassCard>

      {subscription.trialEndsAt && (
        <GlassCard className="p-5">
          <div className="flex gap-3 items-center">
            <Clock className="text-teal-400" size={22} />
            <div>
              <h3 className="font-semibold">Trial Information</h3>
              <p className="text-sm text-gray-400 mt-1">
                Trial ends {formatDate(subscription.trialEndsAt)}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {subscription.cancelAtPeriodEnd && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-400">
          Your subscription is scheduled to end at the end of its current period.
        </div>
      )}

      <GlassCard className="p-6">
        <h2 className="font-semibold text-lg">Subscription Actions</h2>

        <div className="flex flex-wrap gap-3 mt-5">
          <GlassButton
            onClick={() => navigate("/business/billing/plans")}
          >
            <ArrowUpRight size={16} className="mr-2" />
            {plan ? "Change Plan" : "View Plans"}
          </GlassButton>

          <GlassButton
            variant="secondary"
            onClick={refresh}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </GlassButton>

          {subscription.status === "ACTIVE" &&
            !subscription.cancelAtPeriodEnd && (
              <GlassButton
                variant="danger"
                disabled={processing || isOffline}
                onClick={cancel}
              >
                <XCircle size={16} className="mr-2" />
                Cancel Subscription
              </GlassButton>
            )}
        </div>

        {isOffline && (
          <p className="text-xs text-amber-400 mt-4">
            Subscription changes require an online connection.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
