import { BaseEvent } from "@business/shared-types";

import { SyncApi } from "../contracts/syncApi";
import { MergeStrategy } from "../strategies/MergeStrategy";

import { SyncConflict } from "../types/SyncConflict";
import { ResolutionType } from "../contracts/ConflictResolution";
import { ConflictResolution } from "../contracts/ConflictResolution";

export class ConflictResolver {

  constructor(

    private api: SyncApi,

    private strategies:
      Map<string, MergeStrategy>

  ) {}
  async resolve(

    conflict: SyncConflict,

    pending: BaseEvent[]

): Promise<ConflictResolution> {

    const strategy =
        this.strategies.get(
            conflict.aggregateType
        );

    if (!strategy) {

        return {

            type:
              ResolutionType.MANUAL,

            events: [],

            reason:
              "No merge strategy registered."

        };

    }

    const latest =
        await this.api.getAggregateState(

            conflict.aggregateId,

            conflict.aggregateType

        );

    if (!latest) {

        return {

            type:
                ResolutionType.REJECTED,

            events: [],

            reason:
                "Aggregate no longer exists."

        };

    }

    const serverEvents =
        await this.api.getEventsSince(

            latest.lastGlobalPosition

        );

    return strategy.resolve(

        conflict,

        serverEvents,

        pending

    );

}
}