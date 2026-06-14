import { BaseEvent } from "@business/shared-types";

export function groupEventsByAggregate(
  events: BaseEvent[]
): BaseEvent[][] {

  const map =
    new Map<string, BaseEvent[]>();

  for (const event of events) {

    const key =
      `${event.aggregateType}:${event.aggregateId}`;

    const existing =
      map.get(key);

    if (existing) {

      existing.push(event);

    } else {

      map.set(key, [event]);
    }
  }

  return Array.from(map.values())
    .map(group =>
      group.sort(
        (a, b) =>
          a.logicClock -
          b.logicClock
      )
    );
}