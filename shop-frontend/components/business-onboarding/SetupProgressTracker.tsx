"use client";

import clsx from "clsx";

export const SetupProgressTracker = () => {
  const percentage = 100;
  const isComplete = percentage === 100;

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Background track */}
      <div className="h-[3px] w-full bg-gray-200/60 backdrop-blur-md">
        {/* Progress fill */}
        <div
          className={clsx(
            "h-full transition-all duration-500 ease-out",
            "bg-gradient-to-r from-green-400 via-green-500 to-green-600",
            isComplete && "shadow-[0_0_8px_rgba(34,197,94,0.7)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Optional subtle label */}
      <div className="px-4 py-1 text-[11px] text-gray-500 flex justify-between">
        <span>Setup</span>
        <span>{isComplete ? "Done" : `${percentage}%`}</span>
      </div>
    </div>
  );
};