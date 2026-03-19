// app/onboard/inventory/page.tsx
"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";

export default function InventoryStep() {
  const handleNext = () =>{
    hydrateSetupStore()
    location.href = "/onboarding-assets"; // next step
  }
  const steps = useBusinessStatusStore( s=> s.steps)

  return (
    <div className="space-y-6 p-6 m-auto">
      <SetupProgressTracker />
      <InventoryPage context="admin" mode="OPENING" />
      <StepFooter 
        onNext={handleNext}
        disabled={!steps.inventory} 
      />
    </div>
  );
}