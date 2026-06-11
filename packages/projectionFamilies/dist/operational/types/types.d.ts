import { BaseEvent } from "@business/shared-types";
export interface OperationalReducer<current = any, Event = BaseEvent> {
    initialState(): current;
    reduce(state: current, event: Event): current;
}
