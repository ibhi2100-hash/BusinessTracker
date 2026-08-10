"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  Loader2,
  RotateCcw,
  Terminal,
  XCircle,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { cn } from "@/lib/utils";

export type RebuildLogLevel =
  | "INFO"
  | "SUCCESS"
  | "PROCESSING"
  | "WARNING"
  | "ERROR";

export type RebuildLogSource =
  | "SYSTEM"
  | "EVENT_STORE"
  | "RESETTER"
  | "REBUILDER"
  | "CONSUMER"
  | "PROJECTION"
  | "TRANSACTION";

export interface RebuildLogEntry {
  id: string;

  timestamp: number;

  level: RebuildLogLevel;

  source: RebuildLogSource;

  message: string;

  eventId?: string;

  eventType?: string;

  consumer?: string;

  position?: number;

  duration?: number;
}

interface RebuildLogProps {
  entries: readonly RebuildLogEntry[];

  maxHeight?: string;

  onClear?: () => void;
}

export function RebuildLog({
  entries,
  maxHeight = "420px",
  onClear,
}: RebuildLogProps) {

  return (
    <GlassCard
      variant="default"
      className="overflow-hidden"
    >

      <RebuildLogHeader
        count={entries.length}
        onClear={onClear}
      />

      <div
        className="overflow-y-auto"
        style={{
          maxHeight,
        }}
      >

        {entries.length === 0 ? (

          <RebuildLogEmpty />

        ) : (

          <div className="divide-y divide-white/5">

            {entries.map(entry => (

              <RebuildLogEntry
                key={entry.id}
                entry={entry}
              />

            ))}

          </div>

        )}

      </div>

    </GlassCard>
  );
}

"use client";

import {
  Activity,
  Trash2,
} from "lucide-react";

import { GlassButton } from "@/components/ui/GlassButton";

interface Props {
  count: number;
  onClear?: () => void;
}

export function RebuildLogHeader({
  count,
  onClear,
}: Props) {

  return (
    <div className="
      flex
      items-center
      justify-between
      gap-4
      border-b
      border-white/10
      px-5
      py-4
    ">

      <div className="flex items-center gap-3">

        <div className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-white/[0.04]
          text-gray-400
        ">
          <Activity size={17} />
        </div>

        <div>

          <div className="
            flex
            items-center
            gap-2
          ">

            <h3 className="
              text-sm
              font-semibold
              text-white
            ">
              Rebuild Log
            </h3>

            <span className="
              rounded-lg
              bg-white/[0.05]
              px-2
              py-0.5
              text-[10px]
              font-medium
              text-gray-400
            ">
              {count}
            </span>

          </div>

          <p className="
            mt-0.5
            text-xs
            text-gray-500
          ">
            Local projection reconstruction trace
          </p>

        </div>

      </div>

      {onClear && count > 0 && (

        <GlassButton
          variant="tertiary"
          icon={<Trash2 size={14} />}
          onClick={onClear}
          className="
            px-3
            py-2
            text-xs
          "
        >
          Clear
        </GlassButton>

      )}

    </div>
  );
}

"use client";

import {
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  Loader2,
  RotateCcw,
  Terminal,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  RebuildLogEntry as LogEntry,
} from "./RebuildLog";

interface Props {
  entry: LogEntry;
}

