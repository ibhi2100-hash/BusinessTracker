import { EventSubscriber } from "@business/event-bus";
import { LedgerEngine } from "../ledgerEngine/engine";

export class LedgerSubscriber implements EventSubscriber<TEvent> {
    constructor(
        private readonly ledgerEngine: LedgerEngine
    ){}
    async handle(events: TEvent[]): Promise<void> {
        for (const event of events) {
            await this.ledgerEngine.process(event)
        }
    }
}