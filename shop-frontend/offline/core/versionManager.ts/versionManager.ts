import { BaseEvent } from "@business/shared-types";
import { VersionManager } from "@business/events";

export class FrontendVersionManager
    implements VersionManager<BaseEvent>
{
    async prepare(
        events: readonly BaseEvent[],
        currentVersion: number
    ): Promise<BaseEvent[]> {

        let version = currentVersion;

        return events.map(event => ({
            ...event,
            expectedAggregateVersion: ++version
        }));
    }
}