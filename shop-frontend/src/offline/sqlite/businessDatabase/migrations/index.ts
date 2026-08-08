import { migration001 } from "./001_initial";
import { migration002 } from "./002_EventStore";
import { migration003 } from "./003_Snapshots";
import { migration004 } from "./004_AggregateVersion";
import { migration005 } from "./005_Conflicts";
import { migration006 } from "./006_Business";
import { migration007 } from "./007_Branch";
import { migration008 } from "./008_Products";
import { migration009 } from "./009_Inventory";
import { migration010 } from "./010_Ledger";
import { migration011 } from "./011_CheckPoint";
import { migration012 } from "./012_Outbox";
import { migration0013 } from "./0013_logicClock";
import { migration016 } from "./016_Sales";


export const migrations = [
    migration001,
    migration002,
    migration003,
    migration004,
    migration005,
    migration006,
    migration007,
    migration008,
    migration009,
    migration010,
    migration011,
    migration012,
    migration0013,
    migration016
]