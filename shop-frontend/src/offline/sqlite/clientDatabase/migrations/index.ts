import { migration0001 } from "./0001_device";
import { migration0002 } from "./0002_users";
import { migration0003 } from "./0003_sessions";
import { migration0004 } from "./0004_settings";
import { migration0005 } from "./0005_known_nodes";
import { migration0006 } from "./0006_feature_flags";
import { migration0007 } from "./0007_sync_metadata";
import { migration0008 } from "./0008_activeBranch";
import { migration0009 } from "./0009_currentBusiness";
import { migration0010 } from "./0010_currentBusiness";
import { Migration } from "./migrationContracts";

export const migrations: Migration[] = [
    migration0001,
    migration0002,
    migration0003,
    migration0004,
    migration0005,
    migration0006,
    migration0007,
    migration0008,
    migration0009,
    migration0010,
    
]