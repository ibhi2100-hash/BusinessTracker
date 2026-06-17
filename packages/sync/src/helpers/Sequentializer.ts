import { BaseEvent } from "@business/shared-types";

export function isSequential(events: BaseEvent[]) {
  for (let i = 1; i < events.length; i++) {
    if (
      events[i].aggregateVersion !==
      (events[i - 1].aggregateVersion ?? 0) + 1
    ) {
      return false;
    }
  }
  return true;
}