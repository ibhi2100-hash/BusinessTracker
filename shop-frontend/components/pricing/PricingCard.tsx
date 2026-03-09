"use client";

import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useInitializeSubscription } from "@/hooks/subscriptionHooks/useInitializeSubscription";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PricingCards = () => {
  const plans = useSubscriptionStore((state) => state.subscription);
  const { mutate, isPending } = useInitializeSubscription();

  const handleSubscribe = (planId: string) => {
    mutate(planId);
  };

  if (!plans?.length) {
    return <p className="text-center">Loading plans...</p>;
  }

  return (
    <section className="w-full max-w-6xl px-6 pb-24">
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan: any) => {
          
          const featureList = Object.keys(plan.features || {})
            .filter((key) => plan.features[key])
            .map((key) => key.charAt(0).toUpperCase() + key.slice(1));

          const formattedPrice =
            plan.price === "0" ? "Free" : `₦${Number(plan.price).toLocaleString()}`;

          return (
            <Card
              key={plan.id}
              className={`bg-gradient-to-b from-slate-50 to-white p-8 flex flex-col justify-between ${
                plan.name === "Growth"
                  ? "border-primary shadow-lg scale-[1.03]"
                  : ""
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>

                <p className="text-sm text-muted-foreground mt-1">
                  {plan.name === "Starter"
                    ? "For businesses just starting"
                    : plan.name === "Growth"
                    ? "For growing businesses"
                    : "For large operations"}
                </p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-3xl font-bold">
                    {formattedPrice}
                  </span>

                  {plan.price !== "0" && (
                    <span className="text-sm text-muted-foreground">
                      /{plan.billingCycle}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-2 text-sm">
                  <li>• {plan.maxBranch} branches</li>
                  <li>• {plan.maxStaff} staff</li>
                  <li>• {plan.maxProduct} products</li>

                  {featureList.map((f: string) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>

              <Button
                disabled={isPending}
                onClick={() => handleSubscribe(plan.id)}
                className="mt-8 w-full"
                variant={plan.name === "Growth" ? "primary" : "secondary"}
              >
                {plan.price === "0" ? "Start Free" : "Subscribe"}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
};