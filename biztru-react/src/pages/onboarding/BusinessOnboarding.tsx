
import { useState } from "react";
import { useNavigate} from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";

import { GlassButton } from "../../components/ui/GlassButton";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassInput } from "../../components/ui/GlassInput";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext"; 
import { useApplicationSession } from "../../Biztru/context/AplicationSessionContext";

export default function OnboardingBusinessPage() {
  const navigate = useNavigate() 
  const app = useApplication();
  const { refreshSession, session } = useApplicationSession()
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
        /*
         * ============================================================
         * 1. CREATE BUSINESS
         * ============================================================
         */

        await app.onboarding.createBusiness({
            id: businessId,
            name: form.name.trim(),
            address: form.address.trim(),
        });

        /*
         * ============================================================
         * 2. CREATE MAIN BRANCH
         * ============================================================
         */

        await app.onboarding.createMainBranch({
            id: branchId,
            businessId,
            name: "Main Branch",
        });

        /*
         * ============================================================
         * 3. SET ACTIVE BUSINESS
         * ============================================================
         */

        await app.context.setActiveBusiness(
            businessId
        );

        /*
         * ============================================================
         * 4. SET ACTIVE BRANCH
         * ============================================================
         */

        await app.context.setActiveBranch(
            branchId
        );

        console.log("[Onboarding] BEFORE REFRESH", {
          sessionUserId: session.user?.id,
          sessionBusinessId: session.user?.businessId,
          expectedBusinessId: businessId,
      });
              /*
         * ============================================================
         * 5. RECONSTRUCT DURABLE SESSION
         * ============================================================
         */

        const nextSession =
            await refreshSession();

        console.log("[Onboarding] AFTER REFRESH", {
            userId: nextSession.user?.id,
            businessId: nextSession.user?.businessId,
            expectedBusinessId: businessId,
        });
        /*
         * ============================================================
         * 6. VERIFY SESSION
         * ============================================================
         */

        if (
            nextSession.status !== "authenticated"
        ) {
            throw new Error(
                "Business was created, but the application session is not authenticated."
            );
        }

        if (
            !nextSession.user
        ) {
            throw new Error(
                "Business was created, but the authenticated user could not be restored."
            );
        }

        if (
            nextSession.user.businessId !== businessId
        ) {
            throw new Error(
                `Session user does not reference the created business. Expected ${businessId}, received ${nextSession.user.businessId ?? "null"}.`
            );
        }

        if (
            !nextSession.business
        ) {
            throw new Error(
                "Business was created, but it could not be restored from durable storage."
            );
        }

        if (
            nextSession.business.id !== businessId
        ) {
            throw new Error(
                `Restored business does not match the created business. Expected ${businessId}, received ${nextSession.business.id}.`
            );
        }

        /*
         * ============================================================
         * 7. VERIFY BRANCH
         * ============================================================
         */

        if (
            nextSession.user.branchId !== branchId
        ) {
            throw new Error(
                `Session user does not reference the created branch. Expected ${branchId}, received ${nextSession.user.branchId ?? "null"}.`
            );
        }

        if (
            !nextSession.branch
        ) {
            throw new Error(
                "Branch was created, but it could not be restored from durable storage."
            );
        }

        if (
            nextSession.branch.id !== branchId
        ) {
            throw new Error(
                `Restored branch does not match the created branch. Expected ${branchId}, received ${nextSession.branch.id}.`
            );
        }

        /*
         * ============================================================
         * 8. SESSION IS NOW VALID
         * ============================================================
         */

        navigate(
            "/onboarding",
            {
                replace: true,
            }
        );

    } catch (err) {

        console.error(
            "[Onboarding] Business setup failed:",
            err
        );

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