import { BaseEvent } from "@business/shared-types";


export type AggregateGroup = {

  aggregateId: string;

  aggregateType: string;

  events: BaseEvent[];

};

export function groupByAggregate(
  events: BaseEvent[]
): AggregateGroup[] {

  const groups = new Map<string, AggregateGroup>();

  for (const event of events) {

    const key =
      `${event.aggregateType}:${event.aggregateId}`;

    let group = groups.get(key);

    if (!group) {

      group = {

        aggregateId: event.aggregateId,

        aggregateType: event.aggregateType,

        events: []

      };

      groups.set(key, group);

    }

    group.events.push(event);

  }

  return [...groups.values()];

}