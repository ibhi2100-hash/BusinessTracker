
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Search,
  RefreshCw,
  Layers3,
  Eye,
  Pencil,
  Send,
  Archive,
  AlertCircle,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api"; 

import type {
  BillingPlan,
  BillingPlanStatus,
} from "../../../types/billing/billingPlan.types";

function formatPrice(plan: BillingPlan) {
  const amount = Number(plan.priceMinor) / 100;

  if (amount === 0) return "Free";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: plan.currency || "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function StatusBadge({
  status,
}: {
  status: BillingPlanStatus;
}) {
  const styles: Record<BillingPlanStatus, string> = {
    DRAFT: "bg-amber-500/10 text-amber-400",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400",
    RETIRED: "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function BillingPlansPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | BillingPlanStatus>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await billingPlanApi.list();

      setPlans(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load billing plans"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      plan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = plans.filter(
    (plan) => plan.status === "PUBLISHED"
  ).length;

  const draftCount = plans.filter(
    (plan) => plan.status === "DRAFT"
  ).length;

  const retiredCount = plans.filter(
    (plan) => plan.status === "RETIRED"
  ).length;

  const handlePublish = async (plan: BillingPlan) => {
    const confirmed = window.confirm(
      `Publish "${plan.name}"? This will make its published configuration available to businesses.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(plan.id);
      setError("");

      await billingPlanApi.publish(plan.id);

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish plan"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetire = async (plan: BillingPlan) => {
    const confirmed = window.confirm(
      `Retire "${plan.name}"? Existing subscriptions must remain governed by their accepted terms.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(plan.id);
      setError("");

      await billingPlanApi.retire(plan.id);

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retire plan"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Platform Command Center
            <span>/</span>
            Billing
            <span>/</span>
            Plans
          </div>

          <h1 className="text-3xl font-bold mt-2">
            Subscription Plans
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Configure and distribute subscription plans across BizTru businesses.
          </p>
        </div>

        <div className="flex gap-2">
          <GlassButton
            variant="secondary"
            onClick={loadPlans}
            disabled={loading}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </GlassButton>

          <GlassButton
            onClick={() =>
              navigate("/platform/billing/plans/new")
            }
          >
            <Plus size={17} className="mr-2" />
            Create Plan
          </GlassButton>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Plans",
            value: plans.length,
            description: "All registered plans",
            icon: Layers3,
          },
          {
            title: "Published",
            value: publishedCount,
            description: "Available in the business catalogue",
            icon: Send,
          },
          {
            title: "Drafts",
            value: draftCount,
            description: "Awaiting publication",
            icon: Pencil,
          },
          {
            title: "Retired",
            value: retiredCount,
            description: "No longer available for new subscriptions",
            icon: Archive,
          },
        ].map((metric) => (
          <GlassCard
            key={metric.title}
            className="p-5"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {metric.title}
              </span>

              <GlassIcon size="sm">
                <metric.icon size={19} />
              </GlassIcon>
            </div>

            <h3 className="text-3xl font-bold mt-4">
              {metric.value}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              {metric.description}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* PLAN TABLE */}

      <GlassCard className="p-5">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Plan Catalogue
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Manage the subscription products offered to businesses.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "ALL" | BillingPlanStatus
                )
              }
              className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                <th className="py-4 px-3">Plan</th>
                <th className="py-4 px-3">Price</th>
                <th className="py-4 px-3">Interval</th>
                <th className="py-4 px-3">Version</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">Featured</th>
                <th className="py-4 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <LoaderCircle
                      className="animate-spin mx-auto text-teal-400"
                      size={25}
                    />
                    <p className="text-sm text-gray-400 mt-3">
                      Loading billing plans...
                    </p>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Layers3
                      size={30}
                      className="mx-auto text-gray-500"
                    />

                    <p className="font-medium mt-3">
                      No billing plans found
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Create a plan to start configuring your subscription catalogue.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-white/5 hover:bg-white/[0.025]"
                  >
                    <td className="py-5 px-3">
                      <div className="font-semibold">
                        {plan.name}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {plan.code}
                      </div>
                    </td>

                    <td className="py-5 px-3 font-semibold">
                      {formatPrice(plan)}
                    </td>

                    <td className="py-5 px-3 text-sm text-gray-400">
                      {plan.billingCycle}
                    </td>

                    <td className="py-5 px-3 text-sm">
                      v{plan.currentVersion}
                    </td>

                    <td className="py-5 px-3">
                      <StatusBadge status={plan.status} />
                    </td>

                    <td className="py-5 px-3">
                      {plan.isFeatured ? (
                        <span className="text-teal-400 text-xs">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          Standard
                        </span>
                      )}
                    </td>

                    <td className="py-5 px-3">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          title="View plan"
                          onClick={() =>
                            navigate(
                              `/platform/billing/plans/${plan.id}`
                            )
                          }
                          className="p-2 rounded-lg hover:bg-white/10"
                        >
                          <Eye size={17} />
                        </button>

                        {plan.status !== "RETIRED" && (
                          <button
                            title="Edit plan"
                            onClick={() =>
                              navigate(
                                `/platform/billing/plans/${plan.id}/edit`
                              )
                            }
                            className="p-2 rounded-lg hover:bg-white/10"
                          >
                            <Pencil size={17} />
                          </button>
                        )}

                        {plan.status === "DRAFT" && (
                          <button
                            title="Publish plan"
                            disabled={processingId === plan.id}
                            onClick={() => handlePublish(plan)}
                            className="p-2 rounded-lg hover:bg-teal-500/10 text-teal-400 disabled:opacity-40"
                          >
                            {processingId === plan.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Send size={17} />
                            )}
                          </button>
                        )}

                        {plan.status === "PUBLISHED" && (
                          <button
                            title="Retire plan"
                            disabled={processingId === plan.id}
                            onClick={() => handleRetire(plan)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 disabled:opacity-40"
                          >
                            <Archive size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 flex justify-between text-xs text-gray-500">
          <span>
            Showing {filteredPlans.length} of {plans.length} plans
          </span>

          <span className="flex items-center gap-1">
            Platform catalogue
            <ArrowUpRight size={13} />
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
