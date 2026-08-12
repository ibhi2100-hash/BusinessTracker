"use client";

import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
  Activity,
  AlertCircle,
  Database,
  Layers,
  Radio,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { cn } from "@/lib/utils";

interface Props {
  status: RebuildProgressStatus;

  totalEvents: number;
  processedEvents: number;

  currentEvent?: {
    id: string;
    type: string;
    position: number;
  } | null;

  currentConsumer?: string | null;

  error?: string | null;

  running: boolean;
}

export type RebuildProgressStatus =
  | "IDLE"
  | "RESETTING"
  | "REPLAYING"
  | "COMMITTING"
  | "COMPLETED"
  | "FAILED";

interface RebuildProgressProps {
  status: RebuildProgressStatus;

  totalEvents: number;
  processedEvents: number;

  currentEvent?: {
    id: string;
    type: string;
    position: number;
  } | null;

  currentConsumer?: string | null;

  error?: string | null;
}

export function RebuildProgress({
  status,
  totalEvents,
  processedEvents,
  currentEvent,
  currentConsumer,
  error,
}: RebuildProgressProps) {

  const percentage =
    totalEvents === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (processedEvents / totalEvents) * 100
          )
        );

  const running =
    status === "RESETTING" ||
    status === "REPLAYING" ||
    status === "COMMITTING";

  return (
    <GlassCard
      variant={
        status === "FAILED"
          ? "accent"
          : "elevated"
      }
      className="p-5"
    >

      <div className="space-y-5">

        <RebuildProgressHeader
          status={status}
          percentage={percentage}
        />

        <RebuildProgressBar
          percentage={percentage}
          status={status}
        />

        <RebuildProgressDetails
          status={status}
          totalEvents={totalEvents}
          processedEvents={processedEvents}
          currentEvent={currentEvent}
          currentConsumer={currentConsumer}
          error={error}
          running={running}
        />

      </div>

    </GlassCard>
  );
}

interface Props {
  status: RebuildProgressStatus;
  percentage: number;
}

export function RebuildProgressHeader({
  status,
  percentage,
}: Props) {

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-4">

        <GlassIcon
          size="md"
          variant={config.iconVariant}
        >
          {config.icon}
        </GlassIcon>

        <div>

          <div className="flex items-center gap-2">

            <h3 className="text-lg font-semibold text-white">
              {config.title}
            </h3>

            {status !== "IDLE" && (
              <span
                className={cn(
                  "text-xs font-medium",
                  config.textClass
                )}
              >
                {config.label}
              </span>
            )}

          </div>

          <p className="mt-1 text-sm text-gray-400">
            {config.description}
          </p>

        </div>

      </div>

      <div className="text-right">

        <div className="text-2xl font-bold text-white">
          {percentage}%
        </div>

        <div className="text-xs text-gray-500">
          rebuild progress
        </div>

      </div>

    </div>
  );
}

function getStatusConfig(
  status: RebuildProgressStatus
) {

  switch (status) {

    case "RESETTING":
      return {
        title: "Resetting projections",
        label: "RESETTING",
        description:
          "Clearing materialized read-model state.",
        icon: (
          <RotateCcw
            size={20}
            className="animate-spin"
          />
        ),
        iconVariant: "danger" as const,
        textClass: "text-red-400",
      };

    case "REPLAYING":
      return {
        title: "Replaying event history",
        label: "REPLAYING",
        description:
          "Feeding stored events through projection consumers.",
        icon: (
          <Loader2
            size={20}
            className="animate-spin"
          />
        ),
        iconVariant: "primary" as const,
        textClass: "text-teal-400",
      };

    case "COMMITTING":
      return {
        title: "Committing rebuilt reality",
        label: "COMMITTING",
        description:
          "Finalizing the reconstructed read models.",
        icon: (
          <Loader2
            size={20}
            className="animate-spin"
          />
        ),
        iconVariant: "primary" as const,
        textClass: "text-teal-400",
      };

    case "COMPLETED":
      return {
        title: "Projection rebuild completed",
        label: "COMPLETE",
        description:
          "Read models now represent the event-store reality.",
        icon: <CheckCircle2 size={20} />,
        iconVariant: "success" as const,
        textClass: "text-emerald-400",
      };

    case "FAILED":
      return {
        title: "Projection rebuild failed",
        label: "FAILED",
        description:
          "The rebuild transaction was rolled back.",
        icon: <XCircle size={20} />,
        iconVariant: "danger" as const,
        textClass: "text-red-400",
      };

    case "IDLE":
    default:
      return {
        title: "Projection rebuild ready",
        label: "READY",
        description:
          "The event store is ready to reconstruct read models.",
        icon: <RotateCcw size={20} />,
        iconVariant: "primary" as const,
        textClass: "text-gray-400",
      };
  }
}

