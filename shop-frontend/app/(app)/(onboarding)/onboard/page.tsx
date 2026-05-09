// app/onboard/page.tsx
"use client";

import { SetupChecklist } from "@/components/business-onboarding/SetupChecklist";
import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* AMBIENT LIGHTING */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* TOP LIGHT */}
        <div
          className="
            absolute
            top-[-180px]
            left-[-120px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        {/* BLUE GLOW */}
        <div
          className="
            absolute
            bottom-[-200px]
            right-[-120px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-500/20
            blur-3xl
          "
        />

        {/* CENTER LIGHT */}
        <div
          className="
            absolute
            left-1/2
            top-[15%]
            h-[260px]
            w-[260px]
            -translate-x-1/2
            rounded-full
            bg-white/5
            blur-3xl
          "
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between py-8">

        {/* TOP SECTION */}
        <div className="space-y-8">

          <SetupProgressTracker />

          {/* HERO */}
          <div className="space-y-5 px-1">

            {/* STATUS PILL */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/[0.06]
                px-3
                py-1.5
                backdrop-blur-xl
                shadow-[0_4px_24px_rgba(255,255,255,0.06)]
              "
            >
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

              <span className="text-sm text-white/70">
                Workspace setup
              </span>
            </div>

            {/* TITLE */}
            <div className="space-y-3">

              <h1
                className="
                  text-[42px]
                  font-semibold
                  leading-[0.95]
                  tracking-[-0.05em]
                  text-white
                "
              >
                Finish setting
                <br />
                up your business
              </h1>

              <p
                className="
                  max-w-[320px]
                  text-[16px]
                  leading-relaxed
                  text-white/45
                "
              >
                Complete the remaining onboarding steps before
                activating your workspace.
              </p>
            </div>
          </div>

          <SetupChecklist />
        </div>

        {/* BOTTOM CTA */}
        <div className="pt-10">
          <ActivateBusinessButton />
        </div>
      </div>
    </div>
  );
}