"use client"
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCards } from "@/components/pricing/PricingCard";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";

import { useInitializeSubscription } from "@/hooks/subscriptionHooks/useInitializehydrateSubscription";
import { useSubscription } from "@/hooks/subscriptionHooks/useSubscription";

export default function PricingPage() {

  // ✅ hooks must be called here
  useInitializeSubscription();
  useSubscription();

  return (
    <div className="flex flex-col items-center w-full">

      <PricingHero />

      <PricingCards />

      <FeatureComparison />

      <PricingFAQ />

      <PricingCTA />

    </div>
  );
}