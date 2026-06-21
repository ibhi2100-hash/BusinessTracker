import { IntegrationEvent } from "@business/shared-types";
export interface SnapshotReducer<TState = any> {
    aggregateType: string;
    initialState(): TState;
    reduce(current: TState, event: IntegrationEvent): TState;
}
