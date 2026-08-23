"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { GlassInput } from "@/components/ui/GlassInput";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export default function Step2Business() {
  const router = useRouter();
  const app = useApplication();

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const handleNext = async () => {
    if (loading) return;

    if (!form.name.trim()) {
      setError("Business name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const businessId = crypto.randomUUID();
    const branchId = crypto.randomUUID();

    try {
      await app.onboarding.createBusiness({
        id: businessId,
        name: form.name.trim(),
        address: form.address.trim(),
      });

      await app.onboarding.createMainBranch({
        id: branchId,
        businessId,
        name: "Main Branch",
      });

      router.replace("/onboard");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not create business. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-white">
      {/* Centered shell: full width on mobile, card on desktop */}
      <div
        className="
          mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col
          px-4 pt-6
          pb-[max(1.5rem,env(safe-area-inset-bottom))]
          sm:px-6
          sm:pt-10
          lg:max-w-xl
          lg:justify-center
          lg:py-12
        "
      >
        <GlassCard
          variant="default"
          className="
            flex flex-1 flex-col
            border-white/10
            p-5
            sm:p-8
            lg:flex-none
            lg:p-10
          "
        >
          {/* TOP */}
          <div className="flex-1">
            <GlassIcon size="md" variant="primary">
              <Sparkles className="w-5 h-5" />
            </GlassIcon>

            <div className="mt-8 space-y-4 sm:mt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/60">
                  Business onboarding
                </span>
              </div>

              <h1
                className="
                  text-[2rem] font-semibold leading-[1.1] tracking-tight
                  sm:text-[2.5rem]
                  lg:text-[2.75rem]
                "
              >
                Create your
                <br />
                business
              </h1>

              <p className="max-w-md text-[15px] leading-relaxed text-white/50 sm:text-base">
                Set up your workspace to manage inventory, sales and financial
                activity in one system.
              </p>
            </div>

            {/* FORM */}
            <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <GlassInput
                icon={<Building2 className="w-4 h-4" />}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Business name"
                autoComplete="organization"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext();
                }}
              />

              <GlassInput
                icon={<MapPin className="w-4 h-4" />}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Business address (optional)"
                autoComplete="street-address"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext();
                }}
              />
            </div>
          </div>

          {/* CTA — sticky feel on mobile, natural on desktop */}
          <div className="mt-10 space-y-3 sm:mt-12">
            <GlassButton
              variant="primary"
              disabled={loading}
              onClick={handleNext}
              className="h-14 w-full rounded-2xl text-base font-medium"
              icon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {loading ? "Creating..." : "Continue"}
            </GlassButton>

            <p className="text-center text-sm text-white/30">
              Secure local-first business setup
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}