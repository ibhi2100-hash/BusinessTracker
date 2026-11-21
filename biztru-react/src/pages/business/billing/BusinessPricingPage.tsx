
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Check,
  Users,
  Building2,
  Package,
  WifiOff,
  RefreshCw,
  ArrowRight,
  Crown,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { useBusinessBilling } from "../../../Biztru/hooks/useBusinessBilling";

import type {
  PublicBillingPlan,
} from "../../../types/billing/business-billing.types";

function formatPrice(plan: PublicBillingPlan) {
  const amount = Number(plan.priceMinor) / 100;

  if (amount === 0) return "Free";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function PlanLimit({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={18} className="text-teal-400" />
      <span>
        {value == null ? "Unlimited" : value.toLocaleString()} {label}
      </span>
    </div>
  );
}

export default function BusinessPricingPage() {
  const navigate = useNavigate();

  const {
    plans,
    subscription,
    loading,
    isOffline,
    refresh,
  } = useBusinessBilling();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlanId = subscription?.planId;

  const handleSubscribe = (plan: PublicBillingPlan) => {
    if (isOffline) return;

    setSelectedPlan(plan.id);

    navigate(
      `/business/billing/checkout/${plan.id}`
    );
  };

  return (
    <div className="space-y-8 pb-10">

      <div>
        <div className="text-sm text-gray-400">
          Business Administration / Billing
        </div>

        <h1 className="text-3xl font-bold mt-3">
          Plans & Pricing
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Choose the subscription that fits your business.
        </p>
      </div>

      {isOffline && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <WifiOff className="text-amber-400" size={20} />
            <div>
              <p className="text-sm font-medium">Offline catalogue</p>
              <p className="text-xs text-gray-400">
                Displaying previously loaded plans. New subscriptions require a connection.
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            className="text-sm text-amber-400 flex items-center gap-2"
          >
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      {subscription && (
        <GlassCard className="p-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-teal-400">
                <Crown size={18} />
                <span className="text-xs uppercase tracking-wider">
                  Your Current Plan
                </span>
              </div>

              <h2 className="text-2xl font-bold mt-3">
                {subscription.planName}
              </h2>

              <p className="text-sm text-gray-400 mt-2">
                Subscription status: {subscription.status}
              </p>
            </div>

            <GlassButton
              variant="secondary"
              onClick={() => navigate("/business/billing/subscription")}
            >
              Manage Subscription
            </GlassButton>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;

          const enabledFeatures = Object.entries(plan.features)
            .filter(([, enabled]) => enabled);

          return (
            <GlassCard
              key={plan.id}
              variant={plan.isFeatured ? "accent" : "default"}
              className="p-6 flex flex-col"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className="text-sm text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                {plan.isFeatured && (
                  <GlassIcon size="md" variant="primary">
                    <Crown size={20} />
                  </GlassIcon>
                )}
              </div>

              <div className="mt-7">
                <span className="text-4xl font-bold">
                  {formatPrice(plan)}
                </span>

                {Number(plan.priceMinor) > 0 && (
                  <span className="text-gray-400 text-sm ml-2">
                    / {plan.billingCycle.toLowerCase()}
                  </span>
                )}
              </div>

              <div className="space-y-4 mt-8">
                <PlanLimit
                  icon={Users}
                  label="Staff"
                  value={plan.limits.maxStaff}
                />

                <PlanLimit
                  icon={Building2}
                  label="Branches"
                  value={plan.limits.maxBranches}
                />

                <PlanLimit
                  icon={Package}
                  label="Products"
                  value={plan.limits.maxProducts}
                />

                {enabledFeatures.map(([feature]) => (
                  <div key={feature} className="flex gap-3 text-sm">
                    <Check size={18} className="text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                {isCurrent ? (
                  <GlassButton
                    variant="secondary"
                    className="w-full"
                    disabled
                  >
                    Current Plan
                  </GlassButton>
                ) : (
                  <GlassButton
                    className="w-full"
                    disabled={isOffline || loading || selectedPlan === plan.id}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {selectedPlan === plan.id
                      ? "Opening..."
                      : Number(plan.priceMinor) === 0
                        ? "Choose Free Plan"
                        : "Choose Plan"}
                    <ArrowRight size={16} className="ml-2" />
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {!loading && plans.length === 0 && (
        <GlassCard className="p-12 text-center">
          <WifiOff className="mx-auto text-gray-500" size={32} />
          <h3 className="font-semibold mt-4">
            No pricing plans available
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Published plans will appear here when available.
          </p>
        </GlassCard>
      )}

    </div>
  );
}
