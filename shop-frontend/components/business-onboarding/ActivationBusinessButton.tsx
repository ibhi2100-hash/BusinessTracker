"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOnboardingStatus } from "@/hooks/useSetUpStatus";
import { useActivateBusiness } from "@/hooks/useActivateBusiness";
import { useRouter } from "next/navigation";

export const ActivateBusinessButton = () => {
  const { data } = useOnboardingStatus()
  const canActivate = data?.canActivate ?? false;
  const { mutate: activate, isPending } = useActivateBusiness();
  const router = useRouter();

  const handleActivate = () => {
    if (!canActivate ) return;

    activate(undefined, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <Card className="space-y-4">
      <Button
        disabled={!canActivate}
        onClick={handleActivate}
        className="w-full rounded-xl"
      >
        {isPending ? "Activating..." : "🚀 Start Business"}
      </Button>

      {!canActivate && (
        <p className="text-xs text-center text-gray-500">
          Complete all setup steps before activation.
        </p>
      )}
    </Card>
  );
};