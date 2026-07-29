import { AnalyticsBus, InMemoryEventBus } from "@business/event-bus";

export class FrontendAnalyticBus<TEvent>
extends InMemoryEventBus<TEvent>
implements AnalyticsBus<TEvent> {
    constructor(){
        super()
    }
    
}