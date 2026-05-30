"use client";

import { Button } from "@/components/ui/button";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

interface StepFooterProps {
  onNext?: () => void;
  disabled?: boolean;
  isLastStep?: boolean;
}

export const StepFooter = ({ onNext, disabled, isLastStep }: StepFooterProps) => {
  if (isLastStep) {
    return (
      <div className="px-2">
        <ActivateBusinessButton />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Button
        onClick={onNext}
        disabled={disabled}
        fullWidth
        className="h-12 rounded-2xl bg-white text-black font-medium shadow-lg active:scale-[0.98]"
      >
        Continue
      </Button>
    </div>
  );
};