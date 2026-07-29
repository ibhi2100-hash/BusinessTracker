import { IntegrationEvent } from "@business/shared-types";
import { IgnorableStackFrame } from "next/dist/next-devtools/server/shared";
export interface EventRepository {

    append(
        events: readonly IntegrationEvent[]
    ): Promise<void>;

}