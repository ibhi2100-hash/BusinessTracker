import { IntegrationEvent } from "@business/shared-types";
export type AggregateKey = string;
/**
 * Groups IntegrationEvents by aggregate identity.
 * Safe for distributed/offline sync pipelines.
 */
export declare function groupByAggregate(events: IntegrationEvent[]): Map<AggregateKey, IntegrationEvent[]>;