export function RebuildLogEntry({
  entry,
}: Props) {

  const config = getLogConfig(entry);

  return (
    <div className="
      flex
      gap-3
      px-5
      py-3
      transition-colors
      hover:bg-white/[0.025]
    ">

      {/* Timeline */}

      <div className="
        flex
        w-8
        shrink-0
        flex-col
        items-center
      ">

        <div
          className={cn(
            `
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-xl
            `,
            config.iconBackground
          )}
        >
          {config.icon}
        </div>

        <div className="
          mt-2
          w-px
          flex-1
          bg-white/5
        " />

      </div>

      {/* Entry */}

      <div className="
        min-w-0
        flex-1
        pb-2
      ">

        <div className="
          flex
          flex-wrap
          items-center
          gap-x-2
          gap-y-1
        ">

          <span className="
            text-[11px]
            font-medium
            text-gray-500
          ">
            {formatTime(entry.timestamp)}
          </span>

          <span
            className={cn(
              `
              rounded-md
              px-1.5
              py-0.5
              text-[9px]
              font-semibold
              tracking-wide
              `,
              config.badge
            )}
          >
            {entry.source}
          </span>

          <span
            className={cn(
              "text-[10px] font-medium",
              config.levelText
            )}
          >
            {entry.level}
          </span>

        </div>

        <div className="
          mt-1
          text-sm
          text-gray-300
        ">
          {entry.message}
        </div>

        {(entry.eventType ||
          entry.eventId ||
          entry.consumer ||
          entry.position !== undefined) && (

          <div className="
            mt-2
            flex
            flex-wrap
            gap-2
          ">

            {entry.position !== undefined && (

              <LogMetadata>
                #{entry.position}
              </LogMetadata>

            )}

            {entry.eventType && (

              <LogMetadata>
                {entry.eventType}
              </LogMetadata>

            )}

            {entry.consumer && (

              <LogMetadata>
                {entry.consumer}
              </LogMetadata>

            )}

            {entry.eventId && (

              <LogMetadata>
                {entry.eventId}
              </LogMetadata>

            )}

            {entry.duration !== undefined && (

              <LogMetadata>
                {entry.duration}ms
              </LogMetadata>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

function LogMetadata({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <span className="
      max-w-full
      truncate
      rounded-lg
      border
      border-white/5
      bg-white/[0.025]
      px-2
      py-1
      text-[10px]
      text-gray-500
    ">
      {children}
    </span>
  );
}

function formatTime(timestamp: number) {

  return new Date(timestamp)
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
}

function getLogConfig(
  entry: LogEntry
) {

  switch (entry.level) {

    case "SUCCESS":

      return {
        icon: (
          <CheckCircle2
            size={15}
            className="text-emerald-400"
          />
        ),

        iconBackground:
          "bg-emerald-500/10",

        badge:
          "bg-emerald-500/10 text-emerald-400",

        levelText:
          "text-emerald-400",
      };

    case "PROCESSING":

      return {
        icon: (
          <Loader2
            size={15}
            className="
              animate-spin
              text-teal-400
            "
          />
        ),

        iconBackground:
          "bg-teal-500/10",

        badge:
          "bg-teal-500/10 text-teal-400",

        levelText:
          "text-teal-400",
      };

    case "WARNING":

      return {
        icon: (
          <AlertCircle
            size={15}
            className="text-yellow-400"
          />
        ),

        iconBackground:
          "bg-yellow-500/10",

        badge:
          "bg-yellow-500/10 text-yellow-400",

        levelText:
          "text-yellow-400",
      };

    case "ERROR":

      return {
        icon: (
          <XCircle
            size={15}
            className="text-red-400"
          />
        ),

        iconBackground:
          "bg-red-500/10",

        badge:
          "bg-red-500/10 text-red-400",

        levelText:
          "text-red-400",
      };

    case "INFO":
    default:

      return {
        icon: (
          <Terminal
            size={15}
            className="text-gray-400"
          />
        ),

        iconBackground:
          "bg-white/[0.05]",

        badge:
          "bg-white/[0.05] text-gray-400",

        levelText:
          "text-gray-500",
      };
  }
}

function RebuildLogEmpty() {

  return (
    <div className="
      flex
      min-h-[180px]
      flex-col
      items-center
      justify-center
      px-5
      text-center
    ">

      <GlassIcon
        size="md"
        variant="primary"
      >
        <Terminal size={20} />
      </GlassIcon>

      <p className="
        mt-3
        text-sm
        font-medium
        text-gray-300
      ">
        No rebuild activity
      </p>

      <p className="
        mt-1
        max-w-sm
        text-xs
        text-gray-500
      ">
        Start a projection rebuild to see the
        execution trace here.
      </p>

    </div>
  );
}