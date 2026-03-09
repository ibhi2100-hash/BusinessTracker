// app/onboard/page.tsx
"use client";

import { SetupProgressTracker} from "@/components/business-onboarding/SetupProgressTracker";
import { SetupChecklist } from "@/components/business-onboarding/SetupChecklist";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";
import { useBusinessStore } from "@/store/businessStore";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";
import { useEffect } from "react";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useSubscription } from "@/hooks/subscriptionHooks/useSubscription";




const OnboardingPage = ()=> {
  
  const PlansData = useSubscriptionStore((s)=> s.subscription);
  const businessFromStore = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const { data, isLoading } = useBusinessStatus();
  // Always call hooks first
    useEffect(() => {
      if (data && !businessFromStore) {
        setBusiness(data);
      }
    }, [data, businessFromStore, setBusiness]);

    
 
 
  return (
    <div className="space-y-6 p-6">
      <SetupProgressTracker />
      <SetupChecklist />
      <ActivateBusinessButton />
    </div>
  )
}

export default OnboardingPage;