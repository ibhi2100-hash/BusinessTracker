"use client";

import { SetupChecklist } from "@/components/business-onboarding/SetupChecklist";
import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import { ActivateBusinessButton } from "@/components/business-onboarding/ActivationBusinessButton";

export default function OnboardingPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-neutral-950 text-white">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl sm:h-[420px] sm:w-[420px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[320px] w-[320px] rounded-full bg-blue-500/20 blur-3xl sm:h-[420px] sm:w-[420px]" />
        <div className="absolute left-1/2 top-[12%] h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl sm:h-[260px] sm:w-[260px]" />
      </div>

      {/* Content shell */}
      <div
        className="
          relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col
          px-4 pt-6
          pb-[max(1.5rem,env(safe-area-inset-bottom))]
          sm:max-w-xl sm:px-6 sm:pt-10
          lg:max-w-2xl lg:justify-center lg:py-12
        "
      >
        <div className="flex flex-1 flex-col justify-between gap-8 lg:flex-none lg:gap-10">
          {/* Top */}
          <div className="space-y-6 sm:space-y-8">
            <SetupProgressTracker />

            {/* Hero */}
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-sm text-white/70">Workspace setup</span>
              </div>

              <div className="space-y-3">
                <h1
                  className="
                    text-[2rem] font-semibold leading-[1.05] tracking-tight text-white
                    sm:text-[2.5rem]
                    lg:text-[2.75rem]
                  "
                >
                  Finish setting
                  <br />
                  up your business
                </h1>

                <p className="max-w-md text-[15px] leading-relaxed text-white/45 sm:text-base">
                  Complete the remaining onboarding steps before activating your
                  workspace.
                </p>
              </div>
            </div>

            <SetupChecklist />
          </div>

          {/* Bottom CTA */}
          <div className="pt-2 sm:pt-4">
            <ActivateBusinessButton />
          </div>
        </div>
      </div>
    </div>
  );
}