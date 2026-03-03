// app/onboard/page.tsx
"use client";

import { SetupProgressTracker} from "@/components/business-onboarding/SetupProgressTracker";
import { SetupChecklist } from "@/components/business-onboarding/SetupChecklist";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <SetupChecklist />
      <ActivateBusinessButton />
    </div>
  )
}