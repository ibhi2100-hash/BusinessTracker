"use client";

import LiabilitiesPage from "@/components/liabilities/liabilitiesPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { useBusinessStatusStore } from "@/src/store/useBusinessStatusStore";
import { useRouter } from "next/navigation";


export default function OnboardingLiabilities() {
  const router = useRouter()
  
  const handleNext = () => {
    
    router.replace("/onboarding-opening-cash")
  };
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