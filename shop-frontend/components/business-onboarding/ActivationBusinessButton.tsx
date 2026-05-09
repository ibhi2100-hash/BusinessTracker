// components/business-onboarding/ActivationBusinessButton.tsx
"use client";

import { ArrowRight } from "lucide-react";

export const ActivateBusinessButton = () => {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[34px]
        border
        border-white/10
        bg-white/[0.07]
        p-5
        backdrop-blur-3xl
        shadow-[0_10px_60px_rgba(0,0,0,0.45)]
      "
    >

      {/* GLASS LIGHT */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_40%)]
        "
      />

      <div className="relative z-10 space-y-5">

        <div>
          <h2 className="text-lg font-semibold text-white">
            Activate Workspace
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-white/40">
            Your business will become fully operational
            after activation.
          </p>
        </div>

        {/* BUTTON */}
        <button
          className="
            relative
            flex
            h-14
            w-full
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-2xl
            bg-white
            font-medium
            text-black
            transition-all
            duration-200
            active:scale-[0.985]
          "
        >

          {/* BUTTON SHINE */}
          <div
            className="
              absolute
              inset-0
              bg-[linear-gradient(120deg,rgba(255,255,255,0.9),transparent_45%)]
            "
          />

          <span className="relative z-10">
            Start Business
          </span>

          <ArrowRight
            size={18}
            className="relative z-10"
          />
        </button>
      </div>
    </div>
  );
};