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
    <div>
        <SetupProgressTracker />
        <InventoryPage context="admin" mode="OPENING" />
        <StepFooter onNext={handleNext} disabled={false} />
      
    </div>
  
  );
}