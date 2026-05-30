// app/onboard/inventory/page.tsx
"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export default function InventoryStep() {
  const router = useRouter()
  
  const handleNext = () => {
   
    router.replace("/onboarding-opening-cash")};
  return (
    <div className=" bg-gray-50">
      <SetupProgressTracker />

      <div className="space-y-6 p-6">
        <InventoryPage context="admin" mode="OPENING" />
        <StepFooter onNext={handleNext} disabled={false} />
      </div>
    </div>
  );
}