// components/RebuildMachine.tsx
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PipelineStage } from "./PipelineStage";
import {
  Database,
  Trash2,
  Play,
  Layers,
  CheckCircle2,
} from "lucide-react";
import type { RebuildProgressStatus } from "./RebuildProgress";
import type { ReplayEvent, ProjectionStatus } from "../store/ProjectionRebuilderStore";

interface RebuildMachineProps {
  status: RebuildProgressStatus;
  currentEvent: ReplayEvent | null;
  currentConsumer: string | null;
  projections: ProjectionStatus[];
}

export function RebuildMachine({
  status,
  currentEvent,
  currentConsumer,
  projections,
}: RebuildMachineProps) {
  const stage = (s: RebuildProgressStatus) => {
    if (status === "FAILED") return "failed";
    if (status === s) return "active";
    if (
      (s === "RESETTING" && ["REPLAYING", "COMMITTING", "COMPLETED"].includes(status)) ||
      (s === "REPLAYING" && ["COMMITTING", "COMPLETED"].includes(status)) ||
      (s === "COMMITTING" && status === "COMPLETED")
    ) {
      return "complete";
    }
    return "idle";
  };

  return (
    <GlassCard variant="accent" className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Rebuild Engine</h2>
        <p className="text-sm text-gray-400">
          Event history → projection state
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PipelineStage
          icon={<Database size={18} />}
          label="Event Store"
          state={stage("REPLAYING")}
          detail={currentEvent ? `#${currentEvent.position}` : undefined}
        />
        <PipelineStage
          icon={<Trash2 size={18} />}
          label="Reset"
          state={stage("RESETTING")}
        />
        <PipelineStage
          icon={<Play size={18} />}
          label="Replay"
          state={stage("REPLAYING")}
          detail={currentConsumer ?? undefined}
        />
        <PipelineStage
          icon={<Layers size={18} />}
          label="Projections"
          state={stage("COMMITTING")}
          detail={`${projections.length} models`}
        />
        <PipelineStage
          icon={<CheckCircle2 size={18} />}
          label="Commit"
          state={status === "COMPLETED" ? "complete" : "idle"}
        />
      </div>
    </GlassCard>
  );
}