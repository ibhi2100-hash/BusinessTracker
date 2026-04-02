// app/onboard/opening-cash/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SetupProgressTracker  } from "@/components/business-onboarding/SetupProgressTracker";
import CashflowTable from "@/components/capital/capitalPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { hydrateStores } from "@/offline/hydration/hydrationStore";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";
import { useBusinessSetupStore } from "@/store/useBusinessSetupStore";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";

export default function OpeningCashPage() {
  const router = useRouter();
  hydrateSetupStore()

  const handleNext = () => {
    hydrateSetupStore()
    router.push("/onboard")};
  const steps = useBusinessStatusStore(s => s.steps)

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <CashflowTable
        mode="OPENING"
        onCompleted={()=> hydrateSetupStore()}
      />
      <StepFooter
        onNext={handleNext}
        disabled={!steps.openingCash}
      />
    </div>
  );
}