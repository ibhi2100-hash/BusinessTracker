
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api"; 

import type {
  BillingPlan,
  BillingCycle,
  UpdateBillingPlanInput,
} from "../../../types/billing/billingPlan.types";

const features = [
  ["inventory", "Inventory Management"],
  ["advancedReports", "Advanced Reports"],
  ["multiBranch", "Multi-Branch Management"],
  ["apiAccess", "API Access"],
  ["payroll", "Payroll Management"],
  ["employeeManagement", "Employee Management"],
  ["customerManagement", "Customer Management"],
  ["advancedAnalytics", "Advanced Analytics"],
];

export default function EditBillingPlanPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [form, setForm] = useState<UpdateBillingPlanInput>({});
  const [price, setPrice] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) return;

    let active = true;

    const load = async () => {
      try {
        const result = await billingPlanApi.get(planId);

        if (!active) return;

        setPlan(result);

        setForm({
          code: result.code,
          name: result.name,
          description: result.description ?? "",
          currency: result.currency,
          billingCycle: result.billingCycle,
          trialDays: result.trialDays,
          limits: { ...result.limits },
          features: { ...result.features },
          displayOrder: result.displayOrder,
          isFeatured: result.isFeatured,
        });

        setPrice(
          String(Number(result.priceMinor) / 100)
        );
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load plan"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [planId]);

  const setField = <K extends keyof UpdateBillingPlanInput>(
    key: K,
    value: UpdateBillingPlanInput[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const setLimit = (
    key: keyof NonNullable<UpdateBillingPlanInput["limits"]>,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      limits: {
        ...previous.limits,
        [key]: value === "" ? null : Number(value),
      },
    }));
  };

  const setFeature = (key: string, value: boolean) => {
    setForm((previous) => ({
      ...previous,
      features: {
        ...previous.features,
        [key]: value,
      },
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!planId || !plan) return;

    if (!form.name?.trim() || !form.code?.trim()) {
      setError("Plan name and code are required.");
      return;
    }

    const amount = Number(price);

    if (
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isSafeInteger(Math.round(amount * 100))
    ) {
      setError("Enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await billingPlanApi.update(planId, {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        priceMinor: String(Math.round(amount * 100)),
      });

      navigate(`/platform/billing/plans/${planId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update plan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="animate-spin text-teal-400" size={28} />
      </div>
    );
  }

  if (!plan) {
    return (
      <GlassCard className="p-8">
        <AlertCircle className="text-red-400" />
        <p className="mt-3">{error || "Plan not found."}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <button
          onClick={() => navigate(`/platform/billing/plans/${planId}`)}
          className="flex items-center gap-2 text-sm text-gray-400"
        >
          <ArrowLeft size={16} />
          Back to plan
        </button>

        <h1 className="text-3xl font-bold mt-5">
          Edit {plan.name}
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Current version: v{plan.currentVersion}
        </p>
      </div>

      {plan.status === "PUBLISHED" && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-4">
          <p className="text-sm text-teal-300 font-medium">
            Version-controlled editing
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your changes must create a new draft version. The currently published
            configuration remains available to businesses until the new version
            is explicitly published.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-semibold">General Information</h2>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["name", "Plan Name"],
              ["code", "Plan Code"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-400">{label}</label>
                <input
                  required
                  value={String(form[key as keyof UpdateBillingPlanInput] ?? "")}
                  onChange={(e) =>
                    setField(
                      key as keyof UpdateBillingPlanInput,
                      e.target.value as never
                    )
                  }
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-400">Description</label>
            <textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-semibold">Commercial Configuration</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400">Price (NGN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Billing Cycle</label>
              <select
                value={form.billingCycle ?? "MONTHLY"}
                onChange={(e) =>
                  setField("billingCycle", e.target.value as BillingCycle)
                }
                className="w-full mt-2 bg-[#111827] border border-white/10 rounded-xl p-3"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Annually</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Trial Days</label>
              <input
                type="number"
                min="0"
                value={form.trialDays ?? 0}
                onChange={(e) =>
                  setField("trialDays", Number(e.target.value))
                }
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.displayOrder ?? 1}
                onChange={(e) =>
                  setField("displayOrder", Number(e.target.value))
                }
                className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured ?? false}
              onChange={(e) => setField("isFeatured", e.target.checked)}
            />
            Featured plan
          </label>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-semibold">Resource Limits</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["maxStaff", "Maximum Staff"],
              ["maxBranches", "Maximum Branches"],
              ["maxProducts", "Maximum Products"],
              ["maxStorageMb", "Storage (MB)"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm text-gray-400">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={
                    form.limits?.[
                      key as keyof NonNullable<typeof form.limits>
                    ] ?? ""
                  }
                  onChange={(e) =>
                    setLimit(
                      key as keyof NonNullable<typeof form.limits>,
                      e.target.value
                    )
                  }
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-3"
                />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <h2 className="text-lg font-semibold">Feature Entitlements</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
              >
                <span className="text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={form.features?.[key] ?? false}
                  onChange={(e) => setFeature(key, e.target.checked)}
                />
              </label>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end gap-3">
          <GlassButton
            type="button"
            variant="secondary"
            onClick={() => navigate(`/platform/billing/plans/${planId}`)}
          >
            Cancel
          </GlassButton>

          <GlassButton type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle className="animate-spin mr-2" size={17} />
            ) : (
              <Save className="mr-2" size={17} />
            )}
            Save Changes
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
