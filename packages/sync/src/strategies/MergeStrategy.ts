import { BaseEvent } from "@business/shared-types";
import { SyncConflict } from "../types/SyncConflict";
import { ConflictResolution } from "../contracts/ConflictResolution";

export interface MergeStrategy {

    aggregateType: string;

    resolve(

        conflict: SyncConflict,

        serverEvents: BaseEvent[],

        localEvents: BaseEvent[]

    ): Promise<ConflictResolution>;

}