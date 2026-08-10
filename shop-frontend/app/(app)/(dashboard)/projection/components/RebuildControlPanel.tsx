import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { RotateCcw } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";

export function RebuildControlPanel(){
    return <GlassCard variant="elevated">

  <div className="flex items-center justify-between mb-5">

    <div>
      <h2 className="text-lg font-semibold text-white">
        Rebuild Control
      </h2>

      <p className="text-sm text-gray-400 mt-1">
        Reset read models and reconstruct them from event history.
      </p>
    </div>

    <GlassIcon variant="danger">
      <RotateCcw size={20} />
    </GlassIcon>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* scope */}

    {/* cutoff */}

    {/* action */}

  </div>

  <GlassButton
  variant="primary"
  icon={<RotateCcw size={18} />}
  disabled={isRunning}
  onClick={startRebuild}
  className="h-full w-full"
>
  {isRunning
    ? "Rebuilding..."
    : "Reset + Rebuild"}
</GlassButton>

</GlassCard>
}