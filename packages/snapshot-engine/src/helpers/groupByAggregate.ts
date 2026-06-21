import { IntegrationEvent } from "@business/shared-types";

export type AggregateKey = string;

/**
 * Groups IntegrationEvents by aggregate identity.
 * Safe for distributed/offline sync pipelines.
 */
export function groupByAggregate(
  events: IntegrationEvent[]
): Map<AggregateKey, IntegrationEvent[]> {

  const grouped = new Map<AggregateKey, IntegrationEvent[]>();

  for (const event of events) {

    // Defensive guards (integration events are untrusted input)
    if (!event?.aggregateId || !event?.aggregateType) {
      console.error("INVALID_INTEGRATION_EVENT", event);
      continue;
    }

    const key = buildAggregateKey(event);

    const bucket = grouped.get(key);

    if (!bucket) {
      grouped.set(key, [event]);
    } else {
      bucket.push(event);
    }
  }

  // Ensure deterministic ordering per aggregate stream
  for (const [key, bucket] of grouped) {

    bucket.sort((a, b) => {

      // 1. Server-authoritative version (if exists)
      const av = a.aggregateVersion ?? 0;
      const bv = b.aggregateVersion ?? 0;

      if (av !== bv) return av - bv;

      // 3. Final tie-breaker (ensures deterministic sort)
      return a.id.localeCompare(b.id);
    });

    grouped.set(key, bucket);
  }

  return grouped;
}

/**
 * Stable aggregate identity key
 */
function buildAggregateKey(event: IntegrationEvent): string {
  return `${event.aggregateType}:${event.aggregateId}`;
}