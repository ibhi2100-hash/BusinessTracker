
import { useCallback, useEffect, useMemo, useState } from "react";
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
  Users,
  GitBranch,
  Package,
  Clock,
  CheckCircle2,
  Settings2,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api";

import type {
  BillingPlan,
  BillingPlanStatus,
} from "../../../types/billing/billingPlan.types";

import { usePlatformSession } from "../../../Biztru/services/PlatformSession/PlatformSessionContext";

/* =========================================================
   TYPES
========================================================= */

type BillingPlanVersion = NonNullable<BillingPlan["versions"]>[number];

type StatusFilter = "ALL" | BillingPlanStatus;

/* =========================================================
   HELPERS
========================================================= */

function getLatestVersion(
  plan: BillingPlan
): BillingPlanVersion | undefined {
  if (!plan.versions?.length) return undefined;

  return [...plan.versions].sort(
    (a, b) => b.planVersion - a.planVersion
  )[0];
}

function formatPrice(version?: BillingPlanVersion): string {
  if (!version) return "Not configured";

  const amount = Number(version.priceMinor) / 100;

  if (!Number.isFinite(amount)) return "Invalid price";

  if (amount === 0) return "Free";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: version.currency || "NGN",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${version.currency} ${amount.toLocaleString("en-NG")}`;
  }
}

function formatBillingCycle(
  version?: BillingPlanVersion
): string {
  if (!version) return "Not configured";

  const interval = version.intervalCount ?? 1;

  const labels: Record<string, string> = {
    MONTHLY: interval === 1 ? "Monthly" : `Every ${interval} months`,
    QUARTERLY: interval === 1 ? "Quarterly" : `Every ${interval} quarters`,
    YEARLY: interval === 1 ? "Yearly" : `Every ${interval} years`,
    LIFETIME: "Lifetime",
  };

  return labels[version.billingCycle] ?? version.billingCycle;
}

function formatLimit(value: number | undefined): string {
  if (value === undefined || value === null) {
    return "Not configured";
  }

  return value === -1 ? "Unlimited" : value.toLocaleString("en-NG");
}

function getFeatureCount(
  features?: Record<string, unknown>
): number {
  if (!features) return 0;

  return Object.values(features).filter(
    (value) => value === true
  ).length;
}

function extractPlans(response: unknown): BillingPlan[] {
  if (Array.isArray(response)) {
    return response as BillingPlan[];
  }

  if (!response || typeof response !== "object") {
    throw new Error("Billing plans API returned an invalid response.");
  }

  const result = response as Record<string, unknown>;

  const data =
    typeof result.data === "object" && result.data !== null
      ? (result.data as Record<string, unknown>)
      : undefined;

  const candidates = [
    result.plans,
    result.items,
    result.data,
    data?.plans,
    data?.items,
    data?.data,
  ];

  const plans = candidates.find(Array.isArray);

  if (!plans) {
    throw new Error(
      "Unable to read billing plans. Expected a plans array."
    );
  }

  return plans as BillingPlan[];
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: BillingPlanStatus;
}) {
  const styles: Record<string, string> = {
    DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    RETIRED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    ARCHIVED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] ?? styles.DRAFT
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   VERSION SUMMARY
========================================================= */

function VersionSummary({
  version,
}: {
  version?: BillingPlanVersion;
}) {
  if (!version) {
    return (
      <div className="flex items-center gap-2 text-amber-400 text-xs">
        <AlertCircle size={14} />
        No version configured
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-gray-300">
        <Users size={13} className="text-teal-400" />
        {formatLimit(version.maxStaff)} staff
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-300">
        <GitBranch size={13} className="text-teal-400" />
        {formatLimit(version.maxBranch)} branches
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-300">
        <Package size={13} className="text-teal-400" />
        {formatLimit(version.maxProduct)} products
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle2 size={13} className="text-emerald-400" />
        {getFeatureCount(version.features as Record<string, unknown>)} enabled features
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BillingPlansPage() {
  const navigate = useNavigate();

  const { session, isAuthenticated } = usePlatformSession();

  const [plans, setPlans] = useState<BillingPlan[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  /* =======================================================
     LOAD PLANS
  ======================================================= */

  const loadPlans = useCallback(async () => {
    try {
      if (!isAuthenticated || !session.accessToken) {
        throw new Error("Platform authentication required.");
      }

      setLoading(true);
      setError("");

      const result: unknown = await billingPlanApi.list(
        session.accessToken
      );

      const normalizedPlans = extractPlans(result);

      setPlans(normalizedPlans);
    } catch (err) {
      setPlans([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load billing plans."
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session.accessToken]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  /* =======================================================
     FILTERED PLANS
  ======================================================= */

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(normalizedSearch) ||
        plan.code.toLowerCase().includes(normalizedSearch) ||
        (plan.description ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  /* =======================================================
     METRICS
  ======================================================= */

  const metrics = useMemo(() => {
    return {
      total: plans.length,

      published: plans.filter(
        (plan) => plan.status === "PUBLISHED"
      ).length,

      drafts: plans.filter(
        (plan) => plan.status === "DRAFT"
      ).length,

      retired: plans.filter(
        (plan) => plan.status === "RETIRED"
      ).length,

      configured: plans.filter(
        (plan) => plan.versions?.length
      ).length,

      unconfigured: plans.filter(
        (plan) => !plan.versions?.length
      ).length,
    };
  }, [plans]);

  /* =======================================================
     PUBLISH PLAN
  ======================================================= */

  const handlePublish = async (plan: BillingPlan) => {
    if (!isAuthenticated || !session.accessToken) {
      setError("Platform authentication required.");
      return;
    }

    if (!plan.versions?.length) {
      setError(
        `Cannot publish "${plan.name}". Configure a plan version first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Publish "${plan.name}"? This will make its published configuration available to businesses.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(plan.id);
      setError("");

      await billingPlanApi.publish(
        plan.id,
        session.accessToken
      );

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish plan."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =======================================================
     RETIRE PLAN
  ======================================================= */

  const handleRetire = async (plan: BillingPlan) => {
    if (!isAuthenticated || !session.accessToken) {
      setError("Platform authentication required.");
      return;
    }

    const confirmed = window.confirm(
      `Retire "${plan.name}"? Existing subscriptions must remain governed by their accepted terms.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(plan.id);
      setError("");

      await billingPlanApi.retire(
        plan.id,
        session.accessToken
      );

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retire plan."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

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
            onClick={() => void loadPlans()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </GlassButton>

          <GlassButton
            onClick={() =>
              navigate("/command/billing/plans/create")
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
          <span className="flex-1">{error}</span>

          <button
            onClick={() => setError("")}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            title: "Total Plans",
            value: metrics.total,
            description: "All registered plans",
            icon: Layers3,
          },
          {
            title: "Published",
            value: metrics.published,
            description: "Available in the business catalogue",
            icon: Send,
          },
          {
            title: "Drafts",
            value: metrics.drafts,
            description: "Awaiting publication",
            icon: Pencil,
          },
          {
            title: "Retired",
            value: metrics.retired,
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

      {/* CONFIGURATION SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2">

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <GlassIcon size="sm">
              <Settings2 size={18} />
            </GlassIcon>

            <div>
              <p className="text-sm font-medium">
                Configured Plans
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Plans with at least one version
              </p>
            </div>

            <div className="ml-auto text-xl font-bold text-teal-400">
              {metrics.configured}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <GlassIcon size="sm">
              <AlertCircle size={18} />
            </GlassIcon>

            <div>
              <p className="text-sm font-medium">
                Unconfigured Plans
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Plans requiring an initial version
              </p>
            </div>

            <div className="ml-auto text-xl font-bold text-amber-400">
              {metrics.unconfigured}
            </div>
          </div>
        </GlassCard>

      </div>

      {/* PLAN TABLE */}

      <GlassCard className="p-5">

        {/* TABLE HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Plan Catalogue
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Manage subscription products, pricing and entitlements.
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
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="RETIRED">Retired</option>
              <option value="ARCHIVED">Archived</option>
            </select>

          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto mt-6">

          <table className="w-full min-w-[1150px] text-left">

            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500">

                <th className="py-4 px-3">Plan</th>

                <th className="py-4 px-3">Price</th>

                <th className="py-4 px-3">Billing Cycle</th>

                <th className="py-4 px-3">Version</th>

                <th className="py-4 px-3">Entitlements</th>

                <th className="py-4 px-3">Status</th>

                <th className="py-4 px-3">Featured</th>

                <th className="py-4 px-3 text-right">Actions</th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={8} className="py-16 text-center">

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
                  <td colSpan={8} className="py-16 text-center">

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

                filteredPlans.map((plan) => {

                  const latestVersion = getLatestVersion(plan);

                  const hasVersion = Boolean(latestVersion);

                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-white/5 hover:bg-white/[0.025]"
                    >

                      {/* PLAN */}

                      <td className="py-5 px-3">

                        <div className="font-semibold">
                          {plan.name}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {plan.code}
                        </div>

                        {plan.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                            {plan.description}
                          </div>
                        )}

                      </td>

                      {/* PRICE */}

                      <td className="py-5 px-3">

                        <div className="font-semibold">
                          {formatPrice(latestVersion)}
                        </div>

                        {!hasVersion && (
                          <span className="text-xs text-amber-400">
                            Version required
                          </span>
                        )}

                      </td>

                      {/* BILLING CYCLE */}

                      <td className="py-5 px-3 text-sm text-gray-400">

                        {formatBillingCycle(latestVersion)}

                      </td>

                      {/* VERSION */}

                      <td className="py-5 px-3">

                        {latestVersion ? (

                          <div>
                            <span className="font-medium text-teal-400">
                              v{latestVersion.planVersion}
                            </span>

                            <p className="text-xs text-gray-500 mt-1">
                              {latestVersion.publishedAt
                                ? "Published version"
                                : "Unpublished version"}
                            </p>
                          </div>

                        ) : (

                          <span className="text-xs text-amber-400">
                            No version
                          </span>

                        )}

                      </td>

                      {/* ENTITLEMENTS */}

                      <td className="py-5 px-3">

                        <VersionSummary
                          version={latestVersion}
                        />

                      </td>

                      {/* STATUS */}

                      <td className="py-5 px-3">

                        <StatusBadge status={plan.status} />

                      </td>

                      {/* FEATURED */}

                      <td className="py-5 px-3">

                        {plan.isFeatured ? (

                          <span className="text-teal-400 text-xs font-medium">
                            Featured
                          </span>

                        ) : (

                          <span className="text-gray-500 text-xs">
                            Standard
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="py-5 px-3">

                        <div className="flex justify-end items-center gap-2">

                          <button
                            title="View plan"
                            onClick={() =>
                              navigate(`/command/billing/plans/${plan.id}`)
                            }
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
                          >
                            <Eye size={17} />
                          </button>

                          {plan.status !== "RETIRED" && (

                              <button
                                title="Edit plan"
                                onClick={() =>
                                  navigate(`/command/billing/plans/${plan.id}/edit`)
                                }
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
                              >
                                <Pencil size={17} />
                              </button>

                            )}

                          {plan.status === "DRAFT" && (

                            <button
                              title={
                                hasVersion
                                  ? "Publish plan"
                                  : "Create a version before publishing"
                              }
                              disabled={
                                processingId === plan.id ||
                                !hasVersion
                              }
                              onClick={() => void handlePublish(plan)}
                              className="p-2 rounded-lg hover:bg-teal-500/10 text-teal-400 disabled:opacity-30 disabled:cursor-not-allowed"
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
                              onClick={() => void handleRetire(plan)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 disabled:opacity-40"
                            >

                              {processingId === plan.id ? (

                                <LoaderCircle
                                  size={17}
                                  className="animate-spin"
                                />

                              ) : (

                                <Archive size={17} />

                              )}

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>
                  );

                })

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        <div className="border-t border-white/10 mt-4 pt-4 flex flex-wrap justify-between gap-3 text-xs text-gray-500">

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