interface Props {
  percentage: number;
  status: RebuildProgressStatus;
}

export function RebuildProgressBar({
  percentage,
  status,
}: Props) {

  const completed =
    status === "COMPLETED";

  const failed =
    status === "FAILED";

  return (
    <div className="space-y-2">

      <div
        className="
          relative
          h-3
          w-full
          overflow-hidden
          rounded-full
          border
          border-white/10
          bg-white/[0.04]
        "
      >

        <div
          className={cn(
            `
            absolute
            inset-y-0
            left-0
            rounded-full
            transition-all
            duration-500
            ease-out
            `,

            completed &&
              "bg-emerald-400",

            failed &&
              "bg-red-400",

            !completed &&
              !failed &&
              "bg-teal-400"
          )}
          style={{
            width: `${percentage}%`,
          }}
        />

        {!completed && !failed && percentage > 0 && (
          <div
            className="
              absolute
              inset-y-0
              right-0
              w-20
              animate-pulse
              bg-white/20
              blur-md
            "
          />
        )}

      </div>

      <div className="flex justify-between text-xs">

        <span className="text-gray-500">
          Event store
        </span>

        <span className="text-gray-400">
          Read models
        </span>

      </div>

    </div>
  );
}


export function RebuildProgressDetails({
  status,
  totalEvents,
  processedEvents,
  currentEvent,
  currentConsumer,
  error,
  running,
}: Props) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      <ProgressDetail
        icon={<Database size={16} />}
        label="Events"
        value={`${processedEvents} / ${totalEvents}`}
      />

      <ProgressDetail
        icon={<Radio size={16} />}
        label="Current event"
        value={
          currentEvent
            ? currentEvent.type
            : "Waiting"
        }
      />

      <ProgressDetail
        icon={<Layers size={16} />}
        label="Consumer"
        value={
          currentConsumer ??
          "Waiting"
        }
      />

      {currentEvent && (
        <div className="
          md:col-span-3
          rounded-xl
          border
          border-teal-500/10
          bg-teal-500/[0.04]
          px-4
          py-3
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-4
          ">

            <div className="min-w-0">

              <div className="
                flex
                items-center
                gap-2
                text-xs
                text-gray-500
              ">
                <Activity size={13} />
                PROCESSING EVENT
              </div>

              <div className="
                mt-1
                truncate
                text-sm
                font-medium
                text-white
              ">
                {currentEvent.type}
              </div>

            </div>

            <div className="
              shrink-0
              text-right
            ">

              <div className="text-xs text-gray-500">
                Position
              </div>

              <div className="text-sm font-semibold text-teal-400">
                #{currentEvent.position}
              </div>

            </div>

          </div>

        </div>
      )}

      {error && (
        <div className="
          md:col-span-3
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-red-500/20
          bg-red-500/[0.06]
          px-4
          py-3
        ">

          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>

            <div className="
              text-sm
              font-medium
              text-red-400
            ">
              Rebuild error
            </div>

            <p className="
              mt-1
              text-xs
              text-gray-400
            ">
              {error}
            </p>

          </div>

        </div>
      )}

      {status === "COMPLETED" && (
        <div className="
          md:col-span-3
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-emerald-500/20
          bg-emerald-500/[0.06]
          px-4
          py-3
        ">

          <CheckCircle2
            size={18}
            className="text-emerald-400"
          />

          <span className="
            text-sm
            text-emerald-300
          ">
            All projection read models successfully rebuilt.
          </span>

        </div>
      )}

    </div>
  );
}

interface ProgressDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProgressDetail({
  icon,
  label,
  value,
}: ProgressDetailProps) {

  return (
    <div className="
      flex
      items-center
      gap-3
      rounded-xl
      border
      border-white/5
      bg-white/[0.025]
      px-4
      py-3
    ">

      <div className="text-gray-500">
        {icon}
      </div>

      <div className="min-w-0">

        <div className="
          text-[11px]
          uppercase
          tracking-wide
          text-gray-500
        ">
          {label}
        </div>

        <div className="
          mt-0.5
          truncate
          text-sm
          font-medium
          text-white
        ">
          {value}
        </div>

      </div>

    </div>
  );
}