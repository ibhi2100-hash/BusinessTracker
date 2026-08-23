"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

interface Props {
  percentage?: number;
}

export function SetupProgressTracker({ percentage = 100 }: Props) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const isComplete = clamped === 100;

  return (
    <GlassCard
      variant="elevated"
      className="relative overflow-hidden border-white/10 p-4 sm:p-5"
    >
      {/* Reflection */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_42%)]" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Business Setup</p>
            <p className="mt-0.5 text-xs text-white/40">
              {isComplete ? "Ready to activate" : "Almost ready"}
            </p>
          </div>

          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-2xl border border-white/10 bg-white/[0.05]
              sm:h-12 sm:w-12
            "
          >
            <span className="text-sm font-semibold text-white">
              {clamped}%
            </span>
          </div>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06] sm:h-3">
          <div
            style={{ width: `${clamped}%` }}
            className={cn(
              "relative h-full rounded-full bg-white transition-all duration-700",
              isComplete && "shadow-[0_0_20px_rgba(255,255,255,0.55)]"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.75),transparent)] opacity-50" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}