// app/onboard/page.tsx
"use client";

import { SetupProgressTracker} from "@/components/business-onboarding/SetupProgressTracker";
import { SetupChecklist } from "@/components/business-onboarding/SetupChecklist";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";
import { useBusinessStore } from "@/src/store/businessStore";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";





const OnboardingPage = ()=> {
  const PlansData = useSubscriptionStore((s)=> s.subscription);
  const businessFromStore = useBusinessStore((state) => state.business);

  return (
    <div className="space-y-6 p-6">
      <SetupProgressTracker />
      <SetupChecklist />
      <ActivateBusinessButton />
    </div>
  )
}

export default OnboardingPage;