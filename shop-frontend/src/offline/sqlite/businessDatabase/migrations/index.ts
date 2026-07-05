import { migration001 } from "./001_initial";
import { migration002 } from "./002_EventStore";
import { migration004 } from "./004_Snapshots";
import { migration005 } from "./005_AggregateVersion";
import { migration006 } from "./006_Conflicts";
import { migration007 } from "./007_Business";
import { migration008 } from "./008_Branch";
import { migration009 } from "./009_Products";
import { migration010 } from "./010_Inventory";
import { migration012 } from "./012_CheckPoint";
import { migration013 } from "./013_Outbox";


export const migrations = [
    migration001,
    migration002,
    migration004,
    migration005,
    migration006,
    migration007,
    migration008,
    migration009,
    migration010,
    migration012,
    migration013,
]