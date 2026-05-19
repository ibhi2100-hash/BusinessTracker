import { Event } from "../domain/event.js";
import { deterministicSort} from "./deterministicSort.js"

export function replay(events: Event[], reducer: Function) {
  const sorted = deterministicSort(events);

  let state: any = null;

  for (const event of sorted) {
    state = reducer(state, event);
  }

  return state;
}