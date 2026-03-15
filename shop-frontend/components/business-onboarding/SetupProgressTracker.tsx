// components/business-onboarding/SetupProgressTracker.tsx
"use client";

import { Card } from "@/components/ui/card";
import clsx from "clsx";
import { useBusinessStatusStore } from '@/store/useBusinessStatusStore'

export const SetupProgressTracker = () => {

  const storePercentage = useBusinessStatusStore(s => s.percentage);

  const percentage = storePercentage ?? 0;
  const isComplete = percentage === 100;

  return (
    <Card className="space-y-4 relative p-6 overflow-hidden">
      <div>
        <h2 className="text-sm font-medium">Setup Progress</h2>
        <p className="text-xs text-gray-500">
          Complete all steps to activate your business
        </p>
      </div>

      {/* Progress Bar Wrapper */}
      <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        {/* Milestones */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="w-px bg-gray-300 opacity-40"
            />
          ))}
        </div>

        {/* Gradient Fill */}
        <div
          className={clsx(
            "h-3 rounded-full transition-all duration-700 ease-out relative",
            "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500",
            isComplete && "animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.7)]"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer Effect */}
          {percentage > 0 && percentage < 100 && (
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
        </div>
      </div>

      {/* Percentage Text */}
      <div
        className={clsx(
          "text-xs text-right transition-colors duration-300",
          isComplete ? "text-green-600 font-medium" : "text-gray-500"
        )}
      >
        {isComplete ? "100% — Setup Complete 🎉" : `${percentage}% completed`}
      </div>
    </Card>
  );
};