import { AnalyticsBus, InMemoryEventBus } from "@business/event-bus";
export declare class FrontendAnalyticBus<TEvent> extends InMemoryEventBus<TEvent> implements AnalyticsBus<TEvent> {
    constructor();
}
