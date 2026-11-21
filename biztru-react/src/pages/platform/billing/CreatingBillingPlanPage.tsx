
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Layers3,
  Users,
  Package,
  Building2,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api"; 

import type {
  BillingCycle,
  CreateBillingPlanInput,
} from "../../../types/billing/billingPlan.types";

const featureDefinitions = [
  { key: "inventory", label: "Inventory Management" },
  { key: "advancedReports", label: "Advanced Reports" },
  { key: "multiBranch", label: "Multi-Branch Management" },
  { key: "apiAccess", label: "API Access" },
  { key: "payroll", label: "Payroll Management" },
  { key: "employeeManagement", label: "Employee Management" },
  { key: "customerManagement", label: "Customer Management" },
  { key: "advancedAnalytics", label: "Advanced Analytics" },
];

const initialForm: CreateBillingPlanInput = {
  code: "",
  name: "",
  description: "",

  priceMinor: "0",
  currency: "NGN",
  billingCycle: "MONTHLY",

  trialDays: 0,

  limits: {
    maxStaff: 5,
    maxBranches: 1,
    maxProducts: 100,
    maxStorageMb: 1024,
  },

  features: Object.fromEntries(
    featureDefinitions.map((feature) => [
      feature.key,
      false,
    ])
  ),

  displayOrder: 1,
  isFeatured: false,
};

export default function CreateBillingPlanPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [price, setPrice] = useState("0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof CreateBillingPlanInput>(
    key: K,
    value: CreateBillingPlanInput[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateLimit = (
    key: keyof CreateBillingPlanInput["limits"],
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

  const updateFeature = (
    key: string,
    enabled: boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      features: {
        ...previous.features,
        [key]: enabled,
      },
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      setError("Plan name and plan code are required.");
      return;
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isSafeInteger(
        Math.round(numericPrice * 100)
      )
    ) {
      setError("Enter a valid plan price.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: CreateBillingPlanInput = {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        priceMinor: String(
          Math.round(numericPrice * 100)
        ),
      };

      const plan = await billingPlanApi.create(payload);

      navigate(
        `/platform/billing/plans/${plan.id}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create billing plan"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}

      <div>
        <button
          onClick={() => navigate("/platform/billing/plans")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to plans
        </button>

        <h1 className="text-3xl font-bold mt-5">
          Create Subscription Plan
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Define a new commercial package and its business entitlements.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* GENERAL INFORMATION */}

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Layers3 className="text-teal-400" size={22} />

            <div>
              <h2 className="font-semibold text-lg">
                General Information
              </h2>

              <p className="text-xs text-gray-400">
                Identify and describe this subscription plan.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-300">
                Plan Name *
              </label>

              <input
                required
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                placeholder="e.g. Growth"
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Plan Code *
              </label>

              <input
                required
                value={form.code}
                onChange={(e) =>
                  update(
                    "code",
                    e.target.value.toUpperCase().replace(/\s/g, "_")
                  )
                }
                placeholder="e.g. GROWTH"
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-teal-500/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  update("description", e.target.value)
                }
                placeholder="Describe what this plan offers..."
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-teal-500/50 resize-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* COMMERCIAL CONFIGURATION */}

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-teal-400" size={22} />

            <div>
              <h2 className="font-semibold text-lg">
                Commercial Configuration
              </h2>

              <p className="text-xs text-gray-400">
                Set the subscription price and billing terms.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-300">
                Subscription Price (NGN)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Billing Cycle
              </label>

              <select
                value={form.billingCycle}
                onChange={(e) =>
                  update(
                    "billingCycle",
                    e.target.value as BillingCycle
                  )
                }
                className="w-full mt-2 rounded-xl bg-[#111827] border border-white/10 p-3"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Annually</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Free Trial (Days)
              </label>

              <input
                type="number"
                min="0"
                value={form.trialDays}
                onChange={(e) =>
                  update("trialDays", Number(e.target.value))
                }
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(e) =>
                  update("displayOrder", Number(e.target.value))
                }
                className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3"
              />
            </div>
          </div>

          <label className="flex gap-3 items-center text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                update("isFeatured", e.target.checked)
              }
              className="accent-teal-500"
            />

            Feature this plan on the public pricing page
          </label>
        </GlassCard>

        {/* RESOURCE LIMITS */}

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Package className="text-teal-400" size={22} />

            <div>
              <h2 className="font-semibold text-lg">
                Resource Limits
              </h2>

              <p className="text-xs text-gray-400">
                Define how much each subscribed business can consume.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                key: "maxStaff" as const,
                label: "Maximum Staff",
                icon: Users,
              },
              {
                key: "maxBranches" as const,
                label: "Maximum Branches",
                icon: Building2,
              },
              {
                key: "maxProducts" as const,
                label: "Maximum Products",
                icon: Package,
              },
              {
                key: "maxStorageMb" as const,
                label: "Storage Limit (MB)",
                icon: Layers3,
              },
            ].map((item) => (
              <div key={item.key}>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <item.icon size={16} />
                  {item.label}
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.limits[item.key] ?? ""}
                  onChange={(e) =>
                    updateLimit(item.key, e.target.value)
                  }
                  placeholder="Leave blank for unlimited"
                  className="w-full mt-2 rounded-xl bg-white/5 border border-white/10 p-3"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            A null limit means unlimited. The backend must interpret this consistently.
          </p>
        </GlassCard>

        {/* FEATURE ENTITLEMENTS */}

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-teal-400" size={22} />

            <div>
              <h2 className="font-semibold text-lg">
                Feature Entitlements
              </h2>

              <p className="text-xs text-gray-400">
                Choose the capabilities available to this plan.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {featureDefinitions.map((feature) => (
              <label
                key={feature.key}
                className="flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/5 p-4 cursor-pointer hover:bg-white/[0.08]"
              >
                <span className="text-sm">
                  {feature.label}
                </span>

                <input
                  type="checkbox"
                  checked={
                    form.features[feature.key] ?? false
                  }
                  onChange={(e) =>
                    updateFeature(
                      feature.key,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 accent-teal-500"
                />
              </label>
            ))}
          </div>
        </GlassCard>

        {/* SUBMISSION */}

        <div className="flex flex-wrap justify-end gap-3">
          <GlassButton
            type="button"
            variant="secondary"
            onClick={() =>
              navigate("/platform/billing/plans")
            }
          >
            Cancel
          </GlassButton>

          <GlassButton
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="mr-2 animate-spin"
              />
            ) : (
              <Save size={17} className="mr-2" />
            )}

            Save Plan
          </GlassButton>
        </div>

      </form>
    </div>
  );
}
