"use client";

import LiabilitiesPage from "@/components/liabilities/liabilitiesPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";

export default function OnboardingLiabilities() {
  hydrateSetupStore()
  const handleNext = () => {
    hydrateSetupStore();
    location.href = "/onboarding-opening-cash"};
  const steps = useBusinessStatusStore(s => s.steps)

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <LiabilitiesPage
        mode="OPENING"
        onComplete={() => console.log("Liability step completed")}
      />
      <StepFooter
        onNext={handleNext}
        disabled={!steps.liabilities} 
      />
    </div>
  );
}