// app/onboard/opening-cash/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useSetUpStatus";
import { SetupProgressTracker  } from "@/components/business-onboarding/SetupProgressTracker";
import CashflowTable from "@/components/capital/capitalPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";

export default function OpeningCashPage() {
  const router = useRouter();
  const { data, refetch } = useOnboardingStatus();

  const handleNext = () => router.push("/onboarding-inventory");

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <CashflowTable
        mode="OPENING"
        onCompleted={async () => await refetch()}
      />
      <StepFooter
        onNext={handleNext}
        disabled={!data?.steps.openingCash}
      />
    </div>
  );
}