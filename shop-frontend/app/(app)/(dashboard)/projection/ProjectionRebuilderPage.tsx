// ProjectionRebuilderPage.tsx
"use client";

import { useRebuilderStore } from "./store/ProjectionRebuilderStore";
import { EventReplayPanel } from "./components/EventReplayPanel";
import { ConsumerActivityPanel } from "./components/ComsumerActivity";
import { ProjectionStatusCards } from "./components/ProjectionCards";
import { ReadModelInspector } from "./components/ReadModelInspector";
import { RebuildControlPanel } from "./components/RebuildControlPanel";
import { RebuilderHeader } from "./components/RebuildHeader";
import { RebuildMachine } from "./components/RebuildMachine";
import { RebuildProgress } from "./components/RebuildProgress";
import { RebuilderStat } from "./components/StatsCards";
import { RebuildLog } from "./components/RebuildLog";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export function ProjectionRebuilderPage() {
  const status           = useRebuilderStore((s) => s.status);
  const totalEvents      = useRebuilderStore((s) => s.totalEvents);
  const processedEvents  = useRebuilderStore((s) => s.processedEvents);
  const currentEvent     = useRebuilderStore((s) => s.currentEvent);
  const currentConsumer  = useRebuilderStore((s) => s.currentConsumer);
  const error            = useRebuilderStore((s) => s.error);
  const events           = useRebuilderStore((s) => s.events);
  const consumers        = useRebuilderStore((s) => s.consumers);
  const projections      = useRebuilderStore((s) => s.projections);
  const logs             = useRebuilderStore((s) => s.logs);
  const clearLogs        = useRebuilderStore((s) => s.clearLogs);
  const reset            = useRebuilderStore((s) => s.reset);

  const isRunning =
    status === "RESETTING" ||
    status === "REPLAYING" ||
    status === "COMMITTING";
  
  const app = useApplication()

  // ── This is the real trigger ────────────────────────────────
  const handleStartRebuild = async () => {
    try {
      // The observer will drive the store (start, progress, complete/fail)
      await app.rebuild.rebuildCurrent({
        fromLogicalClock: 0,
        batchSize: 200,
      });
    } catch (err) {
      // Observer already called fail() → store is updated
      console.error("Rebuild failed", err);
    }
  };

  return (
    <div className="space-y-5">
      <RebuilderHeader />

      <RebuilderStat
        totalEvents={totalEvents}
        projectionCount={projections.length}
        currentPosition={currentEvent?.position ?? 0}
        statusLabel={status}
      />

      <RebuildControlPanel
        status={status}
        isRunning={isRunning}
        onStart={handleStartRebuild}
        onReset={reset}
      />

      <RebuildProgress
        status={status}
        totalEvents={totalEvents}
        processedEvents={processedEvents}
        currentEvent={currentEvent}
        currentConsumer={currentConsumer}
        error={error}
      />

      <RebuildMachine
        status={status}
        currentEvent={currentEvent}
        currentConsumer={currentConsumer}
        projections={projections}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5">
        <EventReplayPanel
          events={events}
          processed={processedEvents}
          total={totalEvents}
        />
        <ConsumerActivityPanel consumers={consumers} />
      </div>

      <ProjectionStatusCards projections={projections} />

      <ReadModelInspector />

      <RebuildLog entries={logs} onClear={clearLogs} />
    </div>
  );
}