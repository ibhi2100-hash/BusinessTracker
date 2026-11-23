
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Pencil,
  Send,
  Archive,
  Layers3,
  ShieldCheck,
  Calendar,
  History,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  Package,
  Clock,
  Star,
  RefreshCw,
  CreditCard,
} from "lucide-react";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassIcon } from "../../../components/ui/GlassIcon";

import { billingPlanApi } from "../../../Biztru/services/platform/billing/billing-plan.api";

import type {
  BillingPlan,
  BillingPlanVersion,
} from "../../../types/billing/billingPlan.types";

import { usePlatformSession } from "../../../Biztru/services/PlatformSession/PlatformSessionContext";

// ============================================================
// HELPERS
// ============================================================

function getLatestVersion(
  versions: BillingPlanVersion[]
): BillingPlanVersion | null {
  if (!versions.length) {
    return null;
  }

  return [...versions].sort(
    (a, b) => b.planVersion - a.planVersion
  )[0];
}

/**
 * Converts minor currency units into a display amount.
 *
 * Uses the currency's standard fraction digits.
 * Invalid or missing currency codes fall back to NGN.
 */
function formatPrice(
  version: BillingPlanVersion | null
): string {
  if (!version) {
    return "No pricing configured";
  }

  const currency =
    typeof version.currency === "string" &&
    /^[A-Za-z]{3}$/.test(version.currency)
      ? version.currency.toUpperCase()
      : "NGN";

  const minorAmount = Number(version.priceMinor);

  if (!Number.isFinite(minorAmount)) {
    return "Invalid price";
  }

  if (minorAmount === 0) {
    return "Free";
  }

  try {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    });

    const fractionDigits =
      formatter.resolvedOptions().maximumFractionDigits;

    const divisor = Math.pow(10, fractionDigits);
    const amount = minorAmount / divisor;

    return formatter.format(amount);
  } catch {
    return `${currency} ${minorAmount.toLocaleString("en-NG")}`;
  }
}

function formatBillingCycle(
  version: BillingPlanVersion | null
): string {
  if (!version) {
    return "Not configured";
  }

  const intervalCount = version.intervalCount ?? 1;

  switch (version.billingCycle) {
    case "MONTHLY":
      return intervalCount === 1
        ? "Monthly"
        : `Every ${intervalCount} months`;

    case "QUARTERLY":
      return intervalCount === 1
        ? "Quarterly"
        : `Every ${intervalCount} quarters`;

    case "YEARLY":
      return intervalCount === 1
        ? "Yearly"
        : `Every ${intervalCount} years`;

    case "LIFETIME":
      return "Lifetime";

    default:
      return version.billingCycle;
  }
}

