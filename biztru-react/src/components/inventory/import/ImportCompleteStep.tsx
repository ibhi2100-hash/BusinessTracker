import {
  Check,
  CircleAlert,
  Package,
  Boxes,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";

export interface ImportCompleteStepProps {
  totalOperations: number;
  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;

  onDone: () => void;
  onViewProducts?: () => void;
  onViewInventory?: () => void;

  disabled?: boolean;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

interface ResultCardProps {
  icon: typeof Package;
  label: string;
  value: number;
}

function ResultCard({
  icon: Icon,
  label,
  value,
}: ResultCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 text-white/70" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-white/40">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-semibold text-white">
            {formatNumber(value)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export function ImportCompleteStep({
  totalOperations,
  createdProducts,
  updatedProducts,
  createdStock,
  failedOperations,
  onDone,
  onViewProducts,
  onViewInventory,
  disabled = false,
}: ImportCompleteStepProps) {
  const hasFailures = failedOperations > 0;

  const successfulOperations = Math.max(
    totalOperations - failedOperations,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Result header */}
      <div className="space-y-3 text-center">
        <div
          className={[
            "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border",
            hasFailures
              ? "border-amber-400/20 bg-amber-400/10"
              : "border-emerald-400/20 bg-emerald-400/10",
          ].join(" ")}
        >
          {hasFailures ? (
            <CircleAlert className="h-8 w-8 text-amber-400" />
          ) : (
            <Check className="h-8 w-8 text-emerald-400" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            {hasFailures
              ? "Import completed with errors"
              : "Import completed successfully"}
          </h2>

          <p className="mt-1 text-sm text-white/50">
            {hasFailures
              ? `${formatNumber(successfulOperations)} of ${formatNumber(totalOperations)} operations were completed successfully.`
              : `${formatNumber(totalOperations)} import operations were completed.`}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ResultCard
          icon={Package}
          label="Created"
          value={createdProducts}
        />

        <ResultCard
          icon={RefreshCw}
          label="Updated"
          value={updatedProducts}
        />

        <ResultCard
          icon={Boxes}
          label="Opening stock"
          value={createdStock}
        />

        <ResultCard
          icon={CircleAlert}
          label="Failed"
          value={failedOperations}
        />
      </div>

      {/* Result explanation */}
      <GlassCard className="p-6">
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white">
              What happened
            </h3>

            <p className="mt-1 text-sm leading-6 text-white/50">
              The approved import was processed through the BizTru
              business domain rather than writing directly to the
              local database.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>

              <div>
                <p className="text-sm text-white">
                  Product catalogue processed
                </p>

                <p className="text-xs text-white/40">
                  {formatNumber(createdProducts)} created and{" "}
                  {formatNumber(updatedProducts)} updated.
                </p>
              </div>
            </div>

            {createdStock > 0 && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm text-white">
                    Opening inventory processed
                  </p>

                  <p className="text-xs text-white/40">
                    {formatNumber(createdStock)} stock operations
                    were completed.
                  </p>
                </div>
              </div>
            )}

            {hasFailures && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/10">
                  <CircleAlert className="h-3 w-3 text-amber-400" />
                </div>

                <div>
                  <p className="text-sm text-white">
                    Some operations failed
                  </p>

                  <p className="text-xs leading-5 text-white/40">
                    Failed operations should be inspected and
                    retried through the import result rather than
                    silently discarded.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onViewProducts && (
          <GlassButton
            type="button"
            variant="secondary"
            onClick={onViewProducts}
            disabled={disabled}
          >
            View products
          </GlassButton>
        )}

        {onViewInventory && createdStock > 0 && (
          <GlassButton
            type="button"
            variant="secondary"
            onClick={onViewInventory}
            disabled={disabled}
          >
            View inventory
          </GlassButton>
        )}

        <GlassButton
          type="button"
          onClick={onDone}
          disabled={disabled}
        >
          Done
          <ArrowRight className="h-4 w-4" />
        </GlassButton>
      </div>
    </div>
  );
}