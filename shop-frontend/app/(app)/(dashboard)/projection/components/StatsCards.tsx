import { StatCard } from "../../../../../components/ui/StatCard"
import {
    Database,
    Layers,
    Hash,
    Activity
} from "lucide-react"
export function RebuilderStat(){
     return <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

  <StatCard
    value={totalEvents}
    label="Events in event store"
    icon={<Database size={20} />}
  />

  <StatCard
    value={projectionCount}
    label="Read model projections"
    icon={<Layers size={20} />}
  />

  <StatCard
    value={currentPosition}
    label="Current event position"
    icon={<Hash size={20} />}
  />

  <StatCard
    value={statusLabel}
    label="Rebuild status"
    icon={<Activity size={20} />}
  />

</div>
    
}