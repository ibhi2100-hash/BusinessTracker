import { EventReplayPanel } from "./components/EventReplayPanel";
import { ProjectionStatusCards } from "./components/ProjectionCards";
import { ReadModelInspector } from "./components/ReadModelInspector";
import { RebuildControlPanel } from "./components/RebuildControlPanel";
import { RebuilderHeader } from "./components/RebuildHeader";
import { RebuildMachine } from "./components/RebuildMachine";
import { RebuildProgress } from "./components/RebuildProgress";
import { RebuilderStat } from "./components/StatsCards";

export function ProjectionRebuilderPage() {

  return (
    <div className="space-y-6">

      <RebuilderHeader />

      <RebuilderStat />

      <RebuildControlPanel />

      <RebuildProgress
        status={status}
        totalEvents={totalEvents}
        processedEvents={processedEvents}
        currentEvent={currentEvent}
        currentConsumer={currentConsumer}
        error={error}
        />

      <RebuildMachine />

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[1.35fr_1fr]
        gap-5
      ">
        <EventReplayPanel />

        <ConsumerActivityPanel />
      </div>

      <ProjectionStatusCards />

      <ReadModelInspector />

      <RebuildLog />

    </div>
  );
}