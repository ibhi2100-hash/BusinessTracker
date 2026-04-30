"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import AddAssetPage from "@/components/assets/assetsPage";
import { useRouter } from "next/navigation";


export default function AssetsPage() {
  const router = useRouter()
  const handleNext = () => {
    router.replace( "/onboarding-liabilities")// next step
  }
  const steps = {assets: 2000}

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
