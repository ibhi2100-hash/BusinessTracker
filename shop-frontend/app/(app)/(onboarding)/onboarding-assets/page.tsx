"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import AddAssetPage from "@/components/assets/assetsPage";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";


export default function AssetsPage() {
  const handleNext = () => {
    hydrateSetupStore()
    location.href = "/onboarding-liabilities"; }// next step
  const steps = useBusinessStatusStore(s => s.steps)

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <AddAssetPage  mode="OPENING"/>
      <StepFooter 
        onNext={handleNext} 
        disabled={!steps.assets}
      />
    </div>
  );
}
