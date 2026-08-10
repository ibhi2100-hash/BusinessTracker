import { GlassCard } from "@/components/ui/GlassCard";
import { PipelineStage } from "./PipelineStage";

export function RebuildMachine(){
    return <>
    <GlassCard variant="accent">

  <div className="flex items-center justify-between mb-6">

    <div>
      <h2 className="text-lg font-semibold text-white">
        Rebuild Engine
      </h2>

      <p className="text-sm text-gray-400">
        Event history → projection state
      </p>
    </div>

    <RebuildStatusBadge />

  </div>

  <RebuildPipeline />

</GlassCard>

<PipelineStage
  icon={<Database />}
  label="Event Store"
  state={eventStoreState}
/>

<PipelineConnector />

<PipelineStage
  icon={<Trash2 />}
  label="Reset"
  state={resetState}
/>

<PipelineConnector />

<PipelineStage
  icon={<Play />}
  label="Replay"
  state={replayState}
/>

<PipelineConnector />

<PipelineStage
  icon={<Layers />}
  label="Projections"
  state={projectionState}
/>

<PipelineConnector />

<PipelineStage
  icon={<CheckCircle2 />}
  label="Commit"
  state={commitState}
/>
<div className="
  grid
  grid-cols-1
  xl:grid-cols-[1.35fr_1fr]
  gap-5
">
  <EventReplayPanel />

  <ConsumerActivityPanel />
</div>

    </>
}