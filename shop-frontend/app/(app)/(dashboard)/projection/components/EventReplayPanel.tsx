import { GlassCard } from "@/components/ui/GlassCard";
import { ReplayEvent } from "../store/ProjectionRebuilderStore";
import { RebuildEventView } from "./RebuildStatus";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

interface EventReplayPanelProps {
  events: ReplayEvent[];
  processed: number;
  total: number;
}

export function EventReplayPanel({
  events,
  processed,
  total,
}: EventReplayPanelProps) {
  return (
    <GlassCard className="overflow-hidden">

      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="font-semibold text-white">
            Event Replay
          </h3>

          <p className="text-xs text-gray-500">
            Immutable events being fed into projections
          </p>
        </div>

        <span className="text-sm text-gray-400">
          {processed} / {total}
        </span>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {events.map((event) => (
          <ReplayEventRow
            key={event.id}
            event={event}
          />
        ))}
      </div>

    </GlassCard>
  );
}
function ReplayEventRow({
  event,
}: {
  event: ReplayEvent;
}) {

  const icon =
    event.status === "COMPLETED"
      ? <CheckCircle2 size={16} />
      : event.status === "PROCESSING"
        ? <Loader2 size={16} className="animate-spin" />
        : event.status === "FAILED"
          ? <XCircle size={16} />
          : <Circle size={16} />;

  return (
    <div className="
      flex
      items-center
      gap-3
      rounded-xl
      border
      border-white/5
      bg-white/[0.025]
      px-3
      py-3
    ">

      <div className="shrink-0">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <span className="text-xs text-gray-500">
            #{event.position}
          </span>

          <span className="text-sm font-medium text-white">
            {event.type}
          </span>

        </div>

        <div className="mt-0.5 truncate text-xs text-gray-500">
          {event.id}
        </div>

      </div>

    </div>
  );
}