import { GlassCard } from "@/components/ui/GlassCard"

export function ConsumerActivityPanel(){
    return <>
    <GlassCard>

  <div className="mb-4">

    <h3 className="font-semibold text-white">
      Projection Consumers
    </h3>

    <p className="text-xs text-gray-500">
      Consumers processing the current event
    </p>

  </div>

  <div className="space-y-2">

    {consumers.map(consumer => (

      <ConsumerRow
        key={consumer.name}
        consumer={consumer}
      />

    ))}

  </div>

</GlassCard>
    </>
}