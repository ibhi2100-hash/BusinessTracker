import { InMemoryEventBus, ProjectionBus } from "@business/event-bus";

export class FrontendProjectionBus<TEvent>
extends InMemoryEventBus<TEvent> 
implements ProjectionBus<TEvent> {
    constructor(){
        super()
    }
}