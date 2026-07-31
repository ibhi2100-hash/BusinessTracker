import { InMemoryEventBus, LedgerBus } from "@business/event-bus";

export class FrontendLedgerBus<TEvent>
extends InMemoryEventBus<TEvent>
implements LedgerBus<TEvent> {
    constructor(){
        super()
    }
}