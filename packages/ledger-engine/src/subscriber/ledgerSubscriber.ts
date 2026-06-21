import { EventSubscriber } from "@business/event-bus";
import { IntegrationEvent } from "@business/shared-types";
import { LedgerEngine } from "../ledgerEngine/engine";

export class LedgerSubscriber implements EventSubscriber<IntegrationEvent> {
    constructor(
        private readonly ledgerEngine: LedgerEngine
    ){}
    async handle(events: IntegrationEvent[]): Promise<void> {
        for (const event of events) {
            await this.ledgerEngine.process(event)
        }
    }
}