import { BaseEvent } from "@business/shared-types";
export type AggregateGroup = {
    aggregateId: string;
    aggregateType: string;
    events: BaseEvent[];
};
export declare function groupByAggregate(events: BaseEvent[]): AggregateGroup[];
