// app/onboard/inventory/page.tsx
"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";

export default function InventoryStep() {
  const handleNext = () => location.href = "/onboarding-assets"; // next step

  return (
    <div className="space-y-6 p-6 m-auto">
      <SetupProgressTracker />
      <InventoryPage context="admin" mode="OPENING" />
      <StepFooter onNext={handleNext} />
    </div>
  );
}