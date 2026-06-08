import { BaseEvent } from "@business/shared-types";
import { LedgerEngineContext } from "./LedgerEngine";
export declare class LedgerEngine {
    private ctx;
    constructor(ctx: LedgerEngineContext);
    process(event: BaseEvent): Promise<void>;
}
