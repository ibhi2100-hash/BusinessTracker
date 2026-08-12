// components/RebuildControlPanel.tsx
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { GlassButton } from "@/components/ui/GlassButton";
import { RotateCcw } from "lucide-react";
import type { RebuildProgressStatus } from "./RebuildProgress";

interface RebuildControlPanelProps {
  status: RebuildProgressStatus;
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
}

export function RebuildControlPanel({
  status,
  isRunning,
  onStart,
  onReset,
}: RebuildControlPanelProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
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

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <GlassButton
          variant="primary"
          disabled={isRunning}
          onClick={onStart}
          icon={<RotateCcw size={17} />}
        >
          {isRunning ? "Rebuilding..." : "Reset + Rebuild"}
        </GlassButton>

        <GlassButton
          variant="tertiary"
          disabled={isRunning}
          onClick={onReset}
        >
          Clear UI State
        </GlassButton>
      </div>
    </GlassCard>
  );
}