import { CanonicalEvent } from "@business/shared-types";
import { VersionManager } from "@business/events";

export class BackendVersionManager
    implements VersionManager<CanonicalEvent>
{
    async prepare(
        events: readonly CanonicalEvent[],
        currentVersion: number
    ): Promise<CanonicalEvent[]> {

        let expected = currentVersion;

        for (const event of events) {

            expected++;

            if (event.aggregateVersion !== expected) {
                throw new Error(
                    `VERSION_CONFLICT expected ${expected} received ${event.aggregateVersion}`
                );
            }
        }

        return [...events];
    }
}