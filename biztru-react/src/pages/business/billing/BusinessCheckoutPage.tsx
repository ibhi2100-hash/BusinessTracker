
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  LoaderCircle,
  AlertCircle,
  WifiOff,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { useBusinessBilling } from "../../../Biztru/hooks/useBusinessBilling";
import { businessBillingApi } from "../../../services/business/billing/business-billing.api";

import type { PublicBillingPlan } from "../../../types/billing/business-billing.types";

function formatPrice(plan: PublicBillingPlan) {
  const amount = Number(plan.priceMinor) / 100;

  return amount === 0
    ? "Free"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: plan.currency,
      }).format(amount);
}

export default function BusinessCheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const { plans, isOffline, refresh } = useBusinessBilling();

  const [plan, setPlan] = useState<PublicBillingPlan | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlan(plans.find((item) => item.id === planId) ?? null);
  }, [plans, planId]);

  const submit = async () => {
    if (!plan || !accepted || isOffline) return;

    try {
      setProcessing(true);
      setError("");

      const result = await businessBillingApi.subscribe(plan.id);

      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }

      await refresh();

      navigate("/business/billing/subscription");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to initiate subscription"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!plan) {
    return (
      <GlassCard className="p-8">
        <AlertCircle className="text-amber-400" size={28} />
        <h2 className="font-semibold mt-3">Plan unavailable</h2>
        <p className="text-sm text-gray-400 mt-2">
          This plan may have been retired or removed from the catalogue.
        </p>
        <GlassButton className="mt-5" onClick={() => navigate("/business/billing/plans")}>
          Browse Plans
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <button
        onClick={() => navigate("/business/billing/plans")}
        className="flex items-center gap-2 text-sm text-gray-400"
      >
        <ArrowLeft size={16} />
        Back to pricing
      </button>

      <div>
        <h1 className="text-3xl font-bold">Review Subscription</h1>
        <p className="text-sm text-gray-400 mt-2">
          Review your selected package before proceeding.
        </p>
      </div>

      {isOffline && (
        <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-400 flex gap-3">
          <WifiOff size={18} />
          You must reconnect to confirm a subscription.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <GlassCard className="p-6 space-y-5">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">
              Selected subscription
            </p>
            <h2 className="text-2xl font-bold mt-2">{plan.name}</h2>
            <p className="text-sm text-gray-400 mt-2">
              {plan.description}
            </p>
          </div>

          <GlassIcon size="lg">
            <ShieldCheck size={24} />
          </GlassIcon>
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="flex justify-between">
            <span className="text-gray-400">Subscription</span>
            <span className="font-semibold">{plan.name}</span>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-gray-400">Billing interval</span>
            <span>{plan.billingCycle}</span>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-gray-400">Trial period</span>
            <span>{plan.trialDays} days</span>
          </div>

          <div className="flex justify-between mt-6 border-t border-white/10 pt-5">
            <span className="font-semibold">Total subscription price</span>
            <span className="text-2xl font-bold text-teal-400">
              {formatPrice(plan)}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-5">
        <div className="flex gap-3 items-center">
          <CreditCard className="text-teal-400" size={22} />
          <h2 className="font-semibold">Subscription Agreement</h2>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed">
          By continuing, your business agrees to subscribe under the
          displayed price, billing interval, and applicable terms.
          The backend will verify the current published plan version
          before accepting this request.
        </p>

        <label className="flex gap-3 items-start text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-teal-500"
          />
          <span>
            I have reviewed and accept the subscription terms and pricing.
          </span>
        </label>
      </GlassCard>

      <GlassButton
        className="w-full"
        disabled={!accepted || processing || isOffline}
        onClick={submit}
      >
        {processing ? (
          <LoaderCircle className="animate-spin mr-2" size={17} />
        ) : (
          <CheckCircle2 className="mr-2" size={17} />
        )}
        Confirm Subscription
      </GlassButton>
    </div>
  );
}
