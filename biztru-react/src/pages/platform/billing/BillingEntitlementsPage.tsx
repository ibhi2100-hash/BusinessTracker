
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Package,
  Users,
  Building2,
  Database,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";

import { useBusinessBilling } from "../../../Biztru/hooks/useBusinessBilling";

export default function BusinessEntitlementsPage() {
  const navigate = useNavigate();

  const { subscription, plans } = useBusinessBilling();

  const plan = plans.find(
    (item) => item.id === subscription?.planId
  );

  if (!subscription || !plan) {
    return (
      <GlassCard className="p-10 text-center">
        <ShieldCheck className="mx-auto text-gray-500" size={32} />
        <h2 className="font-semibold mt-4">
          No entitlement configuration
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Subscribe to a plan to view your business entitlements.
        </p>
        <GlassButton
          className="mt-5"
          onClick={() => navigate("/business/billing/plans")}
        >
          Browse Plans
        </GlassButton>
      </GlassCard>
    );
  }

  const limits = [
    {
      key: "maxStaff",
      label: "Staff Members",
      icon: Users,
      value: plan.limits.maxStaff,
    },
    {
      key: "maxBranches",
      label: "Branches",
      icon: Building2,
      value: plan.limits.maxBranches,
    },
    {
      key: "maxProducts",
      label: "Products",
      icon: Package,
      value: plan.limits.maxProducts,
    },
    {
      key: "maxStorageMb",
      label: "Storage (MB)",
      icon: Database,
      value: plan.limits.maxStorageMb,
    },
  ];

  return (
    <div className="space-y-6 pb-10">

      <div>
        <h1 className="text-3xl font-bold">
          My Business Entitlements
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Features and resource limits included in your subscription.
        </p>
      </div>

      <GlassCard className="p-5">
        <p className="text-xs text-gray-500 uppercase">
          Current Subscription
        </p>
        <h2 className="text-2xl font-bold mt-2">
          {subscription.planName}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Plan version {subscription.planVersion}
        </p>
      </GlassCard>

      {/* RESOURCE QUOTAS */}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Resource Allowances</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {limits.map((limit) => (
            <GlassCard key={limit.key} className="p-5">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">
                  {limit.label}
                </span>
                <limit.icon className="text-teal-400" size={20} />
              </div>

              <h3 className="text-2xl font-bold mt-5">
                {limit.value == null
                  ? "Unlimited"
                  : limit.value.toLocaleString()}
              </h3>

              <p className="text-xs text-gray-500 mt-2">
                Allocated by your subscription
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* FEATURES */}

      <GlassCard className="p-6">
        <div className="flex gap-3 items-center">
          <ShieldCheck className="text-teal-400" size={22} />
          <h2 className="text-lg font-semibold">
            Enabled Features
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-5">
          {Object.entries(plan.features).map(([key, enabled]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl bg-white/5 p-4"
            >
              <span className="text-sm">{key}</span>

              {enabled ? (
                <CheckCircle2 className="text-emerald-400" size={19} />
              ) : (
                <XCircle className="text-gray-500" size={19} />
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton
          onClick={() => navigate("/business/billing/plans")}
        >
          Explore Other Plans
          <ArrowUpRight size={16} className="ml-2" />
        </GlassButton>
      </div>
    </div>
  );
}
