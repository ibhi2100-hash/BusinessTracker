import { financeEventType } from "./eventGroups/financeEvent";
import { InventoryEventType } from "./eventGroups/inventoryEvents";
import { salesEventType } from "./eventGroups/salesEvent";
import { BusinessEventTypes } from "./eventGroups/businessEvents";
import { OpeninigEventType } from "./eventGroups/openingEvents";

export type EventType =
  | typeof financeEventType[keyof typeof financeEventType]
  | typeof InventoryEventType[keyof typeof InventoryEventType]
  | typeof salesEventType[keyof typeof salesEventType]
  | typeof BusinessEventTypes[keyof typeof BusinessEventTypes]
  | typeof OpeninigEventType[keyof typeof OpeninigEventType];