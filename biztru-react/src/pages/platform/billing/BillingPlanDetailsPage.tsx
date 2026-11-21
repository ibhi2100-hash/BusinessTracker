
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Pencil,
  Send,
  Archive,
  Clock,
  Layers3,
  Users,
  Building2,
  Package,
  ShieldCheck,
  Calendar,
  History,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api"; 
import type {
  BillingPlan,
  BillingPlanVersion,
} from "../../../types/billing/billingPlan.types";

function formatPrice(plan: BillingPlan) {
  const amount = Number(plan.priceMinor) / 100;

  if (amount === 0) return "Free";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: plan.currency,
  }).format(amount);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold mt-2 break-words">{value}</p>
    </div>
  );
}

export default function BillingPlanDetailsPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [versions, setVersions] = useState<BillingPlanVersion[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!planId) return;

    try {
      setLoading(true);
      setError("");

      const [planResult, versionResult] = await Promise.all([
        billingPlanApi.get(planId),
        billingPlanApi.versions(planId),
      ]);

      setPlan(planResult);
      setVersions(versionResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load plan details"
      );
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  const publish = async () => {
    if (!plan || !window.confirm(
      `Publish ${plan.name}?`
    )) return;

    try {
      setProcessing(true);
      await billingPlanApi.publish(plan.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication failed");
    } finally {
      setProcessing(false);
    }
  };

  const retire = async () => {
    if (!plan || !window.confirm(
      `Retire ${plan.name} from new subscriptions?`
    )) return;

    try {
      setProcessing(true);
      await billingPlanApi.retire(plan.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retirement failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="animate-spin text-teal-400" size={30} />
      </div>
    );
  }

  if (!plan) {
    return (
      <GlassCard className="p-10 text-center">
        <AlertCircle className="mx-auto text-red-400" size={30} />
        <h2 className="mt-4 font-semibold">Plan unavailable</h2>
        <p className="text-sm text-gray-400 mt-2">{error}</p>
        <GlassButton className="mt-5" onClick={() => navigate("/platform/billing/plans")}>
          Back to plans
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/platform/billing/plans")}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <ArrowLeft size={16} /> Back to plans
          </button>

          <h1 className="text-3xl font-bold mt-5">{plan.name}</h1>

          <p className="text-sm text-gray-400 mt-2">
            {plan.code} · Version {plan.currentVersion}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {plan.status !== "RETIRED" && (
            <GlassButton
              variant="secondary"
              onClick={() => navigate(`/platform/billing/plans/${plan.id}/edit`)}
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </GlassButton>
          )}

          {plan.status === "DRAFT" && (
            <GlassButton disabled={processing} onClick={publish}>
              <Send size={16} className="mr-2" />
              Publish
            </GlassButton>
          )}

          {plan.status === "PUBLISHED" && (
            <GlassButton
              variant="danger"
              disabled={processing}
              onClick={retire}
            >
              <Archive size={16} className="mr-2" />
              Retire
            </GlassButton>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* PLAN SUMMARY */}

      <GlassCard className="p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">
              Subscription price
            </p>
            <h2 className="text-4xl font-bold mt-3">
              {formatPrice(plan)}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {plan.billingCycle}
            </p>
          </div>

          <div className="text-right">
            <span className={`rounded-full px-3 py-2 text-xs ${
              plan.status === "PUBLISHED"
                ? "bg-emerald-500/10 text-emerald-400"
                : plan.status === "DRAFT"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-gray-500/10 text-gray-400"
            }`}>
              {plan.status}
            </span>

            {plan.isFeatured && (
              <p className="text-xs text-teal-400 mt-3">Featured plan</p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          {plan.description || "No plan description provided."}
        </p>
      </GlassCard>

      {/* COMMERCIAL DETAILS */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Commercial Configuration</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Currency" value={plan.currency} />
          <DetailItem label="Billing Cycle" value={plan.billingCycle} />
          <DetailItem label="Free Trial" value={`${plan.trialDays} days`} />
          <DetailItem label="Display Order" value={plan.displayOrder} />
        </div>
      </section>

      {/* RESOURCE LIMITS */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Resource Limits</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Maximum Staff"
            value={plan.limits.maxStaff ?? "Unlimited"}
          />
          <DetailItem
            label="Maximum Branches"
            value={plan.limits.maxBranches ?? "Unlimited"}
          />
          <DetailItem
            label="Maximum Products"
            value={plan.limits.maxProducts ?? "Unlimited"}
          />
          <DetailItem
            label="Storage"
            value={
              plan.limits.maxStorageMb == null
                ? "Unlimited"
                : `${plan.limits.maxStorageMb} MB`
            }
          />
        </div>
      </section>

      {/* FEATURES */}

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-teal-400" size={22} />
          <h2 className="font-semibold text-lg">Feature Entitlements</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-5">
          {Object.entries(plan.features).map(([key, enabled]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-white/5 rounded-xl p-4"
            >
              <span className="text-sm">{key}</span>
              {enabled ? (
                <CheckCircle2 className="text-emerald-400" size={19} />
              ) : (
                <span className="text-xs text-gray-500">Disabled</span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* VERSION HISTORY */}

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <History className="text-teal-400" size={22} />
          <div>
            <h2 className="text-lg font-semibold">Version History</h2>
            <p className="text-xs text-gray-400 mt-1">
              Historical configurations of this subscription plan.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {versions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No version history is available.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-4"
              >
                <div className="flex gap-3">
                  <GlassIcon size="sm">
                    <Layers3 size={18} />
                  </GlassIcon>

                  <div>
                    <p className="font-medium">
                      Version {version.version}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(version.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Calendar size={14} />
                  {version.publishedAt
                    ? `Published ${new Date(version.publishedAt).toLocaleDateString()}`
                    : "Not published"}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

    </div>
  );
}
