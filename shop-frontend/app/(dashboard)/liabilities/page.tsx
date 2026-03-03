// app/onboard/liabilities/page.tsx
"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import LiabilitiesPage from "@/components/liabilities/liabilitiesPage";

export default function LiabilitiesStep() {
  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <LiabilitiesPage />
      <StepFooter isLastStep={true} />
    </div>
  );
}