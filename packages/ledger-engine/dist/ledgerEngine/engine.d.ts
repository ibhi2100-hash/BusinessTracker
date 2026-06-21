import { IntegrationEvent } from "@business/shared-types";
import { LedgerEngineContext } from "./LedgerEngine";
export declare class LedgerEngine {
    private readonly ctx;
    constructor(ctx: LedgerEngineContext);
    process(event: IntegrationEvent): Promise<void>;
}
