// operational/types.ts
import { DomainEvent } from "@business/shared-types";

export interface OperationalReducer<
  current = any,
  Event = 
> {
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