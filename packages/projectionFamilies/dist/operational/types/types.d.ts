import { IntegrationEvent } from "@business/shared-types";
export interface OperationalReducer<current = any, Event = IntegrationEvent> {
    initialState(): current;
    reduce(state: current, event: Event): current;
}
export interface ProjectionHandler {
    projection: string;
    reducer: {
        reduce(current: any, event: IntegrationEvent): any;
    };
    aggregateResolver?: (event: IntegrationEvent) => string;
}