function formatFeatureName(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        {icon && (
          <GlassIcon size="sm">
            {icon}
          </GlassIcon>
        )}

        <div className="min-w-0">
          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="mt-1 font-semibold text-white break-words">
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function SectionHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <GlassIcon size="md" variant="primary">
        {icon}
      </GlassIcon>

      <div>
        <h2 className="font-semibold text-white">
          {title}
        </h2>

        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BillingPlan["status"];
}) {
  const styles: Record<string, string> = {
    DRAFT:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",

    PUBLISHED:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

    RETIRED:
      "bg-gray-500/10 text-gray-400 border-gray-500/20",

    ARCHIVED:
      "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status] ?? styles.DRAFT
      }`}
    >
      {status}
    </span>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function BillingPlanDetailsPage() {
  const { planId } = useParams();

  const navigate = useNavigate();

  const {
    session,
    isAuthenticated,
  } = usePlatformSession();

  const [plan, setPlan] = useState<BillingPlan | null>(null);

  const [versions, setVersions] = useState<
    BillingPlanVersion[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // LOAD PLAN
  // ----------------------------------------------------------

  const load = useCallback(async () => {
    if (!planId) {
      setError("Billing plan ID is missing.");
      setLoading(false);
      return;
    }

    if (!isAuthenticated || !session?.accessToken) {
      setError("Platform authentication required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [planResult, versionResult] = await Promise.all([
        billingPlanApi.get(
          planId,
          session.accessToken
        ),

        billingPlanApi.versions(
          planId,
          session.accessToken
        ),
      ]);

      setPlan(planResult);

      // The version endpoint provides the complete history.
      // Fall back to versions embedded in the plan response.
      const loadedVersions =
        versionResult?.length
          ? versionResult
          : planResult.versions ?? [];

      setVersions(loadedVersions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load billing plan details."
      );

      setPlan(null);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [
    planId,
    isAuthenticated,
    session?.accessToken,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  // ----------------------------------------------------------
  // LATEST VERSION
  // ----------------------------------------------------------

  const latestVersion = useMemo(
    () => getLatestVersion(versions),
    [versions]
  );

  const enabledFeatures = useMemo(
    () =>
      Object.entries(latestVersion?.features ?? {}).filter(
        ([, enabled]) => enabled === true
      ),
    [latestVersion]
  );

  const disabledFeatures = useMemo(
    () =>
      Object.entries(latestVersion?.features ?? {}).filter(
        ([, enabled]) => enabled !== true
      ),
    [latestVersion]
  );

  // ----------------------------------------------------------
  // PUBLISH PLAN
  // ----------------------------------------------------------

  const publish = async () => {
    if (!plan) return;

    if (!latestVersion) {
      setError(
        "This plan cannot be published because it has no version."
      );
      return;
    }

    if (latestVersion.publishedAt) {
      setError(
        "The latest version has already been published."
      );
      return;
    }

    const confirmed = window.confirm(
      `Publish ${plan.name}, version ${latestVersion.planVersion}?`
    );

    if (!confirmed) return;

    if (!isAuthenticated || !session?.accessToken) {
      setError("Platform authentication required.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await billingPlanApi.publish(
        plan.id,
        session.accessToken
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Plan publication failed."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ----------------------------------------------------------
  // RETIRE PLAN
  // ----------------------------------------------------------

  const retire = async () => {
    if (!plan) return;

    const confirmed = window.confirm(
      `Retire ${plan.name} from new subscriptions? Existing subscriptions will retain their purchased version.`
    );

    if (!confirmed) return;

    if (!isAuthenticated || !session?.accessToken) {
      setError("Platform authentication required.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await billingPlanApi.retire(
        plan.id,
        session.accessToken
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Plan retirement failed."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={32}
            className="animate-spin text-teal-400"
          />

          <p className="text-sm text-gray-500">
            Loading billing plan...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND STATE
  // ==========================================================

  if (!plan) {
    return (
      <GlassCard className="p-10 text-center">
        <GlassIcon
          size="lg"
          variant="danger"
          className="mx-auto"
        >
          <AlertCircle size={28} />
        </GlassIcon>

        <h2 className="mt-5 text-lg font-semibold text-white">
          Plan unavailable
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          {error || "The requested billing plan could not be found."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <GlassButton
            variant="secondary"
            onClick={() => navigate("/platform/billing/plans")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to plans
          </GlassButton>

          <GlassButton onClick={() => void load()}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-7 pb-12">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">

        <div className="min-w-0">

          <button
            type="button"
            onClick={() =>
              navigate("/platform/billing/plans")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-teal-400"
          >
            <ArrowLeft size={16} />
            Back to billing plans
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {plan.name}
            </h1>

            <StatusBadge status={plan.status} />

            {plan.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400">
                <Star size={12} />
                Featured
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-400">
            {plan.code}
            {" · "}
            {latestVersion
              ? `Version ${latestVersion.planVersion}`
              : "No version configured"}
          </p>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            {plan.description ||
              "No description has been provided for this billing plan."}
          </p>
        </div>

        {/* HEADER ACTIONS */}

        <div className="flex flex-wrap items-center gap-2">

          <GlassButton
            variant="secondary"
            onClick={() =>
              navigate(
                `/platform/billing/plans/${plan.id}/edit`
              )
            }
            disabled={
              processing ||
              plan.status === "RETIRED" ||
              plan.status === "ARCHIVED"
            }
          >
            <Pencil size={16} className="mr-2" />
            Edit plan
          </GlassButton>

          {plan.status === "DRAFT" && (
            <GlassButton
              onClick={publish}
              disabled={processing || !latestVersion}
            >
              {processing ? (
                <LoaderCircle
                  size={16}
                  className="mr-2 animate-spin"
                />
              ) : (
                <Send size={16} className="mr-2" />
              )}

              Publish
            </GlassButton>
          )}

          {plan.status === "PUBLISHED" && (
            <GlassButton
              variant="danger"
              onClick={retire}
              disabled={processing}
            >
              {processing ? (
                <LoaderCircle
                  size={16}
                  className="mr-2 animate-spin"
                />
              ) : (
                <Archive size={16} className="mr-2" />
              )}

              Retire
            </GlassButton>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs text-red-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* PRICING OVERVIEW */}
      {/* ================================================== */}

      <GlassCard variant="elevated" className="overflow-hidden p-6 sm:p-8">

        <div className="flex flex-col justify-between gap-6 md:flex-row">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <CreditCard size={15} />
              Current commercial configuration
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {formatPrice(latestVersion)}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {formatBillingCycle(latestVersion)}
            </p>

            {latestVersion && (
              <p className="mt-3 text-xs text-gray-500">
                Version {latestVersion.planVersion}
                {" · "}
                {latestVersion.currency}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <StatusBadge status={plan.status} />

            {latestVersion?.publishedAt ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={15} />
                Version published
              </div>
            ) : latestVersion ? (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <Clock size={15} />
                Version awaiting publication
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                No pricing version available
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {!latestVersion && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
          This plan does not have a commercial version yet.
          Create a version before publishing it.
        </div>
      )}

      {/* ================================================== */}
      {/* COMMERCIAL CONFIGURATION */}
      {/* ================================================== */}

      <section className="space-y-4">

        <SectionHeading
          title="Commercial Configuration"
          description="Pricing and subscription terms for the latest version."
          icon={<CreditCard size={19} />}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DetailItem
            label="Price"
            value={formatPrice(latestVersion)}
            icon={<CreditCard size={17} />}
          />

          <DetailItem
            label="Currency"
            value={latestVersion?.currency ?? "Not configured"}
            icon={<CreditCard size={17} />}
          />

          <DetailItem
            label="Billing Cycle"
            value={formatBillingCycle(latestVersion)}
            icon={<Calendar size={17} />}
          />

          <DetailItem
            label="Free Trial"
            value={
              latestVersion
                ? `${latestVersion.trialDays} days`
                : "Not configured"
            }
            icon={<Clock size={17} />}
          />

          <DetailItem
            label="Interval Count"
            value={latestVersion?.intervalCount ?? "Not configured"}
            icon={<RefreshCw size={17} />}
          />

          <DetailItem
            label="Display Order"
            value={plan.displayOrder}
            icon={<Layers3 size={17} />}
          />

          <DetailItem
            label="Plan Version"
            value={
              latestVersion
                ? `Version ${latestVersion.planVersion}`
                : "No version"
            }
            icon={<History size={17} />}
          />

          <DetailItem
            label="Total Versions"
            value={versions.length}
            icon={<Layers3 size={17} />}
          />

        </div>
      </section>

      {/* ================================================== */}
      {/* RESOURCE LIMITS */}
      {/* ================================================== */}

      <section className="space-y-4">

        <SectionHeading
          title="Resource Limits"
          description="Maximum resources available under this plan version."
          icon={<Layers3 size={19} />}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <DetailItem
            label="Maximum Staff"
            value={
              latestVersion?.maxStaff ?? "Not configured"
            }
            icon={<Users size={18} />}
          />

          <DetailItem
            label="Maximum Branches"
            value={
              latestVersion?.maxBranch ?? "Not configured"
            }
            icon={<Building2 size={18} />}
          />

          <DetailItem
            label="Maximum Products"
            value={
              latestVersion?.maxProduct ?? "Not configured"
            }
            icon={<Package size={18} />}
          />

        </div>

        <p className="text-xs text-gray-500">
          A limit of zero is displayed as zero, not unlimited.
          Unlimited resources should be represented explicitly
          in your entitlement model if you intend to support them.
        </p>
      </section>

      {/* ================================================== */}
      {/* FEATURE ENTITLEMENTS */}
      {/* ================================================== */}

      <GlassCard className="p-6">

        <SectionHeading
          title="Feature Entitlements"
          description="Features enabled or disabled in the latest version."
          icon={<ShieldCheck size={20} />}
        />

        {!latestVersion ? (
          <p className="mt-6 text-sm text-gray-500">
            No feature configuration is available.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

              {enabledFeatures.map(([key]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-400"
                    />

                    <span className="text-sm text-gray-200">
                      {formatFeatureName(key)}
                    </span>
                  </div>

                  <span className="text-xs text-emerald-400">
                    Enabled
                  </span>
                </div>
              ))}

              {disabledFeatures.map(([key]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <XCircle
                      size={17}
                      className="shrink-0 text-gray-500"
                    />

                    <span className="text-sm text-gray-400">
                      {formatFeatureName(key)}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
                    Disabled
                  </span>
                </div>
              ))}

            </div>

            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-5 text-xs text-gray-500">
              <span>
                {enabledFeatures.length} enabled
              </span>

              <span>
                {disabledFeatures.length} disabled
              </span>

              <span>
                {enabledFeatures.length + disabledFeatures.length} total features
              </span>
            </div>
          </>
        )}
      </GlassCard>

      {/* ================================================== */}
      {/* VERSION HISTORY */}
      {/* ================================================== */}

      <GlassCard className="p-6">

        <SectionHeading
          title="Version History"
          description="Historical commercial configurations of this plan."
          icon={<History size={20} />}
        />

        {versions.length === 0 ? (
          <div className="py-10 text-center">
            <Layers3
              size={30}
              className="mx-auto text-gray-600"
            />

            <p className="mt-4 text-sm font-medium text-gray-400">
              No version history available
            </p>

            <p className="mt-2 text-xs text-gray-500">
              This plan has not had a commercial version created yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-0">

            {[...versions]
              .sort(
                (a, b) => b.planVersion - a.planVersion
              )
              .map((version, index) => {

                const isLatest =
                  version.planVersion ===
                  latestVersion?.planVersion;

                return (
                  <div
                    key={version.id}
                    className="relative flex gap-4 border-b border-white/10 py-5 last:border-0"
                  >
                    <div className="flex flex-col items-center">
                      <GlassIcon
                        size="md"
                        variant={
                          isLatest
                            ? "primary"
                            : "default"
                        }
                      >
                        <Layers3 size={18} />
                      </GlassIcon>

                      {index !== versions.length - 1 && (
                        <div className="mt-2 h-full w-px bg-white/10" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">
                          Version {version.planVersion}
                        </h3>

                        {isLatest && (
                          <span className="rounded-full bg-teal-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-teal-400">
                            Latest
                          </span>
                        )}

                        {version.publishedAt ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">
                            Published
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-400">
                            Draft
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-400">
                        {formatPrice(version)}
                        {" · "}
                        {formatBillingCycle(version)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          Created {formatDate(version.createdAt)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users size={13} />
                          {version.maxStaff} staff
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Building2 size={13} />
                          {version.maxBranch} branches
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Package size={13} />
                          {version.maxProduct} products
                        </span>

                      </div>

                      {version.publishedAt && (
                        <p className="mt-2 text-xs text-emerald-400/80">
                          Published {formatDate(version.publishedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

          </div>
        )}
      </GlassCard>

      {/* ================================================== */}
      {/* PLAN METADATA */}
      {/* ================================================== */}

      <section className="space-y-4">

        <SectionHeading
          title="Plan Information"
          description="Administrative information about this billing plan."
          icon={<Layers3 size={19} />}
        />

        <div className="grid gap-4 sm:grid-cols-2">

          <DetailItem
            label="Plan Code"
            value={plan.code}
            icon={<Layers3 size={17} />}
          />

          <DetailItem
            label="Created"
            value={formatDate(plan.createdAt)}
            icon={<Calendar size={17} />}
          />

          <DetailItem
            label="Last Updated"
            value={formatDate(plan.updatedAt)}
            icon={<Clock size={17} />}
          />

          <DetailItem
            label="Plan ID"
            value={plan.id}
            icon={<ShieldCheck size={17} />}
          />

        </div>
      </section>

    </div>
  );
}
