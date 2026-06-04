"use client";

import {
  Building2,
  Users,
  Package,
  Check,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";

import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";
import { eventService } from "@/src/services/eventService";

export function PricingCards() {
  const plans = useSubscriptionStore(
    (s) => s.subscription
  );

  const handleSubscribe = async (
    planId: string
  ) => {
    await eventService.create({
      aggregateType: "SUBSCRIBE",
      aggregateId: planId,
      type: "SUBSCRIBE",
      mode: "LIVE",
      payload: { planId },
    });
  };

  if (!plans?.length) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard
            key={i}
            className="h-96 animate-pulse"
          >
            <div />
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div
      className="
      grid
      gap-6
      md:grid-cols-3
      "
    >
      {plans.map((plan: any) => {
        const features = Object.keys(
          plan.features || {}
        ).filter(
          (key) => plan.features[key]
        );

        return (
          <GlassCard
            key={plan.id}
            variant={
              plan.name === "Growth"
                ? "accent"
                : "default"
            }
            className="
              p-6
              flex
              flex-col
            "
          >
            <div>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {plan.name}
                  </h3>

                  <p className="text-gray-400 text-sm">
                    {plan.description}
                  </p>
                </div>

                <GlassIcon>
                  <Building2 size={22} />
                </GlassIcon>
              </div>

              <div className="mt-6">
                <span
                  className="
                  text-5xl
                  font-bold
                  "
                >
                  {plan.price === "0"
                    ? "Free"
                    : `₦${Number(
                        plan.price
                      ).toLocaleString()}`}
                </span>

                {plan.price !== "0" && (
                  <span className="text-gray-400 ml-2">
                    /{plan.billingCycle}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <Users size={18} />
                  <span>
                    {plan.maxStaff} Staff
                  </span>
                </div>

                <div className="flex gap-3">
                  <Building2 size={18} />
                  <span>
                    {plan.maxBranch} Branches
                  </span>
                </div>

                <div className="flex gap-3">
                  <Package size={18} />
                  <span>
                    {plan.maxProduct} Products
                  </span>
                </div>

                {features.map(
                  (feature: string) => (
                    <div
                      key={feature}
                      className="flex gap-3"
                    >
                      <Check
                        size={18}
                        className="text-emerald-400"
                      />

                      <span>
                        {feature}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <GlassButton
              className="mt-8 w-full"
              onClick={() =>
                handleSubscribe(plan.id)
              }
            >
              {plan.price === "0"
                ? "Start Free"
                : "Subscribe"}
            </GlassButton>
          </GlassCard>
        );
      })}
    </div>
  );
}