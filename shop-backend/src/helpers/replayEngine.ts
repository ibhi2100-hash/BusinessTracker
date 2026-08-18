import { DomainEvent } from "@business/shared-types";
import { deterministicSort} from "./deterministicSort.js"

export function replay(events: DomainEvent[], reducer: Function) {
  const sorted = deterministicSort(events);

  let state: any = null;

  for (const event of sorted) {
    state = reducer(state, event);
  }

  return state;
}