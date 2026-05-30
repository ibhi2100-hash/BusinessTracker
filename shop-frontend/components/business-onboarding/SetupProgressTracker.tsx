"use client";

import clsx from "clsx";

export const SetupProgressTracker = () => {
  const percentage = 100;
  const isComplete = percentage === 100;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl shadow-[0_10px_60px_rgba(0,0,0,0.4)]">

      {/* animated sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 animate-pulse" />

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-4">

          <div>
            <p className="text-sm font-medium text-white">Business Setup</p>
            <p className="text-xs text-white/40 mt-1">Preparing your workspace</p>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="h-3 rounded-full bg-white/5 overflow-hidden">

          <div
            style={{ width: `${percentage}%` }}
            className={clsx(
              "h-full rounded-full bg-gradient-to-r from-white to-white/80 transition-all duration-700 relative",
              isComplete && "shadow-[0_0_25px_rgba(255,255,255,0.6)]"
            )}
          >
            {/* liquid highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-40 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
};