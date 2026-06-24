import { migration001 } from "./001_initial";
import { migration002 } from "./002_EventStore";
import { migration003 } from "./003_PendingEvents";
import { migration004 } from "./004_Snapshots";
import { migration005 } from "./005_AggregateVersion";
import { migration006 } from "./006_Conflicts";

export const migrations = [
    migration001,
    migration002,
    migration003,
    migration004,
    migration005,
    migration006
]