"use client";

import { ArrowRight } from "lucide-react";

import { GlassButton } from "@/components/ui/GlassButton";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

interface StepFooterProps {
  onNext?: () => void;
  disabled?: boolean;
  isLastStep?: boolean;
  loading?: boolean;
}

export function StepFooter({
  onNext,
  disabled,
  isLastStep,
  loading,
}: StepFooterProps) {
  if (isLastStep) {
    return <ActivateBusinessButton />;
  }

  return (
    <div className="mt-6 flex justify-end">
      <GlassButton
        onClick={onNext}
        disabled={disabled || loading}
        icon={!loading ? <ArrowRight size={18} /> : undefined}
      >
        {loading ? "Saving..." : "Next"}
      </GlassButton>
    </div>
  );
}