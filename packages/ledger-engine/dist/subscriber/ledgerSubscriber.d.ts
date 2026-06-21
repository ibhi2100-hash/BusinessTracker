import { EventSubscriber } from "@business/event-bus";
import { IntegrationEvent } from "@business/shared-types";
import { LedgerEngine } from "../ledgerEngine/engine";
export declare class LedgerSubscriber implements EventSubscriber<IntegrationEvent> {
    private readonly ledgerEngine;
    constructor(ledgerEngine: LedgerEngine);
    handle(events: IntegrationEvent[]): Promise<void>;
}
