import { ExecutionContext } from "../KarnelTypes/types";
import { EventMetadata } from "@business/shared-types";

export interface MetadataBuilderContract {
    build(
        context: ExecutionContext
    ): Promise<EventMetadata>;
}