// src/ingestion/products/ui/ImportProgressStep.tsx

import {
  Check,
  CircleAlert,
  CircleDot,
  Package,
  RefreshCw,
  Boxes,
  Database,
} from "lucide-react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";

export type ImportProgressPhase =
  | "PREPARING"
  | "CREATING_PRODUCTS"
  | "CREATING_STOCK"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED";

export interface ImportProgressStepProps {
  phase: ImportProgressPhase;

  totalOperations: number;
  completedOperations: number;

  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;

  errorMessage?: string | null;

  onRetry?: () => void;
  onContinue?: () => void;

  disabled?: boolean;
}

type StageState = "pending" | "active" | "completed" | "error";

interface Stage {
  id:
    | "PREPARING"
    | "CREATING_PRODUCTS"
    | "CREATING_STOCK"
    | "FINALIZING";

  title: string;
  description: string;
  icon: typeof Package;
}

const stages: Stage[] = [
  {
    id: "PREPARING",
    title: "Preparing import",
    description: "Preparing approved product operations.",
    icon: RefreshCw,
  },
  {
    id: "CREATING_PRODUCTS",
    title: "Processing products",
    description: "Creating or updating products through the domain.",
    icon: Package,
  },
  {
    id: "CREATING_STOCK",
    title: "Creating opening stock",
    description: "Applying opening quantities to inventory.",
    icon: Boxes,
  },
  {
    id: "FINALIZING",
    title: "Finalizing",
    description: "Completing local projections and import state.",
    icon: Database,
  },
];

const phaseOrder: Record<
  "PREPARING" | "CREATING_PRODUCTS" | "CREATING_STOCK" | "FINALIZING",
  number
> = {
  PREPARING: 0,
  CREATING_PRODUCTS: 1,
  CREATING_STOCK: 2,
  FINALIZING: 3,
};

function getStageState(
  stage: Stage["id"],
  phase: ImportProgressPhase,
): StageState {
  if (phase === "FAILED") {
    const currentIndex =
      phase === "FAILED"
        ? -1
        : phaseOrder[phase];

    if (currentIndex === -1) {
      return "error";
    }

    return "error";
  }

  if (phase === "COMPLETED") {
    return "completed";
  }

  const stageIndex = phaseOrder[stage];
  const currentIndex = phaseOrder[phase];

  if (stageIndex < currentIndex) {
    return "completed";
  }

  if (stageIndex === currentIndex) {
    return "active";
  }

  return "pending";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function ImportProgressStep({
  phase,
  totalOperations,
  completedOperations,
  createdProducts,
  updatedProducts,
  createdStock,
  failedOperations,
  errorMessage,
  onRetry,
  onContinue,
  disabled = false,
}: ImportProgressStepProps) {
  const safeTotal = Math.max(totalOperations, 0);

  const safeCompleted = Math.min(
    Math.max(completedOperations, 0),
    safeTotal,
  );

  const progress =
    safeTotal === 0
      ? phase === "COMPLETED"
        ? 100
        : 0
      : Math.round((safeCompleted / safeTotal) * 100);

  const isFailed = phase === "FAILED";
  const isCompleted = phase === "COMPLETED";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          {isFailed ? (
            <CircleAlert className="h-7 w-7 text-red-400" />
          ) : isCompleted ? (
            <Check className="h-7 w-7 text-emerald-400" />
          ) : (
            <RefreshCw className="h-7 w-7 animate-spin text-white/80" />
          )}
        </div>

        <h2 className="text-xl font-semibold text-white">
          {isFailed
            ? "Import failed"
            : isCompleted
              ? "Import completed"
              : "Importing products"}
        </h2>

        <p className="text-sm text-white/50">
          {isFailed
            ? "The import could not be completed."
            : isCompleted
              ? "The approved catalogue has been processed."
              : "BizTru is processing the approved operations through the business domain."}
        </p>
      </div>

      {/* Main progress */}
      <GlassCard className="p-6">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/70">
                Overall progress
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {progress}%
              </p>
            </div>

            <div className="text-right text-sm text-white/50">
              <p>
                {formatNumber(safeCompleted)} of{" "}
                {formatNumber(safeTotal)}
              </p>

              <p>operations processed</p>
            </div>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Product import progress"
          >
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Processing stages */}
      <GlassCard className="overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">
            Processing stages
          </h3>

          <p className="mt-1 text-xs text-white/40">
            Each stage represents an actual part of the import pipeline.
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {stages.map((stage) => {
            const state = getStageState(stage.id, phase);
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  {state === "completed" ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : state === "error" ? (
                    <CircleAlert className="h-5 w-5 text-red-400" />
                  ) : state === "active" ? (
                    <Icon className="h-5 w-5 animate-pulse text-white" />
                  ) : (
                    <CircleDot className="h-5 w-5 text-white/25" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "text-sm font-medium",
                      state === "pending"
                        ? "text-white/35"
                        : "text-white",
                    ].join(" ")}
                  >
                    {stage.title}
                  </p>

                  <p
                    className={[
                      "mt-0.5 text-xs",
                      state === "pending"
                        ? "text-white/20"
                        : "text-white/40",
                    ].join(" ")}
                  >
                    {stage.description}
                  </p>
                </div>

                <div className="shrink-0 text-xs">
                  {state === "completed" && (
                    <span className="text-emerald-400">
                      Complete
                    </span>
                  )}

                  {state === "active" && (
                    <span className="text-white/70">
                      Processing
                    </span>
                  )}

                  {state === "pending" && (
                    <span className="text-white/25">
                      Pending
                    </span>
                  )}

                  {state === "error" && (
                    <span className="text-red-400">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <GlassCard className="p-4">
          <p className="text-xs text-white/40">
            Created
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatNumber(createdProducts)}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-white/40">
            Updated
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatNumber(updatedProducts)}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-white/40">
            Opening stock
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {formatNumber(createdStock)}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-white/40">
            Failed
          </p>

          <p
            className={[
              "mt-1 text-xl font-semibold",
              failedOperations > 0
                ? "text-red-400"
                : "text-white",
            ].join(" ")}
          >
            {formatNumber(failedOperations)}
          </p>
        </GlassCard>
      </div>

      {/* Failure */}
      {isFailed && (
        <GlassCard className="border-red-400/20 p-5">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                Import could not be completed
              </p>

              <p className="mt-1 text-sm leading-6 text-white/50">
                {errorMessage ||
                  "An unexpected error occurred while processing the import."}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Completed */}
      {isCompleted && (
        <GlassCard className="border-emerald-400/20 p-5">
          <div className="flex gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

            <div>
              <p className="text-sm font-medium text-white">
                Catalogue import completed successfully
              </p>

              <p className="mt-1 text-sm leading-6 text-white/50">
                Products and opening inventory have been processed
                through the business domain.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Actions */}
      {(isFailed || isCompleted) && (
        <div className="flex justify-end gap-3">
          {isFailed && onRetry && (
            <GlassButton
              type="button"
              variant="secondary"
              onClick={onRetry}
              disabled={disabled}
            >
              Try again
            </GlassButton>
          )}

          {isCompleted && onContinue && (
            <GlassButton
              type="button"
              onClick={onContinue}
              disabled={disabled}
            >
              Continue
            </GlassButton>
          )}
        </div>
      )}
    </div>
  );
}