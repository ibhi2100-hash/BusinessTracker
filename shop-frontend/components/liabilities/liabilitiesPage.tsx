"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { CreateLiabilityForm } from "@/components/liabilities/createLiabilityForm";
import { LiabilityList } from "@/components/liabilities/liabilityList";

interface Props {
  mode: "OPENING" | "LIVE";
  onComplete?: () => void;
}

const LiabilitiesPage = ({ mode, onComplete }: Props) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Liability form */}
      <CreateLiabilityForm mode={mode} onComplete={onComplete} />
      <LiabilityList />
    </div>
  );
};

export default LiabilitiesPage;