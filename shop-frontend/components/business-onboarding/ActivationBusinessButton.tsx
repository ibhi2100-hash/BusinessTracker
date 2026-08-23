"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { useBusinessContext } from "@/src/context/BusinessContext";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export function ActivateBusinessButton() {
  const router = useRouter();
  const app = useApplication();
  const { businessId, branchId } = useBusinessContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canActivate = Boolean(businessId && branchId);

  const handleActivate = async () => {
    if (!businessId || !branchId || loading) return;

    try {
      setLoading(true);
      setError("");

      await app.onboarding.activateBusiness(businessId);

      toast.success("Business activated successfully");
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to activate business";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="accent" className="border-white/10 p-4 sm:p-5">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex gap-3 sm:gap-4">
          <GlassIcon size="md" variant="success">
            <Rocket className="h-5 w-5" />
          </GlassIcon>

          <div className="min-w-0">
            <h2 className="text-base font-semibold sm:text-lg">
              Activate Workspace
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-400 sm:text-sm">
              Your business will become fully operational after activation.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <GlassButton
          className="h-12 w-full sm:h-14"
          variant="primary"
          disabled={!canActivate || loading}
          onClick={handleActivate}
          icon={
            loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )
          }
        >
          {loading ? "Activating..." : "Start Business"}
        </GlassButton>

        {!canActivate && (
          <p className="text-center text-xs text-white/30">
            Complete business and branch setup first
          </p>
        )}
      </div>
    </GlassCard>
  );
}