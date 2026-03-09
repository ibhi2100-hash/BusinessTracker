"use client";

import { Button } from "@/components/ui/button";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

interface StepFooterProps {
  onNext?: () => void;         // callback for Next button
  disabled?: boolean;           // disable Next button
  isLastStep?: boolean;         // show Activate button instead
}

export const StepFooter = ({ onNext,  disabled , isLastStep }: StepFooterProps) => {
  if (isLastStep) {
    // Show Activate button on final step
    return <ActivateBusinessButton />;
  }

  // Default: show Next button
  return (
    <div className="mt-4 p-6 flex justify-end">
      <Button onClick={onNext} disabled={disabled} className="w-32">
        Next
      </Button>
    </div>
  );
};