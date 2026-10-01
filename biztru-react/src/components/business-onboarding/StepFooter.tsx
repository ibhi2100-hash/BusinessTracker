
import { ArrowRight } from "lucide-react";

import { GlassButton } from "../ui/GlassButton"; 
import { ActivateBusinessButton } from "./ActivationBusinessButton"; 

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