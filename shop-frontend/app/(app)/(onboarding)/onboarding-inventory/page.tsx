// app/onboard/inventory/page.tsx
"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { toast } from "sonner";


export default function InventoryStep() {

  return (
    <div className="space-y-6 p-6 m-auto">
      <SetupProgressTracker />
      <InventoryPage context="admin" mode="OPENING" />
      <StepFooter 
        onNext={() => toast.success("product clickedNext")}
        disabled={false} 
      />
    </div>
  );
}