"use client";

import LiabilitiesPage from "@/components/liabilities/liabilitiesPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";

export default function OnboardingLiabilities() {
  const handleNext = () => (location.href = "/onboarding-opening-cash");

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <LiabilitiesPage
        mode="OPENING"
        onComplete={() => console.log("Liability step completed")}
      />
      <StepFooter onNext={handleNext} />
    </div>
  );
}