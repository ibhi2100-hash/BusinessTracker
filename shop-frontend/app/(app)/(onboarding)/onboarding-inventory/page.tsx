"use client";

import { SetupProgressTracker } from "@/components/business-onboarding/SetupProgressTracker";
import InventoryPage from "@/components/inventory/inventoryPage";
import { StepFooter } from "@/components/business-onboarding/StepFooter";
import { useRouter } from "next/navigation";

export default function InventoryStep() {
  const router = useRouter();

  const handleNext = () => {
    router.replace("/onboarding-opening-cash");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden">

      {/* ambient glow system */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-green-500/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-240px] right-[-100px] w-[420px] h-[420px] bg-cyan-500/10 blur-[180px] rounded-full" />
      </div>

      {/* layout container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-10 flex flex-col gap-6">

        {/* progress */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/30 rounded-3xl border border-white/10">
          <div className="p-4">
            <SetupProgressTracker />
          </div>
        </div>

        {/* content */}
        <div className="flex-1 space-y-6">
          <InventoryPage context="admin" mode="OPENING" />
        </div>

        {/* footer */}
        <div className="sticky bottom-0 z-30 pt-4 backdrop-blur-xl bg-black/30 border-t border-white/10">
          <StepFooter onNext={handleNext} disabled={false} />
        </div>

      </div>
    </div>
  );
}