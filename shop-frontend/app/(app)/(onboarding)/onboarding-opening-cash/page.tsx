// app/onboard/opening-cash/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SetupProgressTracker  } from "@/components/business-onboarding/SetupProgressTracker";
import CashflowTable from "@/components/capital/capitalPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";


export default function OpeningCashPage() {
  const router = useRouter();
 
  const handleNext = () => {
   
    router.push("/onboard")};
  

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <CashflowTable
        mode="OPENING"
        onCompleted={()=> console.log("Am completed")}
      />
      <StepFooter
        onNext={handleNext}
        disabled={false}
      />
    </div>
  );
}