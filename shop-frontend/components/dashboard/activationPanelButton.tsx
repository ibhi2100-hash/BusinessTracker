"use client";

import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";
import { useActivateBusiness } from "@/hooks/useBusinessStatus";

export const GlobalBusinessActivationButton = () => {
  const { data: business, isLoading } = useBusinessStatus();
  const { mutate: activate, isPending } = useActivateBusiness();

  if (isLoading || !business?.isOpening) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 md:static md:px-0">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white">
        
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Business Not Activated
            </p>
            <p className="text-xs opacity-80">
              Start operating to enable transactions
            </p>
          </div>
        </div>

        <Button
          onClick={() => activate()}
          disabled={isPending}
          className="bg-white text-indigo-700 hover:bg-white/90 rounded-xl px-4"
        >
          {isPending ? "Starting..." : "Start Now"}
        </Button>
      </div>
    </div>
  );
};