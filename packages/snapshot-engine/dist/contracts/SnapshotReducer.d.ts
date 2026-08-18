import { DomainEvent } from "@business/shared-types";
export interface SnapshotReducer<TState> {
    aggregateType: string;
    initialState(): TState;
    reduce(current: TState, event: DomainEvent): TState;
}
