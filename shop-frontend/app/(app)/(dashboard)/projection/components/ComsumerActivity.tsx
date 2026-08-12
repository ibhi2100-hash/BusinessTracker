import { GlassCard } from "@/components/ui/GlassCard"
import { ConsumerActivity } from "../store/ProjectionRebuilderStore";

interface ConsumerActivityPanelProps {
  consumers: ConsumerActivity[];
}

export function ConsumerActivityPanel({
  consumers,
}: ConsumerActivityPanelProps) {
  return (
    <GlassCard className="overflow-hidden">

      <div className="p-5">
        <h3 className="font-semibold text-white">
          Projection Consumers
        </h3>

        <p className="text-xs text-gray-500">
          Consumers processing the current event
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {consumers.map((consumer) => (
          <ConsumerRow
            key={consumer.name}
            consumer={consumer}
          />
        ))}
      </div>

    </GlassCard>
  );
}

interface ConsumerRowProps {
  consumer: ConsumerActivity;
}

function ConsumerRow({
  consumer,
}: ConsumerRowProps) {
  // render consumer.status,
  // consumer.processedEvents,
  // consumer.eventType,
  // consumer.lastDuration,
  // consumer.error
}