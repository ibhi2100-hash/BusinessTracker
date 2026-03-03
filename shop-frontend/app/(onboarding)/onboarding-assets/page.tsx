"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import AddAssetPage from "@/components/assets/assetsPage";


export default function AssetsPage() {
  const handleNext = () => location.href = "/onboarding-assets"; // next step

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <AddAssetPage  mode="OPENING"/>
      <StepFooter onNext={handleNext} />
    </div>
  );
}
