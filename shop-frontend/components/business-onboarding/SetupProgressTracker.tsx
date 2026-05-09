// components/business-onboarding/SetupProgressTracker.tsx
"use client";

import clsx from "clsx";

export const SetupProgressTracker = () => {
  const percentage = 100;
  const isComplete = percentage === 100;

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-white/10
        bg-white/[0.08]
        p-5
        backdrop-blur-2xl
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
      "
    >

      {/* GLASS REFLECTION */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_40%)]
        "
      />

      {/* CONTENT */}
      <div className="relative z-10">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-white">
              Business Setup
            </p>

            <p className="mt-1 text-xs text-white/40">
              Almost ready
            </p>
          </div>

          {/* PERCENT */}
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/[0.05]
              backdrop-blur-xl
            "
          >
            <span className="text-sm font-semibold text-white">
              {percentage}%
            </span>
          </div>
        </div>

        {/* TRACK */}
        <div
          className="
            h-3
            overflow-hidden
            rounded-full
            bg-white/[0.05]
          "
        >
          <div
            style={{ width: `${percentage}%` }}
            className={clsx(
              `
              relative
              h-full
              rounded-full
              bg-white
              transition-all
              duration-700
              `,
              isComplete &&
                "shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            )}
          >

            {/* LIQUID SHINE */}
            <div
              className="
                absolute
                inset-0
                bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.8),transparent)]
                opacity-60
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
};