import { CommandMetadata } from "./CommandMetadata";
import { EventMetadata } from "@business/shared-types";
export class EventMetadataBuilder {

    build(
        commandMetadata: CommandMetadata,
        logicalClock: number
    ): EventMetadata{

        return Object.freeze({
            ...commandMetadata,
            logicalClock
        });
    }
}