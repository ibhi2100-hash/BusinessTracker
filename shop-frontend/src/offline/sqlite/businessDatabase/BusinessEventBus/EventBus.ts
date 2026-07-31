import { EventBus, InMemoryEventBus, ProjectionBus } from "@business/event-bus";

export class FrontEndEventBus<TEvent>
extends InMemoryEventBus<TEvent>
implements EventBus<TEvent> {
    constructor(){
        super()
    }
}