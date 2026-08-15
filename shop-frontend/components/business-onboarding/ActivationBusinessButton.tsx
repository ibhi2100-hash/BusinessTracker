"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Rocket,
} from "lucide-react";

import { toast } from "sonner";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { useBusinessContext } from "@/src/context/BusinessContext";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export function ActivateBusinessButton() {
  const router = useRouter();
  const app = useApplication()
  const { businessId, branchId } = useBusinessContext();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const canActivate = !!businessId && !!branchId;

  const handleActivate = async () => {
    if (!businessId && !branchId) return;

    try {
      setLoading(true);
      setError("");

      await app.onboarding.activateBusiness()
     
      toast.success(
        "Business activated successfully"
      );

      router.replace("/dashboard");
    } catch (err: any) {
      const message =
        err?.message ??
        "Failed to activate business";

      setError(message);
      

      toast.error(message);
      throw err
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard
      variant="accent"
      className="p-5"
    >
      <div className="space-y-5">
        <div className="flex gap-4">
          <GlassIcon
            size="lg"
            variant="success"
          >
            <Rocket size={22} />
          </GlassIcon>

          <div>
            <h2 className="text-lg font-semibold">
              Activate Workspace
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Your business will become
              fully operational after
              activation.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-400
          "
          >
            {error}
          </div>
        )}

        <GlassButton
          className="w-full"
          variant="primary"
          icon={
            loading ? undefined : (
              <ArrowRight size={18} />
            )
          }
          disabled={!canActivate || loading}
          onClick={handleActivate}
        >
          {loading
            ? "Activating..."
            : "Start Business"}
        </GlassButton>
      </div>
    </GlassCard>
  );
}