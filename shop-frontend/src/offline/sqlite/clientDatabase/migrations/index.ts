import { migration0001 } from "./0001_device";
import { migration0002 } from "./0002_users";
import { migration0003 } from "./0003_sessions";
import { migration0004 } from "./0004_settings";
import { migration0005 } from "./0005_known_nodes";
import { migration0006 } from "./0006_feature_flags";
import { migration0007 } from "./0007_sync_metadata";

export const migrations = [
    migration0001,
    migration0002,
    migration0003,
    migration0004,
    migration0005,
    migration0006,
    migration0007,
]